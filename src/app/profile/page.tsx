"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, User, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getProfile, updateProfile, changePassword, type UserProfile } from "@/services/auth";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // States for Profile Update Form
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // States for Password Change Form
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await getProfile();
        if (response.success && response.user) {
          setUser(response.user);
          profileForm.reset({
            name: response.user.name,
          });
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router, profileForm]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);
    try {
      const res = await updateProfile(values);
      if (res.success && res.user) {
        setUser(res.user);
        setProfileSuccess("Personal profile information updated successfully!");
      } else {
        setProfileError(res.message || "Failed to update profile.");
      }
    } catch (err) {
      setProfileError("A network error occurred. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);
    try {
      const res = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (res.success) {
        setPasswordSuccess("Password changed successfully!");
        passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordError(res.message || "Failed to change password.");
      }
    } catch (err) {
      setPasswordError("A network error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading profile workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 relative z-10 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-border/50 mb-8">
        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <Link href="/admin/dashboard">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
              Profile Settings
            </h1>
            <p className="text-xs text-muted-foreground">Manage details and login security</p>
          </div>
        </div>
      </header>

      {/* Forms Content Grid */}
      <main className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {/* Form 1: Profile Info */}
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2.5 text-primary">
              <User className="h-5 w-5" />
              <CardTitle className="text-lg">Personal Details</CardTitle>
            </div>
            <CardDescription>Update your public metadata username and avatar</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              {profileSuccess && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  error={!!profileForm.formState.errors.name}
                  disabled={profileLoading}
                  {...profileForm.register("name")}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-xs font-semibold text-destructive">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="opacity-60 cursor-not-allowed bg-muted/20"
                />
                <p className="text-[10px] text-muted-foreground font-semibold">
                  Contact administrator to modify registration email address.
                </p>
              </div>



              <Button type="submit" disabled={profileLoading} className="w-full flex items-center justify-center gap-2 mt-2">
                {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {profileLoading ? "Updating..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Form 2: Password Security */}
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2.5 text-primary">
              <Lock className="h-5 w-5" />
              <CardTitle className="text-lg">Security Settings</CardTitle>
            </div>
            <CardDescription>Verify current credentials and update security password</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  error={!!passwordForm.formState.errors.currentPassword}
                  disabled={passwordLoading}
                  {...passwordForm.register("currentPassword")}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs font-semibold text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  error={!!passwordForm.formState.errors.newPassword}
                  disabled={passwordLoading}
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs font-semibold text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  error={!!passwordForm.formState.errors.confirmPassword}
                  disabled={passwordLoading}
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs font-semibold text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={passwordLoading} className="w-full flex items-center justify-center gap-2 mt-2">
                {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {passwordLoading ? "Saving..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
