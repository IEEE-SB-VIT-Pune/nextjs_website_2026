import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";

export const dynamic = "force-dynamic";
import { User } from "@/models/User";
import { SystemConfig } from "@/models/SystemConfig";
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

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const configs = await SystemConfig.find({});
    return NextResponse.json({ success: true, configs });
  } catch (error: any) {
    console.error("GET /api/admin/config error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, message: "Key and value are required" }, { status: 400 });
    }

    await SystemConfig.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: `Configuration for ${key} updated successfully.` });
  } catch (error: any) {
    console.error("POST /api/admin/config error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
