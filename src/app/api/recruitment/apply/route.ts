import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Interview } from "@/models/Interview";
import { verifyJWT } from "@/lib/jwt";
import { logResponseToGoogleSheet, checkGoogleTokenStatus } from "@/lib/google";
import { SystemConfig } from "@/models/SystemConfig";

const recruitmentFormSchema = z.object({
  fullname: z.string().min(1, "Name is required").trim(),
  phone_number: z.string().min(10, "WhatsApp number must be at least 10 digits").trim(),
  branch: z.string().min(1, "Branch selection is required"),
  whyPart: z.string().min(1, "Motivation field is required").trim(),
  domain: z.array(z.string()).min(1, "Select at least one domain preference"),
  whyWork: z.string().min(1, "Required field").trim(),
  skills: z.string().min(1, "Skills lists are required").trim(),
  projects: z.string().optional().default(""),
  expectations: z.string().optional().default(""),
  vagera: z.string().optional().default(""),
  github: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized: Please log in first" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, message: "Unauthorized: Invalid session" }, { status: 401 });
    }

    const tokenStatus = await checkGoogleTokenStatus();
    if (tokenStatus.isExpired) {
      return NextResponse.json({
        success: false,
        message: "We are experiencing technical issues with our Google Sheets integration (Google Token has expired or is invalid). Form submissions are temporarily disabled. Please contact the developer immediately to update the Google refresh token."
      }, { status: 503 });
    }

    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Must be a USER and verified
    if (user.role !== "USER") {
      return NextResponse.json({ success: false, message: "Forbidden: Only regular candidates can apply." }, { status: 403 });
    }

    // Check if interview form is currently live
    const interviewFormDoc = await SystemConfig.findOne({ key: "interviewForm" });
    const configVal = interviewFormDoc ? interviewFormDoc.value : { isLive: false, mode: "MANUAL", start: null, end: null };
    
    let isLive = configVal.isLive;
    if (configVal.mode === "AUTOMATIC") {
      const now = new Date();
      const start = configVal.start ? new Date(configVal.start) : null;
      const end = configVal.end ? new Date(configVal.end) : null;
      isLive = !!(start && end && now >= start && now <= end);
    }
    
    if (!isLive) {
      return NextResponse.json({ success: false, message: "Recruitment questionnaire is currently closed." }, { status: 400 });
    }

    if (!user.isEmailVerified) {
      return NextResponse.json({ success: false, message: "Verification required: Please verify your email first." }, { status: 400 });
    }

    if (user.hasSubmittedInterview) {
      return NextResponse.json({ success: false, message: "Application already submitted. You may now book a slot." }, { status: 400 });
    }

    const body = await request.json();
    const validation = recruitmentFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid application inputs", errors: validation.error.format() }, { status: 400 });
    }

    const interviewData = {
      userId: user._id,
      email: user.email,
      ...validation.data,
    };

    const application = new Interview(interviewData);
    await application.save();

    user.hasSubmittedInterview = true;
    await user.save();

    // Google Sheets Response Sync
    try {
      await logResponseToGoogleSheet({
        fullname: validation.data.fullname,
        email: user.email,
        phone_number: validation.data.phone_number,
        github: validation.data.github,
        linkedin: validation.data.linkedin,
        branch: validation.data.branch,
        whyPart: validation.data.whyPart,
        domain: validation.data.domain,
        whyWork: validation.data.whyWork,
        skills: validation.data.skills,
        projects: validation.data.projects,
        expectations: validation.data.expectations,
        vagera: validation.data.vagera,
      });
    } catch (sheetErr: any) {
      console.error("[Google Sheets Response Sync Error]:", sheetErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Redirecting you to Slot Booking.",
      data: application.toJSON(),
    });
  } catch (error: any) {
    console.error("POST /api/recruitment/apply error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
