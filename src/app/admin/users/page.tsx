"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Users, Plus, ToggleLeft, ToggleRight, Loader2, AlertCircle, CheckCircle2, Shield, User as UserIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getProfile, type UserProfile } from "@/services/auth";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create User form states
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Table status update states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", status: "ACTIVE" },
  });

  async function loadUsersList() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users list", err);
    }
  }

  useEffect(() => {
    async function initPage() {
      try {
        const response = await getProfile();
        if (response.success && response.user) {
          if (response.user.role !== "ADMIN") {
            router.push("/dashboard?error=forbidden");
          } else {
            setCurrentUser(response.user);
            await loadUsersList();
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Page initialization failed", err);
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, [router]);

  const onRegisterUser = async (values: CreateUserFormValues) => {
    setSubmitLoading(true);
    setFormSuccess(null);
    setFormError(null);
    try {
      // Force created users to holds USER role permission
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role: "USER" }),
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess("User account created successfully!");
        reset();
        await loadUsersList();
      } else {
        setFormError(data.message || "Failed to register user.");
      }
    } catch (err) {
      setFormError("A network error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (userToUpdate: UserProfile) => {
    if (!currentUser) return;
    if (userToUpdate.id === currentUser.id) return; // Prevent self-update

    setActionLoadingId(userToUpdate.id);
    const newStatus = userToUpdate.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userToUpdate.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadUsersList();
      } else {
        alert(data.message || "Failed to update user status");
      }
    } catch (err) {
      alert("Network error: Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading users workspace...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "ADMIN") return null;

  return (
    <div className="p-6 relative z-10 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-border/50 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> User Accounts
            </h1>
            <p className="text-xs text-muted-foreground">Manage user registrations and status levels</p>
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <main className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_1.8fr] gap-8 items-start">
        {/* Form: Register User */}
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2.5 text-primary">
              <Plus className="h-5 w-5" />
              <CardTitle className="text-lg">Create New Account</CardTitle>
            </div>
            <CardDescription>Configure credentials and status access permissions</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onRegisterUser)} className="space-y-4">
              {formSuccess && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  error={!!errors.name}
                  disabled={submitLoading}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@ieeevitpune.com"
                  error={!!errors.email}
                  disabled={submitLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  disabled={submitLoading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs font-semibold text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Account Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  disabled={submitLoading}
                  {...register("status")}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <Button type="submit" disabled={submitLoading} className="w-full flex items-center justify-center gap-2 mt-2">
                {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitLoading ? "Creating account..." : "Register User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table: Users List */}
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg">Registered Users ({users.length})</CardTitle>
            <CardDescription>View and toggle access states for all users.</CardDescription>
          </CardHeader>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Details</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Role</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  const loadingAction = actionLoadingId === u.id;
                  return (
                    <tr key={u.id} className={`hover:bg-muted/10 transition-colors ${isSelf ? "bg-primary/5" : ""}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                            {u.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.avatar} alt={u.name} className="h-full w-full object-cover rounded-full" />
                            ) : (
                              u.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground flex items-center gap-1.5">
                              {u.name} {isSelf && <span className="text-[9px] font-bold bg-primary/25 text-primary border border-primary/20 px-1 py-0.5 rounded">YOU</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${u.role === "ADMIN" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/10 text-muted-foreground border-border"}`}>
                          <Shield className="h-3 w-3" />
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${u.status === "ACTIVE" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf || loadingAction}
                            className={`p-1 rounded-lg hover:bg-muted/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-primary`}
                            title={u.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
                          >
                            {loadingAction ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : u.status === "ACTIVE" ? (
                              <ToggleRight className="h-7 w-7 text-green-400" />
                            ) : (
                              <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
