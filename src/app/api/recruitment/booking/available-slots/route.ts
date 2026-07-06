import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Slot } from "@/models/Slot";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await Slot.find({ isActive: true, dateTime: { $gte: today } })
      .sort({ dateTime: 1 })
      .lean();

    const formattedSlots = slots.map((slot: any) => ({
      id: slot._id.toString(),
      dateTime: slot.dateTime,
      endDateTime: slot.endDateTime,
      maxStudents: slot.maxStudents,
      availableSpots: slot.maxStudents - slot.students.length,
      isFull: slot.students.length >= slot.maxStudents,
      googleEventId: slot.googleEventId,
      studentsCount: slot.students.length,
    }));

    return NextResponse.json({
      success: true,
      data: formattedSlots,
    });
  } catch (error: any) {
    console.error("GET /api/recruitment/booking/available-slots error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
