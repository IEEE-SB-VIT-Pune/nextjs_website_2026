import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address").lowercase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid registration inputs", errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check email availability
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists" },
        { status: 400 }
      );
    }

    // Create candidate account - role defaults to USER, status to ACTIVE
    const newUser = new User({
      name,
      email,
      password,
      role: "USER",
      status: "ACTIVE",
      isEmailVerified: false,
      hasSubmittedInterview: false,
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: "Account registered successfully! Please log in to verify your email.",
    });
  } catch (error: any) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
