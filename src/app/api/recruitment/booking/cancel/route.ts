import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { Slot } from "@/models/Slot";
import { verifyJWT } from "@/lib/jwt";
import {
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  logCancellationToGoogleSheet,
} from "@/lib/google";

export async function POST() {
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

    await connectDB();
    const slot = await Slot.findOne({
      "students.studentId": payload.id,
      isActive: true,
    });

    if (!slot) {
      return NextResponse.json({ success: false, message: "No active slot booking found for this profile." }, { status: 404 });
    }

    // Filter out user
    const studentBooking = slot.students.find((s: any) => s.studentId.toString() === payload.id);
    const emailToLog = studentBooking ? studentBooking.studentEmail : "";
    const eventIdToLog = slot.googleEventId; // Store before resetting!
    
    slot.students = slot.students.filter((s: any) => s.studentId.toString() !== payload.id);

    // Google Calendar Sync
    try {
      if (slot.students.length === 0 && slot.googleEventId) {
        await deleteGoogleCalendarEvent(slot.googleEventId);
        slot.googleEventId = null;
      } else if (slot.googleEventId) {
        const eventDetails = {
          attendees: slot.students.map((s: any) => ({ email: s.studentEmail })),
        };
        await updateGoogleCalendarEvent(slot.googleEventId, eventDetails);
      }
    } catch (calErr: any) {
      console.error("[Google Calendar Cancel Sync Error]:", calErr.message);
    }

    await slot.save();

    // Google Sheets Sync
    if (emailToLog) {
      try {
        await logCancellationToGoogleSheet(emailToLog, eventIdToLog);
      } catch (sheetErr: any) {
        console.error("[Google Sheets Cancel Sync Error]:", sheetErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Interview slot booking cancelled successfully!",
    });
  } catch (error: any) {
    console.error("POST /api/recruitment/booking/cancel error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
