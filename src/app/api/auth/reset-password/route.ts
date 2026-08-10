import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  otp: z.string().length(6, "OTP code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
      return NextResponse.json(
        { success: false, message: firstError || "Invalid input data" },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = validation.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    // Verify OTP code & expiration
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP code. Please check and try again." },
        { status: 400 }
      );
    }

    if (!user.resetPasswordOtpExpires || new Date() > new Date(user.resetPasswordOtpExpires)) {
      return NextResponse.json(
        { success: false, message: "OTP code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Set new password (pre-save hook in User model will hash this automatically)
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    console.log(`[Password Reset Success] Password updated for ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
