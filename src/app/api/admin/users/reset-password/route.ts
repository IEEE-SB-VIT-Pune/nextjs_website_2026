import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { verifyJWT } from "@/lib/jwt";
import { sendMail } from "@/lib/mailer";

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

const adminResetSchema = z.object({
  userId: z.string().optional(),
  email: z.string().optional(),
  action: z.enum(["set_password", "send_otp"]).default("set_password"),
  newPassword: z.string().optional(),
  notifyUser: z.boolean().default(true),
});

function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let pwd = "Ieee#";
  for (let i = 0; i < 6; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Administrator access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = adminResetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload parameters" },
        { status: 400 }
      );
    }

    const { userId, email, action, newPassword, notifyUser } = validation.data;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, message: "Please provide either a User ID or an Email ID" },
        { status: 400 }
      );
    }

    await connectDB();

    let query: any = {};
    if (userId) {
      query._id = userId;
    } else if (email) {
      query.email = email.toLowerCase().trim();
    }

    const targetUser = await User.findOne(query);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: `User not found matching ${email || userId}` },
        { status: 404 }
      );
    }

    if (action === "set_password") {
      const finalPassword = newPassword && newPassword.trim().length >= 8 
        ? newPassword.trim() 
        : generateRandomPassword();

      targetUser.password = finalPassword;
      await targetUser.save();

      console.log(`[Admin Password Reset] Admin ${admin.email} set new password for ${targetUser.email}`);

      let mailStatus = { success: false, isMock: true, message: "Notification disabled" };
      if (notifyUser) {
        mailStatus = await sendMail({
          to: targetUser.email,
          subject: "Your Account Password Has Been Updated - IEEE VIT Pune",
          text: `Hello ${targetUser.name},\n\nAn administrator has updated your password for IEEE Student Branch VIT Pune portal.\n\nYour new temporary password is: ${finalPassword}\n\nPlease log in at ${process.env.NEXT_PUBLIC_APP_URL || "our website"} and change your password.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #0066cc; margin-top: 0;">IEEE Student Branch VIT Pune</h2>
              <p>Hello <strong>${targetUser.name}</strong>,</p>
              <p>Your password for the IEEE VIT Pune portal has been updated by an administrator.</p>
              <div style="background: #f4f6f9; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Account Email:</strong> ${targetUser.email}</p>
                <p style="margin: 0; font-size: 16px;"><strong>New Password:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #1e293b;">${finalPassword}</code></p>
              </div>
              <p style="font-size: 13px; color: #666;">We recommend logging in with this new password and updating your password under profile settings.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
              <p style="font-size: 11px; color: #888; text-align: center;">© 2026 IEEE VIT Pune Student Branch. All rights reserved.</p>
            </div>
          `,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Password successfully updated for user ${targetUser.email}.`,
        newPassword: finalPassword,
        user: {
          id: targetUser._id.toString(),
          name: targetUser.name,
          email: targetUser.email,
        },
        mailSent: notifyUser ? mailStatus.success : false,
      });
    } else {
      // action === "send_otp"
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

      targetUser.resetPasswordOtp = otpCode;
      targetUser.resetPasswordOtpExpires = otpExpires;
      await targetUser.save();

      console.log(`[Admin Triggered OTP] Sent reset OTP ${otpCode} to ${targetUser.email}`);

      const mailStatus = await sendMail({
        to: targetUser.email,
        subject: "Password Reset Request from Admin - IEEE VIT Pune",
        text: `Hello ${targetUser.name},\n\nAn administrator has initiated a password reset for your account.\n\nYour 6-digit OTP code is: ${otpCode} (valid for 15 minutes).`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0066cc; margin-top: 0;">IEEE Student Branch VIT Pune</h2>
            <p>Hello <strong>${targetUser.name}</strong>,</p>
            <p>An administrator has initiated a password reset request for your account (<code>${targetUser.email}</code>).</p>
            <p>Your 6-digit password reset OTP code is:</p>
            <div style="background: #f4f6f9; border: 1px border-dashed #0066cc; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 20px 0; border-radius: 6px; color: #0066cc;">
              ${otpCode}
            </div>
            <p style="font-size: 13px; color: #666;">This OTP is valid for 15 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
            <p style="font-size: 11px; color: #888; text-align: center;">© 2026 IEEE VIT Pune Student Branch. All rights reserved.</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        message: `Password reset OTP successfully dispatched to ${targetUser.email}.`,
        otpCode,
        user: {
          id: targetUser._id.toString(),
          name: targetUser.name,
          email: targetUser.email,
        },
      });
    }
  } catch (error: any) {
    console.error("POST /api/admin/users/reset-password error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
