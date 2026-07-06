import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Interview } from "@/models/Interview";
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
      await Interview.deleteMany({});
      await Slot.deleteMany({});
      
      // Reset users state
      await User.updateMany({}, {
        $set: {
          isEmailVerified: false,
          hasSubmittedInterview: false,
          emailVerificationOtp: null,
          emailVerificationOtpExpires: null
        }
      });

      console.log("🗑️ [Recruitment DB Reset] Cleared slots and interviews, reset user states.");
      return NextResponse.json({ success: true, message: "Recruitment database successfully reset to clean state." });
    }

    // 2. Otherwise execute Slot Generation range
    const { startDate, endDate, startTime, endTime, duration = 60 } = body;

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
          maxStudents: 4,
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
