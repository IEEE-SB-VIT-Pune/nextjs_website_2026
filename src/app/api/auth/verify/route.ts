import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, valid: false, message: "Token not found" },
        { status: 401 }
      );
    }

    // 1. Verify JWT
    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, valid: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // 2. Connect to database & fetch user
    await connectDB();
    const user = await User.findById(payload.id);

    if (!user) {
      return NextResponse.json(
        { success: false, valid: false, message: "User does not exist" },
        { status: 401 }
      );
    }

    // 3. Check if user is ACTIVE
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, valid: false, message: "User is inactive" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Verification endpoint error:", error);
    return NextResponse.json(
      { success: false, valid: false, message: "Server connection error" },
      { status: 500 }
    );
  }
}
