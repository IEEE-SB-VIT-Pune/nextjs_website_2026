import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { signJWT } from "@/lib/jwt";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Validate fields using Zod
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;

    // 2. Fetch User and verify status
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Your account is inactive. Please contact the administrator." },
        { status: 403 }
      );
    }

    // 3. Verify Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Generate JWT
    const payload = {
      id: user._id.toString(),
      role: user.role,
      status: user.status,
    };
    
    // Cookie expiry
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
    const token = await signJWT(payload, rememberMe ? "30d" : "1d");

    // 5. Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // 6. Set HTTP-only secure cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });

    const userObj = user.toJSON();

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userObj,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
