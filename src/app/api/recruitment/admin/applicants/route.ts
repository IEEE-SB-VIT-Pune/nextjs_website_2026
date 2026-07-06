import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { Interview } from "@/models/Interview";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const User = mongoose.models.User || mongoose.model("User");
    const user = await User.findById(payload.id);
    if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin required" }, { status: 403 });
    }

    const applicants = await Interview.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: applicants.length, data: applicants });
  } catch (error: any) {
    console.error("GET /api/recruitment/admin/applicants error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
