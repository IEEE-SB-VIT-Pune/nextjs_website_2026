"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";

import ieeeLogo from "@/assets/images/footer/IEEE_logo2.png";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const requestOtpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

const resetPasswordSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    otp: z.string().length(6, "OTP code must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestOtpValues = z.infer<typeof requestOtpSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [emailSubmitted, setEmailSubmitted] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const step1Form = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const step2Form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onRequestOtp = async (values: RequestOtpValues) => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (data.success) {
        setEmailSubmitted(values.email);
        step2Form.setValue("email", values.email);
        setApiSuccess(data.message || "OTP code sent to your email.");
        setStep(2);
      } else {
        setApiError(data.message || "Failed to process request. Please try again.");
      }
    } catch (err) {
      setApiError("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (values: ResetPasswordValues) => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (data.success) {
        setApiSuccess(data.message || "Password has been updated successfully.");
        setIsResetComplete(true);
      } else {
        setApiError(data.message || "Failed to reset password. Please check your OTP and try again.");
      }
    } catch (err) {
      setApiError("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md border border-border/60 shadow-2xl bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-4 items-center text-center pb-2">
          <div className="h-16 w-16 rounded-xl bg-card/80 border border-primary/20 p-2 flex items-center justify-center shadow-lg">
            <Image
              src={ieeeLogo}
              alt="IEEE Logo"
              width={64}
              height={64}
              className="object-contain h-full w-full"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              {isResetComplete ? "Password Reset Complete" : step === 1 ? "Forgot Password" : "Enter Verification OTP"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {isResetComplete
                ? "Your account password has been updated."
                : step === 1
                ? "Enter your account email to receive a 6-digit verification code"
                : `Enter the 6-digit OTP code sent to ${emailSubmitted}`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Notifications */}
          {apiError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground mb-4">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {apiSuccess && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-green-500/20 bg-green-500/10 text-sm text-green-400 mb-4">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{apiSuccess}</span>
            </div>
          )}

          {isResetComplete ? (
            <div className="space-y-4 text-center py-4">
              <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground">
                You can now log in using your new credentials.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full flex items-center justify-center gap-2 mt-2"
              >
                Proceed to Login
              </Button>
            </div>
          ) : step === 1 ? (
            /* STEP 1 FORM */
            <form onSubmit={step1Form.handleSubmit(onRequestOtp)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@vit.edu"
                    className="pl-9"
                    error={!!step1Form.formState.errors.email}
                    disabled={loading}
                    {...step1Form.register("email")}
                  />
                </div>
                {step1Form.formState.errors.email && (
                  <p className="text-xs font-semibold text-destructive">
                    {step1Form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2 mt-2"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending OTP..." : "Send Verification OTP"}
              </Button>
            </form>
          ) : (
            /* STEP 2 FORM */
            <form onSubmit={step2Form.handleSubmit(onResetPassword)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Account Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="pl-9 bg-muted/30"
                  readOnly
                  {...step2Form.register("email")}
                />
              </div>

              {/* OTP Field */}
              <div className="space-y-1.5">
                <Label htmlFor="otp">6-Digit Verification OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="tracking-widest text-center font-mono text-lg font-bold"
                  error={!!step2Form.formState.errors.otp}
                  disabled={loading}
                  {...step2Form.register("otp")}
                />
                {step2Form.formState.errors.otp && (
                  <p className="text-xs font-semibold text-destructive">
                    {step2Form.formState.errors.otp.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    error={!!step2Form.formState.errors.newPassword}
                    disabled={loading}
                    {...step2Form.register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {step2Form.formState.errors.newPassword && (
                  <p className="text-xs font-semibold text-destructive">
                    {step2Form.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9"
                  error={!!step2Form.formState.errors.confirmPassword}
                  disabled={loading}
                  {...step2Form.register("confirmPassword")}
                />
                {step2Form.formState.errors.confirmPassword && (
                  <p className="text-xs font-semibold text-destructive">
                    {step2Form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-2/3 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Updating..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col text-center justify-center gap-3.5 border-t border-border/40 pt-4">
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
