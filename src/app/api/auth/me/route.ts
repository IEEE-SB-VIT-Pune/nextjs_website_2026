import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { verifyJWT } from "@/lib/jwt";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
});

// GET currently logged-in user profile
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session not found" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid session token" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(payload.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "User account is inactive" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}

// PUT update profile information
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session not found" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid session token" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "User account is inactive" },
        { status: 403 }
      );
    }

    user.name = name;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("PUT /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
