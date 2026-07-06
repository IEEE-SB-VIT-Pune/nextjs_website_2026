import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { Slot } from "@/models/Slot";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
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
      return NextResponse.json({ success: false, message: "No booking found for this candidate" });
    }

    const studentBooking = slot.students.find(
      (s: any) => s.studentId.toString() === payload.id
    );

    return NextResponse.json({
      success: true,
      data: {
        slotId: slot._id.toString(),
        dateTime: slot.dateTime,
        endDateTime: slot.endDateTime,
        panel: studentBooking ? studentBooking.panel : 1,
        bookedAt: studentBooking ? studentBooking.bookedAt : null,
      },
    });
  } catch (error: any) {
    console.error("GET /api/recruitment/booking/my-booking error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
