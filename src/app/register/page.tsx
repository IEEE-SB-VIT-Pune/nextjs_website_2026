"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import ieeeLogo from "@/assets/images/footer/IEEE_logo2.png";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/services/auth";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address").lowercase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (response.success) {
        setApiSuccess("Account created successfully! Redirecting you to login...");
        const from = searchParams.get("from") || "";
        const redirectUrl = `/login?email=${encodeURIComponent(values.email)}${from ? `&from=${encodeURIComponent(from)}` : ""}`;
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2000);
      } else {
        setApiError(response.message || "Failed to register account.");
      }
    } catch (error) {
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
              alt="Club CMS Logo"
              width={64}
              height={64}
              className="object-contain h-full w-full"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Candidate Register
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Create an account to submit your recruitment form
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Status Messages */}
            {apiError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {apiSuccess && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{apiSuccess}</span>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="E.g. Rajesh Kumar"
                  className="pl-9"
                  error={!!errors.name}
                  disabled={loading}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">VIT Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@vit.edu"
                  className="pl-9"
                  error={!!errors.email}
                  disabled={loading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  error={!!errors.password}
                  disabled={loading}
                  {...register("password")}
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
              {errors.password && (
                <p className="text-xs font-semibold text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9"
                  error={!!errors.confirmPassword}
                  disabled={loading}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Registering account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col text-center justify-center gap-3.5 border-t border-border/40 pt-4">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/login${searchParams.get("from") ? `?from=${encodeURIComponent(searchParams.get("from")!)}` : ""}`} className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </p>
          <p className="text-[10px] text-muted-foreground">
            © 2026 IEEE Student Branch VIT Pune
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
