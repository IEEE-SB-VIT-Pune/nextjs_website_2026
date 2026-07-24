import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { SystemConfig } from "@/models/SystemConfig";
import { checkGoogleTokenStatus } from "@/lib/google";

export const dynamic = "force-dynamic";

const defaultConfig = {
  interviewForm: {
    isLive: true,
    mode: "MANUAL", // MANUAL or AUTOMATIC
    start: null,
    end: null,
  },
  slotBooking: {
    isLive: true,
    mode: "MANUAL", // MANUAL or AUTOMATIC
    start: null,
    end: null,
  },
};

export async function GET() {
  try {
    await connectDB();
    
    let interviewFormVal = defaultConfig.interviewForm;
    let slotBookingVal = defaultConfig.slotBooking;

    const interviewFormDoc = await SystemConfig.findOne({ key: "interviewForm" });
    if (interviewFormDoc) {
      interviewFormVal = { ...defaultConfig.interviewForm, ...interviewFormDoc.value };
    }

    const slotBookingDoc = await SystemConfig.findOne({ key: "slotBooking" });
    if (slotBookingDoc) {
      slotBookingVal = { ...defaultConfig.slotBooking, ...slotBookingDoc.value };
    }

    // Determine current live states dynamically based on mode and time
    const now = new Date();
    
    let isInterviewFormCurrentlyLive = interviewFormVal.isLive;
    if (interviewFormVal.mode === "AUTOMATIC") {
      const start = interviewFormVal.start ? new Date(interviewFormVal.start) : null;
      const end = interviewFormVal.end ? new Date(interviewFormVal.end) : null;
      isInterviewFormCurrentlyLive = !!(start && end && now >= start && now <= end);
    }

    let isSlotBookingCurrentlyLive = slotBookingVal.isLive;
    if (slotBookingVal.mode === "AUTOMATIC") {
      const start = slotBookingVal.start ? new Date(slotBookingVal.start) : null;
      const end = slotBookingVal.end ? new Date(slotBookingVal.end) : null;
      isSlotBookingCurrentlyLive = !!(start && end && now >= start && now <= end);
    }

    const tokenStatus = await checkGoogleTokenStatus();

    return NextResponse.json({
      success: true,
      data: {
        interviewForm: {
          ...interviewFormVal,
          isCurrentlyLive: isInterviewFormCurrentlyLive,
        },
        slotBooking: {
          ...slotBookingVal,
          isCurrentlyLive: isSlotBookingCurrentlyLive,
        },
        isGoogleTokenExpired: tokenStatus.isExpired,
      },
    });
  } catch (error: any) {
    console.error("GET /api/recruitment/config error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

