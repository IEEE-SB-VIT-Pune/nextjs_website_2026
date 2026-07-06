import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { verifyJWT } from "@/lib/jwt";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized: Please log in first" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, message: "Unauthorized: Invalid session" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: true, message: "Email is already verified", isVerified: true });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.emailVerificationOtp = otpCode;
    user.emailVerificationOtpExpires = otpExpires;
    await user.save();

    // Helper function to remove surrounding single or double quotes
    // from environment variable values. This is useful because env
    // variables may be defined with quotes. Next.js automatically
    // handles this at server startup, but this helper ensures the
    // value is normalized whenever it is used.
    const cleanEnvVar = (val: string | undefined) => {
      if (!val) return "";
      return val.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    };

    const smtpHost = cleanEnvVar(process.env.SMTP_HOST);
    const smtpPort = Number(cleanEnvVar(process.env.SMTP_PORT));
    const smtpSecure = cleanEnvVar(process.env.SMTP_SECURE) === "true";
    const smtpUser = cleanEnvVar(process.env.SMTP_USER);
    const smtpPass = cleanEnvVar(process.env.SMTP_PASS);

    const isMock = !smtpHost || smtpHost.includes("ethereal.email");

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      host: smtpHost || "smtp.ethereal.email",
      port: smtpPort || 587,
      secure: smtpSecure,
      auth: {
        user: smtpUser || "mock-user@clubcms.com",
        pass: smtpPass || "mock-pass",
      },
    });


    try {
      await transporter.sendMail({
        from: `"IEEE VIT Pune Recruitment" <${smtpUser || "ieeevitteam@gmail.com"}>`,
        to: user.email,
        subject: "Email Verification OTP - IEEE VIT Pune Recruitment",
        text: `Your 6-digit OTP code for recruitment email verification is: ${otpCode}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0066cc;">IEEE Student Branch VIT Pune</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for initiating your recruitment application. To verify your email, please use the following OTP code:</p>
            <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
              ${otpCode}
            </div>
            <p>This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="font-size: 11px; color: #888;">© 2026 IEEE VIT Pune Student Branch. All rights reserved.</p>
          </div>
        `,
      });
      console.log(`[SMTP Success] Sent OTP ${otpCode} to ${user.email}`);
    } catch (mailError: any) {
      console.log("------------------------------------------");
      console.log(`[SMTP Error] Failed to send email via SMTP:`);
      console.log(`To: ${user.email}`);
      console.log(`OTP Code: ${otpCode}`);
      console.log(`err :: ${mailError}`);
      console.log("------------------------------------------");

      if (!isMock) {
        return NextResponse.json({
          success: false,
          message: `Failed to send verification email: ${mailError?.message || mailError}`,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: isMock
        ? "Verification OTP code sent successfully. Please check your terminal console."
        : "Verification OTP code sent successfully to your email.",
    });
  } catch (error: any) {
    console.error("POST /api/recruitment/otp/send error:", error);
    return NextResponse.json({ success: false, message: "An internal server error occurred" }, { status: 500 });
  }
}
