import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Event } from "@/models/Event";
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

// POST: Add new event
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, dateText, timeText, prizePool, teamSize, entryFee, venue, prizeBreakdown, type, image } = body;

    if (!title || !description || !dateText) {
      return NextResponse.json({ success: false, message: "Title, description, and date are required" }, { status: 400 });
    }

    const newEvent = new Event({
      title,
      description,
      category,
      dateText,
      timeText,
      prizePool,
      teamSize,
      entryFee,
      venue,
      prizeBreakdown,
      type,
      image,
    });

    await newEvent.save();

    return NextResponse.json({ success: true, message: "Event added successfully", event: newEvent });
  } catch (error: any) {
    console.error("POST /api/admin/events error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

// PUT: Edit existing event
export async function PUT(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, category, dateText, timeText, prizePool, teamSize, entryFee, venue, prizeBreakdown, type, image } = body;

    if (!id || !title || !description || !dateText) {
      return NextResponse.json({ success: false, message: "ID, title, description, and date are required" }, { status: 400 });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        dateText,
        timeText,
        prizePool,
        teamSize,
        entryFee,
        venue,
        prizeBreakdown,
        type,
        image,
      },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event updated successfully", event: updatedEvent });
  } catch (error: any) {
    console.error("PUT /api/admin/events error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

// DELETE: Delete event
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Event ID is required" }, { status: 400 });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/admin/events error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
