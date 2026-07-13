import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { verifyJWT } from "@/lib/jwt";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) return null;

  await connectDB();
  const currentUser = await User.findById(payload.id);
  if (!currentUser || currentUser.status !== "ACTIVE" || currentUser.role !== "ADMIN") {
    return null;
  }
  return currentUser;
}

// GET all users (ADMIN only) - simple list of users
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Return simple read-only details of all registered users in the database
    const users = await User.find({}, { name: 1, email: 1, role: 1, status: 1, createdAt: 1 }).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
