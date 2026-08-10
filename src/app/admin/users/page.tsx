"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  Shield, 
  Calendar, 
  Mail, 
  KeyRound, 
  RefreshCw, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Search
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getProfile, type UserProfile } from "@/services/auth";

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState("");
  const [actionType, setActionType] = useState<"set_password" | "send_otp">("set_password");
  const [newPassword, setNewPassword] = useState("");
  const [notifyUser, setNotifyUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadUsersList() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
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

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase().trim();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, users]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let pwd = "Ieee#";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const openResetModal = (user?: any) => {
    setSelectedUser(user || null);
    setCustomEmailInput(user ? user.email : "");
    setActionType("set_password");
    setNewPassword("");
    setNotifyUser(true);
    setModalError(null);
    setModalSuccess(null);
    setCopied(false);
    setIsModalOpen(true);
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    setModalSuccess(null);
    setCopied(false);

    const targetEmail = selectedUser ? selectedUser.email : customEmailInput.trim();
    if (!targetEmail) {
      setModalError("Please specify a valid user Email ID.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser ? selectedUser._id : undefined,
          email: targetEmail,
          action: actionType,
          newPassword: actionType === "set_password" ? newPassword : undefined,
          notifyUser,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalSuccess(data);
      } else {
        setModalError(data.message || "Failed to update password.");
      }
    } catch (err) {
      setModalError("A network error occurred while updating password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading users database...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "ADMIN") return null;

  return (
    <div className="p-6 relative z-10 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Users & Account Security
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage accounts, view user profiles, and update user passwords by Email ID
            </p>
          </div>
        </div>

        <Button
          onClick={() => openResetModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/20"
        >
          <KeyRound className="h-4 w-4" /> Update User Password
        </Button>
      </header>

      {/* Main List */}
      <main className="max-w-6xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email ID, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/40 border-border/60"
            />
          </div>
          <p className="text-xs text-muted-foreground font-semibold">
            Showing {filteredUsers.length} of {users.length}
          </p>
        </div>

        <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Registered Accounts ({users.length})</CardTitle>
              <CardDescription>
                View registered students and administrators or update credentials directly.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Profile</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Role</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Joined Date</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredUsers.map((u) => {
                  const isSelf = u._id === currentUser.id;
                  const dateStr = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A";
                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-muted/10 transition-colors ${isSelf ? "bg-primary/5" : ""}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                            {u.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.avatar} alt={u.name} className="h-full w-full object-cover rounded-full" />
                            ) : (
                              u.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground flex items-center gap-1.5">
                              {u.name}{" "}
                              {isSelf && (
                                <span className="text-[9px] font-bold bg-primary/25 text-primary border border-primary/20 px-1 py-0.5 rounded">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground/60" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            u.role === "ADMIN"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-muted/10 text-muted-foreground border-border"
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            u.status === "ACTIVE"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4 text-center text-muted-foreground text-xs font-mono">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                          {dateStr}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResetModal(u)}
                          className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Reset Password
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* ADMIN PASSWORD RESET MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)} className="bg-card/95 backdrop-blur-xl border-border/80 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <KeyRound className="h-5 w-5 text-primary" /> Admin Password Management
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update password directly in the database or send a password reset OTP email.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive-foreground">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          {modalSuccess && (
            <div className="p-3.5 rounded-md bg-green-500/10 border border-green-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{modalSuccess.message}</span>
              </div>

              {modalSuccess.newPassword && (
                <div className="bg-background/80 p-2.5 rounded border border-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">New Password Set:</p>
                    <code className="text-sm font-mono font-bold text-primary">{modalSuccess.newPassword}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyText(modalSuccess.newPassword)}
                    className="h-7 text-[11px] gap-1"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-400" /> : "Copy"}
                  </Button>
                </div>
              )}

              {modalSuccess.otpCode && (
                <div className="bg-background/80 p-2.5 rounded border border-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">OTP Code Dispatched:</p>
                    <code className="text-sm font-mono font-bold text-primary">{modalSuccess.otpCode}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyText(modalSuccess.otpCode)}
                    className="h-7 text-[11px] gap-1"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-400" /> : "Copy"}
                  </Button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleAdminResetPassword} className="space-y-4 pt-1">
            {/* Target Email / User selection */}
            <div className="space-y-1.5">
              <Label htmlFor="targetEmail" className="text-xs font-semibold">User Email Address</Label>
              {selectedUser ? (
                <div className="p-2.5 rounded bg-muted/30 border border-border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-foreground">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{selectedUser.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Input
                  id="targetEmail"
                  type="email"
                  placeholder="e.g. student@vit.edu"
                  value={customEmailInput}
                  onChange={(e) => setCustomEmailInput(e.target.value)}
                  className="text-sm"
                  required
                />
              )}
            </div>

            {/* Action selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Action Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType("set_password")}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    actionType === "set_password"
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-muted/10 border-border text-muted-foreground hover:bg-muted/20"
                  }`}
                >
                  <KeyRound className="h-4 w-4" />
                  Set Password Directly
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("send_otp")}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    actionType === "send_otp"
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-muted/10 border-border text-muted-foreground hover:bg-muted/20"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  Send Reset OTP Email
                </button>
              </div>
            </div>

            {/* Password input (if set_password) */}
            {actionType === "set_password" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newPassword" className="text-xs font-semibold">New Password</Label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Auto-Generate
                  </button>
                </div>
                <Input
                  id="newPassword"
                  type="text"
                  placeholder="Enter new password or click auto-generate"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Notify user checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="notifyUser"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
              />
              <label
                htmlFor="notifyUser"
                className="text-xs font-semibold text-muted-foreground cursor-pointer select-none"
              >
                Send notification email to user ({selectedUser ? selectedUser.email : customEmailInput || "target email"})
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Done
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2 font-bold"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {actionType === "set_password" ? "Update Password Now" : "Send Reset OTP Email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
