"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

import ieeeLogo from "@/assets/images/footer/IEEE_logo2.png";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Read message parameters from middleware redirect (e.g. error=inactive, error=forbidden)
  const redirectError = searchParams.get("error");
  const getRedirectMessage = () => {
    if (redirectError === "inactive") return "Your session has expired because your account is inactive.";
    if (redirectError === "forbidden") return "You do not have access to view that administrator section.";
    return null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await loginUser(values);
      if (response.success) {
        // Redirect to dashboard on successful login
        const from = searchParams.get("from") || (response.user?.role === "ADMIN" ? "/dashboard" : "/recruitment");
        router.push(from);
        router.refresh();
      } else {
        setApiError(response.message || "Invalid credentials. Please try again.");
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sign in
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Redirect / API Errors */}
            {(apiError || getRedirectMessage()) && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{apiError || getRedirectMessage()}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                {/* <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> */}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => alert("Forgot Password helper: Please contact the System Administrator to reset your credentials.")}
                  className="text-xs text-primary hover:underline font-semibold focus-visible:outline-none"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                {/* <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> */}
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

            {/* Remember Me */}
            <div className="flex items-center space-x-2 py-1">
              <Checkbox
                id="rememberMe"
                disabled={loading}
                {...register("rememberMe")}
              />
              <label
                htmlFor="rememberMe"
                className="text-xs font-semibold text-muted-foreground cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col text-center justify-center gap-3.5 border-t border-border/40 pt-4">
          <p className="text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link href={`/register${searchParams.get("from") ? `?from=${encodeURIComponent(searchParams.get("from")!)}` : ""}`} className="text-primary hover:underline font-semibold">
              Sign Up
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
