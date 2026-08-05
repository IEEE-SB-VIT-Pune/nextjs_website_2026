import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Interview } from "@/models/Interview";
import { Slot } from "@/models/Slot";
import { verifyJWT } from "@/lib/jwt";
import { SystemConfig } from "@/models/SystemConfig";
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  logBookingToGoogleSheet,
  checkGoogleTokenStatus,
} from "@/lib/google";

const bookSlotSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
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
        message: "We are experiencing technical issues with our Google integration (Google Token has expired or is invalid). Slot booking is temporarily disabled. Please contact the developer immediately to update the Google refresh token."
      }, { status: 503 });
    }

    const body = await request.json();
    const validation = bookSlotSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Slot ID is required" }, { status: 400 });
    }

    const { slotId } = validation.data;

    await connectDB();

    // Check slot booking configuration
    const slotBookingDoc = await SystemConfig.findOne({ key: "slotBooking" });
    const configVal = slotBookingDoc ? slotBookingDoc.value : { isLive: false, mode: "MANUAL", start: null, end: null };
    
    let isLive = configVal.isLive;
    if (configVal.mode === "AUTOMATIC") {
      const now = new Date();
      const start = configVal.start ? new Date(configVal.start) : null;
      const end = configVal.end ? new Date(configVal.end) : null;
      isLive = !!(start && end && now >= start && now <= end);
    }
    
    if (!isLive) {
      return NextResponse.json({ success: false, message: "Slot booking is currently closed." }, { status: 400 });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Check application status
    if (!user.hasSubmittedInterview) {
      return NextResponse.json({ success: false, message: "Please complete the recruitment application questionnaire first." }, { status: 400 });
    }

    // Retrieve candidate application profile for Sheets sync
    const candidate = await Interview.findOne({ userId: user._id });
    if (!candidate) {
      return NextResponse.json({ success: false, message: "No recruitment application record found for this profile." }, { status: 404 });
    }

    // Check existing booking
    const existingBooking = await Slot.findOne({
      "students.studentId": user._id,
      isActive: true,
    });
    if (existingBooking) {
      return NextResponse.json({ success: false, message: "You already have a booked slot. Please cancel it before rescheduling." }, { status: 400 });
    }

    // Fetch Slot details
    let slot = await Slot.findById(slotId);
    if (!slot || !slot.isActive) {
      return NextResponse.json({ success: false, message: "Selected interview slot is unavailable or inactive." }, { status: 404 });
    }

    if (slot.students.length >= slot.maxStudents) {
      return NextResponse.json({ success: false, message: "Selected slot is fully booked." }, { status: 400 });
    }

    // Panel assignment (1-4 concurrency)
    const assignedPanel = slot.students.length + 1;

    // Concurrency protection: verify slot size matches our read state to prevent double booking/overbooking
    const updateResult = await Slot.updateOne(
      {
        _id: slotId,
        isActive: true,
        students: { $size: slot.students.length }
      },
      {
        $push: {
          students: {
            studentId: user._id,
            studentName: user.name,
            studentEmail: user.email,
            panel: assignedPanel,
          }
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Booking conflict: This slot was updated by another candidate. Please try again." 
      }, { status: 409 });
    }

    // Retrieve the updated slot details to sync with Google API
    const updatedSlot = await Slot.findById(slotId);
    if (!updatedSlot) {
      return NextResponse.json({ success: false, message: "Error completing slot booking." }, { status: 500 });
    }
    slot = updatedSlot;

    // Google Calendar Sync
    try {
      if (slot.students.length === 1) {
        // First student booking: create calendar event
        const eventDetails = {
          summary: `IEEE Execom Interview Slot - ${new Date(slot.dateTime).toLocaleDateString("en-IN")}`,
          description: `Simulated panel interview slot for IEEE VIT Pune recruitment.`,
          startTime: new Date(slot.dateTime).toISOString(),
          endTime: new Date(slot.endDateTime).toISOString(),
          attendees: [{ email: user.email }],
        };
        const calEvent = await createGoogleCalendarEvent(eventDetails);
        if (calEvent) {
          slot.googleEventId = calEvent.id;
          await slot.save();
        }
      } else if (slot.googleEventId) {
        // Append candidate attendee email to existing event details
        const eventDetails = {
          attendees: slot.students.map((s: any) => ({ email: s.studentEmail })),
        };
        await updateGoogleCalendarEvent(slot.googleEventId, eventDetails);
      }
    } catch (calErr: any) {
      console.error("[Google Calendar Sync Error]:", calErr.message);
    }

    // Google Sheets Sync
    try {
      await logBookingToGoogleSheet(
        {
          fullname: candidate.fullname,
          email: candidate.email,
          phone_number: candidate.phone_number,
          branch: candidate.branch,
          domain: candidate.domain,
        },
        slot,
        assignedPanel
      );
    } catch (sheetErr: any) {
      console.error("[Google Sheets Sync Error]:", sheetErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Interview slot booked successfully!",
      data: {
        slotId: slot._id.toString(),
        dateTime: slot.dateTime,
        panel: assignedPanel,
      },
    });
  } catch (error: any) {
    console.error("POST /api/recruitment/booking/book error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
