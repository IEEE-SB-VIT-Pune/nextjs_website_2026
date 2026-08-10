import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { sendMail } from "@/lib/mailer";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // For security and privacy, respond consistently even if email doesn't exist
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists, a password reset OTP code has been sent.",
      });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    user.resetPasswordOtp = otpCode;
    user.resetPasswordOtpExpires = otpExpires;
    await user.save();

    console.log(`[Password Reset] OTP for ${user.email} is: ${otpCode}`);

    const mailResult = await sendMail({
      to: user.email,
      subject: "Password Reset Request - IEEE Student Branch VIT Pune",
      text: `Hello ${user.name},\n\nYour 6-digit OTP code to reset your password is: ${otpCode}.\nIt is valid for 15 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0066cc; margin-top: 0;">IEEE Student Branch VIT Pune</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset the password for your account (<code>${user.email}</code>).</p>
          <p>Please use the following 6-digit OTP code to complete your password reset:</p>
          <div style="background: #f4f6f9; border: 1px border-dashed #0066cc; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 20px 0; border-radius: 6px; color: #0066cc;">
            ${otpCode}
          </div>
          <p style="font-size: 13px; color: #666;">This OTP code will expire in <strong>15 minutes</strong>.</p>
          <p style="font-size: 13px; color: #666;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
          <p style="font-size: 11px; color: #888; text-align: center;">© 2026 IEEE VIT Pune Student Branch. All rights reserved.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: mailResult.isMock
        ? "Password reset OTP code sent! (Check console log in dev mode if SMTP is unconfigured)"
        : "Password reset OTP code sent successfully to your email.",
      isMock: mailResult.isMock,
    });
  } catch (error: any) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
