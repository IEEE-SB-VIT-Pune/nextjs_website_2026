"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Shield, Calendar, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfile, type UserProfile } from "@/services/auth";

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <header className="max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-border/50 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Users Directory
            </h1>
            <p className="text-xs text-muted-foreground">A simple read-only listing of all accounts in the database</p>
          </div>
        </div>
      </header>

      {/* Main List */}
      <main className="max-w-5xl mx-auto">
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg">Registered Accounts ({users.length})</CardTitle>
            <CardDescription>View all students and administrators registered in the system database.</CardDescription>
          </CardHeader>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Profile</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Role</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map((u) => {
                  const isSelf = u._id === currentUser.id;
                  const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }) : "N/A";
                  return (
                    <tr key={u._id} className={`hover:bg-muted/10 transition-colors ${isSelf ? "bg-primary/5" : ""}`}>
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
                              {u.name} {isSelf && <span className="text-[9px] font-bold bg-primary/25 text-primary border border-primary/20 px-1 py-0.5 rounded">YOU</span>}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground/60" />
                              {u.email}
                            </p>
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

                      <td className="p-4 text-right text-muted-foreground text-xs font-mono">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                          {dateStr}
                        </span>
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
