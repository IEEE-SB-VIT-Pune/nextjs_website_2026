"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Users, Calendar, BookOpen, Image as ImageIcon, Settings, ShieldAlert, Layout, ArrowRight, RefreshCw, Trash2, CalendarPlus, ListFilter, Loader2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getProfile, logoutUser, type UserProfile } from "@/services/auth";

interface ApplicantDetails {
  _id: string;
  fullname: string;
  email: string;
  phone_number: string;
  github?: string;
  linkedin?: string;
  branch: string;
  domain: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Recruitment Stats
  const [applicants, setApplicants] = useState<ApplicantDetails[]>([]);
  const [totalSlots, setTotalSlots] = useState(0);
  const [bookedSpots, setBookedSpots] = useState(0);
  const [recruitmentLoading, setRecruitmentLoading] = useState(false);

  // Generate Slots Form States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState(60);
  const [genLoading, setGenLoading] = useState(false);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.user) {
        // If regular USER role, redirect straight to /profile setup
        if (response.user.role === "USER") {
          router.replace("/profile");
        } else {
          setUser(response.user);
          loadRecruitmentData();
        }
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to load user details", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecruitmentData = async () => {
    setRecruitmentLoading(true);
    try {
      // 1. Fetch applicants
      const appRes = await fetch("/api/recruitment/admin/applicants");
      const appData = await appRes.json();
      if (appData.success && appData.data) {
        setApplicants(appData.data);
      }

      // 2. Fetch slots overview
      const slotsRes = await fetch("/api/recruitment/admin/slots");
      const slotsData = await slotsRes.json();
      if (slotsData.success && slotsData.slots) {
        const slotList = slotsData.slots;
        setTotalSlots(slotList.length);
        let booked = 0;
        slotList.forEach((s: any) => {
          booked += s.students ? s.students.length : 0;
        });
        setBookedSpots(booked);
      }
    } catch (err) {
      console.error("Failed to load recruitment data", err);
    } finally {
      setRecruitmentLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.success) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    setGenSuccess(null);
    setGenError(null);

    try {
      const res = await fetch("/api/recruitment/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          startTime,
          endTime,
          duration: Number(duration),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenSuccess(data.message);
        setStartDate("");
        setEndDate("");
        loadRecruitmentData();
      } else {
        setGenError(data.message || "Failed to generate slots.");
      }
    } catch (err) {
      setGenError("Network error: Failed to generate slots.");
    } finally {
      setGenLoading(false);
    }
  };

  const handleResetRecruitment = async () => {
    if (!confirm("⚠️ WARNING: This will permanently delete all slots and interview applications in the database, resetting all candidates. Continue?")) return;

    setRecruitmentLoading(true);
    try {
      const res = await fetch("/api/recruitment/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadRecruitmentData();
      } else {
        alert(data.message || "Reset failed");
      }
    } catch (err) {
      alert("Network error: Failed to reset recruitment database.");
    } finally {
      setRecruitmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading workspace details...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="p-6 relative z-10 min-h-[calc(100vh-4rem)]">
      {/* Top Banner Navigation */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border/50 mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Club CMS Portal & Admin Console
          </h1>
          <p className="text-xs text-muted-foreground">Admin: {user.name}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" /> Profile Setup
            </Button>
          </Link>
          
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" /> Manage Users
            </Button>
          </Link>

          <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Card & Statistics Overview Grid */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
          
          {/* Welcome User Card */}
          <Card className="border border-border/60 bg-card/40 backdrop-blur-md flex flex-col justify-between">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-3xl">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 justify-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary uppercase border border-primary/25">
                    {user.role} Account
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase border border-green-500/25">
                    {user.status}
                  </span>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t border-border/40 text-center text-[10px] text-muted-foreground">
              Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "First Session"}
            </div>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-border/60 bg-card/30 flex flex-col justify-between">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CMS Admins</span>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">1</div>
                <p className="text-[9px] text-muted-foreground">Active Admin Sessions</p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/30 flex flex-col justify-between">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Events</span>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">2</div>
                <p className="text-[9px] text-muted-foreground">Upcoming Workshops</p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/30 flex flex-col justify-between">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Published Blogs</span>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">4</div>
                <p className="text-[9px] text-muted-foreground">Active News items</p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/30 flex flex-col justify-between">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Projects</span>
                <Layout className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">8</div>
                <p className="text-[9px] text-muted-foreground">Active R&D Showcases</p>
              </CardContent>
            </Card>
          </div>

        </div>


        {/* CMS Modules Grid */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Available CMS Modules
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer bg-card/30">
              <CardHeader className="p-4 flex flex-row items-center gap-3.5 space-y-0">
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Events</h4>
                  <p className="text-xs text-muted-foreground">Manage schedule & forms</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors cursor-pointer bg-card/30">
              <CardHeader className="p-4 flex flex-row items-center gap-3.5 space-y-0">
                <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Blogs</h4>
                  <p className="text-xs text-muted-foreground">Write news & updates</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors cursor-pointer bg-card/30">
              <CardHeader className="p-4 flex flex-row items-center gap-3.5 space-y-0">
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Gallery</h4>
                  <p className="text-xs text-muted-foreground">Upload event images</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/40 transition-colors cursor-pointer bg-card/30">
              <CardHeader className="p-4 flex flex-row items-center gap-3.5 space-y-0">
                <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Settings</h4>
                  <p className="text-xs text-muted-foreground">Website parameters</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Administration Links section */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
            Authorized Modules Administration
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border/60 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> User Accounts Control
                </CardTitle>
                <CardDescription>
                  Provision new club accounts, change security roles, and toggle active/inactive status levels.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/admin/users">
                  <Button variant="outline" size="sm" className="gap-2">
                    Configure User Table <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" /> Global CMS Parameters
                </CardTitle>
                <CardDescription>
                  Configure system settings, metadata parameters, API variables, and integrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  Settings Offline
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RECRUITMENT MANAGEMENT SECTION */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Recruitment Slots & Applicants Console</span>
            <Button variant="outline" size="icon" onClick={loadRecruitmentData} disabled={recruitmentLoading} className="h-7 w-7">
              <RefreshCw className={`h-3 w-3 ${recruitmentLoading ? "animate-spin" : ""}`} />
            </Button>
          </h3>

          <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-6">
            
            {/* Slot Generator Form */}
            <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <CalendarPlus className="h-5 w-5" />
                  <CardTitle className="text-base">Generate Time Slots</CardTitle>
                </div>
                <CardDescription>Generate interview slots within a date and time range.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateSlots} className="space-y-4">
                  {genSuccess && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-xs text-green-400">
                      <span>{genSuccess}</span>
                    </div>
                  )}

                  {genError && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive-foreground">
                      <span>{genError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        disabled={genLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        disabled={genLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        disabled={genLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        disabled={genLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="duration">Slot Duration (Minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      required
                      min={15}
                      max={180}
                      disabled={genLoading}
                    />
                  </div>

                  <Button type="submit" disabled={genLoading} className="w-full flex justify-center items-center gap-2">
                    {genLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Batch Generate Slots 📅
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border/40">
                  <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Danger Zone</h4>
                  <p className="text-[10px] text-muted-foreground mb-3">Resets slots, clears candidates list, and updates user verification states.</p>
                  <Button variant="destructive" size="sm" onClick={handleResetRecruitment} disabled={recruitmentLoading} className="gap-2 w-full">
                    <Trash2 className="h-4 w-4" /> Reset Recruitment Database
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Applicants List and Overview Stats */}
            <div className="space-y-6">
              
              {/* Internal Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border border-border/40 rounded-lg bg-card/25 text-center">
                  <span className="text-[9px] text-muted-foreground block font-bold uppercase">Applicants</span>
                  <span className="text-lg font-bold text-foreground">{applicants.length}</span>
                </div>
                <div className="p-3 border border-border/40 rounded-lg bg-card/25 text-center">
                  <span className="text-[9px] text-muted-foreground block font-bold uppercase">Slots Open</span>
                  <span className="text-lg font-bold text-foreground">{totalSlots}</span>
                </div>
                <div className="p-3 border border-border/40 rounded-lg bg-card/25 text-center">
                  <span className="text-[9px] text-muted-foreground block font-bold uppercase">Booked</span>
                  <span className="text-lg font-bold text-foreground">{bookedSpots}</span>
                </div>
              </div>

              {/* Applicants Table */}
              <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5 font-bold">
                      <ListFilter className="h-4 w-4 text-primary" /> Application Submissions
                    </CardTitle>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto w-full text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/20">
                        <th className="p-3 font-bold text-muted-foreground uppercase">Candidate Details</th>
                        <th className="p-3 font-bold text-muted-foreground uppercase">Branch</th>
                        <th className="p-3 font-bold text-muted-foreground uppercase">Domains</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {applicants.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-muted-foreground font-semibold">
                            No candidate questionnaires submitted yet.
                          </td>
                        </tr>
                      ) : (
                        applicants.map((app) => (
                          <tr key={app._id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-3">
                              <p className="font-bold text-foreground">{app.fullname}</p>
                              <p className="text-[10px] text-muted-foreground">{app.email}</p>
                              <p className="text-[9px] text-primary mt-0.5">{app.phone_number}</p>
                              {app.github && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  GitHub: <a href={app.github.startsWith("http") ? app.github : `https://${app.github}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{app.github}</a>
                                </p>
                              )}
                              {app.linkedin && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  LinkedIn: <a href={app.linkedin.startsWith("http") ? app.linkedin : `https://${app.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{app.linkedin}</a>
                                </p>
                              )}
                            </td>
                            <td className="p-3 font-medium text-foreground">{app.branch}</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {app.domain.map((d) => (
                                  <span key={d} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] border border-primary/10 font-bold uppercase">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>         
      </main>
    </div>
  );
}
