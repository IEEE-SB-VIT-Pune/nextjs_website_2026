import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Slot } from "@/models/Slot";
import { verifyJWT } from "@/lib/jwt";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) return null;

  await connectDB();
  const user = await User.findById(payload.id);
  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

// GET all slots for admin review
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const slots = await Slot.find({}).sort({ dateTime: 1 }).lean();
    return NextResponse.json({ success: true, slots });
  } catch (error: any) {
    console.error("GET /api/recruitment/admin/slots error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

// POST handle slot generation & system resets
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();

    // 1. Check for Reset command
    if (body.action === "reset") {
      await Slot.deleteMany({});
      
      console.log("🗑️ [Recruitment DB Reset] Cleared all interview slots.");
      return NextResponse.json({ success: true, message: "All interview slots successfully deleted." });
    }

    // 2. Otherwise execute Slot Generation range
    const { startDate, endDate, startTime, endTime, duration = 60, maxStudents = 4 } = body;

    if (!startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json({ success: false, message: "All parameters (startDate, endDate, startTime, endTime) are required" }, { status: 400 });
    }

    const slotsList = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let slotTime = new Date(current);
      slotTime.setHours(startHour, startMinute, 0, 0);

      const dayEndTime = new Date(current);
      dayEndTime.setHours(endHour, endMinute, 0, 0);

      while (slotTime < dayEndTime) {
        const slotEndTime = new Date(slotTime.getTime() + duration * 60000);
        
        slotsList.push({
          dateTime: new Date(slotTime),
          endDateTime: slotEndTime,
          students: [],
          maxStudents: Number(maxStudents),
          isActive: true
        });

        slotTime.setTime(slotTime.getTime() + duration * 60000);
      }
    }

    // Save slots
    const savedSlots = await Slot.insertMany(slotsList);
    console.log(`📅 Created ${savedSlots.length} interview slots sequentially.`);

    return NextResponse.json({
      success: true,
      message: `${savedSlots.length} interview slots generated successfully!`,
      slots: savedSlots,
    });
  } catch (error: any) {
    console.error("POST /api/recruitment/admin/slots error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

// PATCH edit single slot status or students limit (ADMIN only)
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, isActive, maxStudents } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Slot ID is required" }, { status: 400 });
    }

    const updateFields: any = {};
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (maxStudents !== undefined) updateFields.maxStudents = Number(maxStudents);

    const updatedSlot = await Slot.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    if (!updatedSlot) {
      return NextResponse.json({ success: false, message: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Slot updated successfully", slot: updatedSlot });
  } catch (error: any) {
    console.error("PATCH /api/recruitment/admin/slots error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

// DELETE single slot (ADMIN only)
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Slot ID is required" }, { status: 400 });
    }

    const deletedSlot = await Slot.findByIdAndDelete(id);
    if (!deletedSlot) {
      return NextResponse.json({ success: false, message: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Slot deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/recruitment/admin/slots error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
