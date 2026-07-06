import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { verifyJWT } from "@/lib/jwt";

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
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

    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid OTP format" }, { status: 400 });
    }

    const { otp } = validation.data;

    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: "Email is already verified", isVerified: true });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires) {
      return NextResponse.json({ success: false, message: "No active verification requests found. Please request a new OTP code." }, { status: 400 });
    }

    // Check expiry
    if (new Date() > new Date(user.emailVerificationOtpExpires)) {
      return NextResponse.json({ success: false, message: "Verification OTP code has expired. Please request a new code." }, { status: 400 });
    }

    // Verify code
    if (user.emailVerificationOtp !== otp) {
      return NextResponse.json({ success: false, message: "Incorrect OTP code. Please try again." }, { status: 400 });
    }

    // Set verified
    user.isEmailVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Email address verified successfully!",
      isVerified: true,
    });
  } catch (error: any) {
    console.error("POST /api/recruitment/otp/verify error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
