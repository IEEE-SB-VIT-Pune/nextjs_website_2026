"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Users,
  Calendar,
  BookOpen,
  Settings,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Trash2,
  CalendarPlus,
  ListFilter,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  Clock,
  Coffee
} from "lucide-react";

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

  // Dynamic tab switcher state
  const [activeTab, setActiveTab] = useState<"overview" | "slots" | "controls" | "events">("overview");

  // Recruitment Overview Stats
  const [applicants, setApplicants] = useState<ApplicantDetails[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [totalSlots, setTotalSlots] = useState(0);
  const [bookedSpots, setBookedSpots] = useState(0);
  const [recruitmentLoading, setRecruitmentLoading] = useState(false);

  // Generate Slots Form States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState(60);
  const [maxStudentsInput, setMaxStudentsInput] = useState(4);
  const [breaks, setBreaks] = useState<{ startTime: string; endTime: string }[]>([]);
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [genLoading, setGenLoading] = useState(false);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Timeline / Live Status Configuration States
  const [configsLoading, setConfigsLoading] = useState(false);
  const [configsError, setConfigsError] = useState<string | null>(null);
  const [configsSuccess, setConfigsSuccess] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<"MANUAL" | "AUTOMATIC">("MANUAL");
  const [formIsLive, setFormIsLive] = useState(true);
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");

  const [bookingMode, setBookingMode] = useState<"MANUAL" | "AUTOMATIC">("MANUAL");
  const [bookingIsLive, setBookingIsLive] = useState(true);
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("https://chat.whatsapp.com/EeEkwbw0LvxA0oOIVHIy1w?s=sh&p=i&mlu=0&ilr=0");

  const isInitialized = React.useRef(false);

  // Auto-save changes to system configs when user modifies them
  useEffect(() => {
    if (!isInitialized.current) {
      return;
    }

    const timer = setTimeout(async () => {
      setConfigsLoading(true);
      setConfigsSuccess(null);
      setConfigsError(null);
      try {
        const formValue = {
          mode: formMode,
          isLive: formIsLive,
          start: formStart ? new Date(formStart).toISOString() : null,
          end: formEnd ? new Date(formEnd).toISOString() : null,
        };

        const bookingValue = {
          mode: bookingMode,
          isLive: bookingIsLive,
          start: bookingStart ? new Date(bookingStart).toISOString() : null,
          end: bookingEnd ? new Date(bookingEnd).toISOString() : null,
        };

        // Save Form config
        await fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "interviewForm", value: formValue }),
        });

        // Save Booking config
        await fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "slotBooking", value: bookingValue }),
        });

        // Save WhatsApp Link config
        await fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "whatsappLink", value: whatsappLink }),
        });

        setConfigsSuccess("Changes auto-saved to database 💾");
      } catch (err) {
        console.error("Auto-save error:", err);
        setConfigsError("Failed to auto-save changes.");
      } finally {
        setConfigsLoading(false);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [
    formMode,
    formIsLive,
    formStart,
    formEnd,
    bookingMode,
    bookingIsLive,
    bookingStart,
    bookingEnd,
    whatsappLink,
  ]);

  // Event Manager States
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState({
    id: "",
    title: "",
    description: "",
    category: "Event",
    dateText: "",
    timeText: "",
    prizePool: "",
    teamSize: "",
    entryFee: "",
    venue: "VIT Pune",
    type: "PREVIOUS" as "UPCOMING" | "PREVIOUS",
  });
  const [eventLoading, setEventLoading] = useState(false);
  const [eventSuccess, setEventSuccess] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  // Load Admin User Details
  const loadUserData = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.user) {
        if (response.user.role === "USER") {
          router.replace("/profile");
        } else {
          setUser(response.user);
          await loadRecruitmentData();
          await loadSystemConfigs();
          await loadEvents();
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

  // Load Recruitment Applicants and Slots
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
        setAllSlots(slotsData.slots);
        setTotalSlots(slotsData.slots.length);
        let booked = 0;
        slotsData.slots.forEach((s: any) => {
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

  // Load System Scheduling Configurations
  const loadSystemConfigs = async () => {
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (data.success && data.configs) {
        const formDoc = data.configs.find((c: any) => c.key === "interviewForm");
        if (formDoc && formDoc.value) {
          setFormMode(formDoc.value.mode || "MANUAL");
          setFormIsLive(formDoc.value.isLive !== false);
          if (formDoc.value.start) setFormStart(new Date(formDoc.value.start).toISOString().slice(0, 16));
          if (formDoc.value.end) setFormEnd(new Date(formDoc.value.end).toISOString().slice(0, 16));
        }
        const bookingDoc = data.configs.find((c: any) => c.key === "slotBooking");
        if (bookingDoc && bookingDoc.value) {
          setBookingMode(bookingDoc.value.mode || "MANUAL");
          setBookingIsLive(bookingDoc.value.isLive !== false);
          if (bookingDoc.value.start) setBookingStart(new Date(bookingDoc.value.start).toISOString().slice(0, 16));
          if (bookingDoc.value.end) setBookingEnd(new Date(bookingDoc.value.end).toISOString().slice(0, 16));
        }
        const whatsappDoc = data.configs.find((c: any) => c.key === "whatsappLink");
        if (whatsappDoc && whatsappDoc.value) {
          setWhatsappLink(whatsappDoc.value);
        }
        setTimeout(() => {
          isInitialized.current = true;
        }, 100);
      } else {
        isInitialized.current = true;
      }
    } catch (err) {
      console.error("Failed to load configs", err);
      isInitialized.current = true;
    }
  };

  // Load Events from database
  const loadEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success && data.events) {
        setAllEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load events", err);
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

  // Batch generate slots
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
          maxStudents: Number(maxStudentsInput),
          timezoneOffset: new Date().getTimezoneOffset(),
          breaks,
          activeDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenSuccess(data.message);
        setStartDate("");
        setEndDate("");
        setBreaks([]);
        await loadRecruitmentData();
      } else {
        setGenError(data.message || "Failed to generate slots.");
      }
    } catch (err) {
      setGenError("Network error: Failed to generate slots.");
    } finally {
      setGenLoading(false);
    }
  };

  // Toggle Slot Active Status
  const handleToggleSlotActive = async (slotId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/recruitment/admin/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slotId, isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        await loadRecruitmentData();
      }
    } catch (err) {
      console.error("Failed to toggle slot activity", err);
    }
  };

  // Modify Slot Capacity
  const handleUpdateSlotCapacity = async (slotId: string, capacity: number) => {
    try {
      const res = await fetch("/api/recruitment/admin/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slotId, maxStudents: capacity }),
      });
      const data = await res.json();
      if (data.success) {
        await loadRecruitmentData();
      }
    } catch (err) {
      console.error("Failed to update slot capacity", err);
    }
  };

  // Delete Individual Slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this specific time slot?")) return;
    try {
      const res = await fetch(`/api/recruitment/admin/slots?id=${slotId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadRecruitmentData();
      } else {
        alert(data.message || "Failed to delete slot");
      }
    } catch (err) {
      console.error("Failed to delete slot", err);
    }
  };

  // Reset entire recruitment DB
  const handleResetRecruitment = async () => {
    if (!confirm("⚠️ WARNING: This will permanently delete all interview slots in the database. Continue?")) return;

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

  // Save scheduling timelines config
  const handleSaveConfigs = async () => {
    setConfigsLoading(true);
    setConfigsSuccess(null);
    setConfigsError(null);
    try {
      const formValue = {
        mode: formMode,
        isLive: formIsLive,
        start: formStart ? new Date(formStart).toISOString() : null,
        end: formEnd ? new Date(formEnd).toISOString() : null,
      };

      const bookingValue = {
        mode: bookingMode,
        isLive: bookingIsLive,
        start: bookingStart ? new Date(bookingStart).toISOString() : null,
        end: bookingEnd ? new Date(bookingEnd).toISOString() : null,
      };

      // Save Form config
      const resForm = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "interviewForm", value: formValue }),
      });
      const formResData = await resForm.json();

      // Save Booking config
      const resBooking = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "slotBooking", value: bookingValue }),
      });
      const bookingResData = await resBooking.json();

      // Save WhatsApp Link config
      const resWhatsapp = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "whatsappLink", value: whatsappLink }),
      });
      const whatsappResData = await resWhatsapp.json();

      if (formResData.success && bookingResData.success && whatsappResData.success) {
        setConfigsSuccess("All scheduling system configurations saved successfully.");
      } else {
        setConfigsError("One or more configurations failed to update.");
      }
    } catch (err) {
      setConfigsError("Network error: Failed to save configurations.");
    } finally {
      setConfigsLoading(false);
    }
  };

  // Event Manager CRUD Operations
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventLoading(true);
    setEventSuccess(null);
    setEventError(null);
    try {
      const isEdit = !!eventForm.id;
      const res = await fetch("/api/admin/events", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? eventForm : { ...eventForm, id: undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setEventSuccess(isEdit ? "Event updated successfully!" : "Event created successfully!");
        setEventForm({
          id: "",
          title: "",
          description: "",
          category: "Event",
          dateText: "",
          timeText: "",
          prizePool: "",
          teamSize: "",
          entryFee: "",
          venue: "VIT Pune",
          type: "PREVIOUS",
        });
        loadEvents();
      } else {
        setEventError(data.message || "Failed to save event.");
      }
    } catch (err) {
      setEventError("Network error: Failed to save event.");
    } finally {
      setEventLoading(false);
    }
  };

  const handleEditEventClick = (event: any) => {
    setEventForm({
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category || "Event",
      dateText: event.dateText,
      timeText: event.timeText || "",
      prizePool: event.prizePool || "",
      teamSize: event.teamSize || "",
      entryFee: event.entryFee || "",
      venue: event.venue || "VIT Pune",
      type: event.type || "PREVIOUS",
    });
    // Scroll event form into view
    document.getElementById("eventFormContainer")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadEvents();
      } else {
        alert(data.message || "Failed to delete event");
      }
    } catch (err) {
      console.error("Failed to delete event", err);
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
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border/50 mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Club CMS Portal & Admin Console
          </h1>
          <p className="text-xs text-muted-foreground">Logged in: {user.name} ({user.email})</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <User className="h-3.5 w-3.5" /> Profile Setup
            </Button>
          </Link>

          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Users className="h-3.5 w-3.5" /> Users List
            </Button>
          </Link>

          <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Log out
          </Button>
        </div>
      </header>

      {/* Sleek Tabs Navigation bar */}
      <div className="max-w-6xl mx-auto flex gap-2 border-b border-border/40 pb-3 mb-6 overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Applicants", icon: ListFilter },
          { id: "slots", label: "Interview Slots", icon: CalendarPlus },
          { id: "controls", label: "Control Center", icon: Settings },
          { id: "events", label: "Event Manager", icon: BookOpen }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all shrink-0 ${activeTab === t.id
                ? "bg-primary text-black border-primary font-bold shadow-md shadow-primary/20"
                : "bg-card/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted/10"
                }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto space-y-6">

        {/* TAB 1: OVERVIEW & APPLICANTS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 border border-border/60 bg-card/20 rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Form Submissions</span>
                <span className="text-2xl font-bold text-primary">{applicants.length}</span>
              </div>
              <div className="p-4 border border-border/60 bg-card/20 rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Total Slots Generated</span>
                <span className="text-2xl font-bold text-foreground">{totalSlots}</span>
              </div>
              <div className="p-4 border border-border/60 bg-card/20 rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Booked Spots</span>
                <span className="text-2xl font-bold text-foreground">{bookedSpots}</span>
              </div>
            </div>

            {/* Applicants Table */}
            <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-1.5 font-bold uppercase text-foreground">
                    <ListFilter className="h-4 w-4 text-primary" /> Application Submissions
                  </CardTitle>
                  <CardDescription className="text-xs">Candidates who submitted their Execom interview questionnaires.</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={loadRecruitmentData} disabled={recruitmentLoading} className="h-8 w-8">
                  <RefreshCw className={`h-4 w-4 ${recruitmentLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <div className="overflow-x-auto w-full text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      <th className="p-3.5 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Candidate Profile</th>
                      <th className="p-3.5 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Branch Details</th>
                      <th className="p-3.5 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Applied Domains</th>
                      <th className="p-3.5 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Submitted On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {applicants.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground font-semibold">
                          No candidate questionnaires submitted yet.
                        </td>
                      </tr>
                    ) : (
                      applicants.map((app) => (
                        <tr key={app._id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-foreground text-sm">{app.fullname}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{app.email}</p>
                            <p className="text-[10px] text-primary mt-1">{app.phone_number}</p>
                            <div className="flex gap-3 mt-1.5">
                              {app.github && (
                                <a href={app.github.startsWith("http") ? app.github : `https://${app.github}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline font-semibold bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                                  GitHub
                                </a>
                              )}
                              {app.linkedin && (
                                <a href={app.linkedin.startsWith("http") ? app.linkedin : `https://${app.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline font-semibold bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-foreground text-sm leading-relaxed">{app.branch}</td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {app.domain.map((d) => (
                                <span key={d} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] border border-primary/10 font-bold uppercase tracking-wider">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 text-muted-foreground font-mono text-[10px]">
                            {new Date(app.createdAt).toLocaleDateString("en-IN")} at {new Date(app.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: INTERVIEW SLOTS */}
        {activeTab === "slots" && (
          <div className="grid lg:grid-cols-[1fr_2fr] gap-6 items-start">
            {/* Slot Generator Form Card */}
            <div className="space-y-6">
              <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-base flex items-center gap-2 uppercase font-bold text-foreground">
                    <CalendarPlus className="h-5 w-5 text-primary" /> Generate Time Slots
                  </CardTitle>
                  <CardDescription className="text-xs">Generate interview slots within a date and time range.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleGenerateSlots} className="space-y-4">
                    {genSuccess && (
                      <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-xs text-green-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{genSuccess}</span>
                      </div>
                    )}

                    {genError && (
                      <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive-foreground">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{genError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                          disabled={genLoading}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="endDate" className="text-xs">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                          disabled={genLoading}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="startTime" className="text-xs">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          disabled={genLoading}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="endTime" className="text-xs">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                          disabled={genLoading}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="duration" className="text-xs">Slot Duration (mins)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          required
                          min={15}
                          max={180}
                          disabled={genLoading}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="maxStudents" className="text-xs">Capacity Per Slot</Label>
                        <Input
                          id="maxStudents"
                          type="number"
                          value={maxStudentsInput}
                          onChange={(e) => setMaxStudentsInput(Number(e.target.value))}
                          required
                          min={1}
                          max={20}
                          disabled={genLoading}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    {/* Active Days Selection */}
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold text-foreground/80">Generate for Days</Label>
                      <div className="flex flex-wrap gap-1 justify-between">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => {
                          const active = activeDays.includes(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (active) {
                                  setActiveDays(activeDays.filter((d) => d !== idx));
                                } else {
                                  setActiveDays([...activeDays, idx]);
                                }
                              }}
                              className={`h-7 px-2.5 text-[10px] font-bold rounded-lg border transition-all flex items-center justify-center cursor-pointer ${active
                                  ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/30"
                                  : "bg-background border-border/40 text-muted-foreground hover:border-border"
                                }`}
                            >
                              {dayName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Break Times Controller */}
                    <div className="space-y-2 border-t border-border/20 pt-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                          <Coffee className="h-3.5 w-3.5 text-primary" /> Break Periods
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setBreaks([...breaks, { startTime: "13:00", endTime: "14:00" }])}
                          className="h-6 text-[10px] gap-1 px-2 border-primary/20 text-primary hover:bg-primary/5"
                        >
                          <Plus className="h-3 w-3" /> Add Break
                        </Button>
                      </div>

                      {breaks.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic pl-1">No breaks added yet (optional).</p>
                      ) : (
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {breaks.map((brk, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/20">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded border border-border/20">
                                  <span className="text-[9px] text-muted-foreground uppercase">Start</span>
                                  <input
                                    type="time"
                                    value={brk.startTime}
                                    onChange={(e) => {
                                      const updated = [...breaks];
                                      updated[idx].startTime = e.target.value;
                                      setBreaks(updated);
                                    }}
                                    className="bg-transparent border-0 text-[10px] focus:outline-none focus:ring-0 w-full text-foreground"
                                  />
                                </div>
                                <div className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded border border-border/20">
                                  <span className="text-[9px] text-muted-foreground uppercase">End</span>
                                  <input
                                    type="time"
                                    value={brk.endTime}
                                    onChange={(e) => {
                                      const updated = [...breaks];
                                      updated[idx].endTime = e.target.value;
                                      setBreaks(updated);
                                    }}
                                    className="bg-transparent border-0 text-[10px] focus:outline-none focus:ring-0 w-full text-foreground"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setBreaks(breaks.filter((_, i) => i !== idx))}
                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={genLoading} className="w-full h-10 flex justify-center items-center gap-2 text-xs font-bold uppercase mt-2">
                      {genLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Batch Generate Slots 📅
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-destructive uppercase tracking-wider">Danger Reset Module</CardTitle>
                  <CardDescription className="text-[10px]">Permanently deletes all interview slots from the database.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button variant="destructive" size="sm" onClick={handleResetRecruitment} disabled={recruitmentLoading} className="gap-2 w-full text-xs font-bold uppercase">
                    <Trash2 className="h-3.5 w-3.5" /> Delete All Slots
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* List of Time Slots Table */}
            <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2 uppercase font-bold text-foreground">
                  <Calendar className="h-4 w-4 text-primary" /> Generated Slots Catalog
                </CardTitle>
                <CardDescription className="text-xs">Disable/enable visibility or modify capacity limits of individual slots.</CardDescription>
              </CardHeader>

              <div className="overflow-y-auto max-h-[620px] w-full text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Slot Time Block</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Booked Users</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Max Capacity</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Status Visibility</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {allSlots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground font-semibold">
                          No interview slots generated. Use the generator tool to create time blocks.
                        </td>
                      </tr>
                    ) : (
                      allSlots.map((slot) => {
                        const dateStr = new Date(slot.dateTime).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        });
                        const startStr = new Date(slot.dateTime).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        });
                        const endStr = new Date(slot.endDateTime).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        });

                        return (
                          <tr key={slot._id} className="hover:bg-muted/5 transition-colors">
                            <td className="p-3">
                              <span className="font-bold text-foreground block text-sm">{dateStr}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{startStr} - {endStr}</span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-bold text-foreground text-sm bg-muted/40 border border-border px-2 py-0.5 rounded">
                                {slot.students ? slot.students.length : 0}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  defaultValue={slot.maxStudents}
                                  onBlur={(e) => handleUpdateSlotCapacity(slot._id, Number(e.target.value))}
                                  className="w-12 h-7 rounded border border-border bg-background px-1.5 py-0.5 text-center font-bold text-xs"
                                />
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleToggleSlotActive(slot._id, slot.isActive)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${slot.isActive
                                  ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                                  }`}
                              >
                                {slot.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                {slot.isActive ? "VISIBLE" : "HIDDEN"}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteSlot(slot._id)}
                                className="h-7 w-7 text-destructive hover:text-white hover:bg-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: CONTROL CENTER (SCHEDULING TIMELINES) */}
        {activeTab === "controls" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2 uppercase font-bold text-foreground">
                  <Clock className="h-5 w-5 text-primary" /> Active Timeline Controls
                </CardTitle>
                <CardDescription className="text-xs">Configure manual start/stop override or automatic date-time schedules for candidates form and slot booking.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">

                {configsSuccess && (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-xs text-green-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{configsSuccess}</span>
                  </div>
                )}

                {configsError && (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive-foreground">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{configsError}</span>
                  </div>
                )}

                {/* 1. Interview Questionnaire Section */}
                <div className="border border-border/40 rounded-xl p-4 bg-muted/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Interview Questionnaire Form</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${formIsLive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                      {formIsLive ? "LIVE ENABLED" : "STOPPED / CLOSED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status Control Mode</Label>
                      <select
                        value={formMode}
                        onChange={(e) => setFormMode(e.target.value as any)}
                        className="flex h-13 w-full rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold focus-visible:outline-none"
                      >
                        <option value="MANUAL">MANUAL OVERRIDE</option>
                        <option value="AUTOMATIC">AUTOMATIC SCHEDULE</option>
                      </select>
                    </div>

                    {formMode === "MANUAL" ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Live Status Switch</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={formIsLive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFormIsLive(true)}
                            className="flex-1 text-xs"
                          >
                            Start Submissions
                          </Button>
                          <Button
                            type="button"
                            variant={!formIsLive ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setFormIsLive(false)}
                            className="flex-1 text-xs"
                          >
                            Stop Submissions
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Start Time</Label>
                          <Input
                            type="datetime-local"
                            value={formStart}
                            onChange={(e) => setFormStart(e.target.value)}
                            className="h-9 text-xs px-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">End Time</Label>
                          <Input
                            type="datetime-local"
                            value={formEnd}
                            onChange={(e) => setFormEnd(e.target.value)}
                            className="h-9 text-xs px-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Slot Booking Section */}
                <div className="border border-border/40 rounded-xl p-4 bg-muted/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Interview Slot Booking Portal</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${bookingIsLive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                      {bookingIsLive ? "LIVE ENABLED" : "STOPPED / CLOSED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status Control Mode</Label>
                      <select
                        value={bookingMode}
                        onChange={(e) => setBookingMode(e.target.value as any)}
                        className="flex h-13 w-full rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold focus-visible:outline-none"
                      >
                        <option value="MANUAL">MANUAL OVERRIDE</option>
                        <option value="AUTOMATIC">AUTOMATIC SCHEDULE</option>
                      </select>
                    </div>

                    {bookingMode === "MANUAL" ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Live Status Switch</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={bookingIsLive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBookingIsLive(true)}
                            className="flex-1 text-xs"
                          >
                            Open Booking
                          </Button>
                          <Button
                            type="button"
                            variant={!bookingIsLive ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setBookingIsLive(false)}
                            className="flex-1 text-xs"
                          >
                            Close Booking
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Start Time</Label>
                          <Input
                            type="datetime-local"
                            value={bookingStart}
                            onChange={(e) => setBookingStart(e.target.value)}
                            className="h-9 text-xs px-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">End Time</Label>
                          <Input
                            type="datetime-local"
                            value={bookingEnd}
                            onChange={(e) => setBookingEnd(e.target.value)}
                            className="h-9 text-xs px-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. WhatsApp Group Link Section */}
                <div className="border border-border/40 rounded-xl p-4 bg-muted/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Candidate WhatsApp Group</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-primary/10 text-primary border-primary/20">
                      DYNAMIC URL
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsappLink" className="text-xs">Join Group Link</Label>
                    <Input
                      id="whatsappLink"
                      type="url"
                      placeholder="https://chat.whatsapp.com/..."
                      value={whatsappLink}
                      onChange={(e) => setWhatsappLink(e.target.value)}
                      disabled={configsLoading}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Submit Configurations */}
                <Button onClick={handleSaveConfigs} disabled={configsLoading} className="w-full h-10 gap-2 font-bold uppercase text-xs">
                  {configsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Timeline Configurations (Auto-saves in background) 💾
                </Button>

              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: EVENT MANAGER */}
        {activeTab === "events" && (
          <div className="grid lg:grid-cols-[1fr_2.2fr] gap-6 items-start">

            {/* Event Edit/Create Form Card */}
            <Card id="eventFormContainer" className="border border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2 uppercase font-bold text-foreground">
                  <Plus className="h-5 w-5 text-primary" /> {eventForm.id ? "Edit Event" : "Create Event"}
                </CardTitle>
                <CardDescription className="text-xs">Add new dynamic event highlighting parameters or modify previous events.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSaveEvent} className="space-y-4">

                  {eventSuccess && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-xs text-green-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{eventSuccess}</span>
                    </div>
                  )}

                  {eventError && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive-foreground">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{eventError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="eventTitle" className="text-xs">Event Title</Label>
                    <Input
                      id="eventTitle"
                      type="text"
                      placeholder="e.g. CodeZest'26"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      required
                      disabled={eventLoading}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="eventDesc" className="text-xs">Description</Label>
                    <textarea
                      id="eventDesc"
                      rows={3}
                      placeholder="Summary and outlines of the event..."
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      required
                      disabled={eventLoading}
                      className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="eventCategory" className="text-xs">Category Tag</Label>
                      <Input
                        id="eventCategory"
                        type="text"
                        placeholder="e.g. Hackathon, Tech Talk"
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                        disabled={eventLoading}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="eventType" className="text-xs">Display Grid Section</Label>
                      <select
                        id="eventType"
                        value={eventForm.type}
                        onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                        className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold focus-visible:outline-none"
                      >
                        <option value="UPCOMING">UPCOMING EVENTS</option>
                        <option value="PREVIOUS">PREVIOUS EVENTS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="eventDateText" className="text-xs">Date Label</Label>
                      <Input
                        id="eventDateText"
                        type="text"
                        placeholder="e.g. 13th March"
                        value={eventForm.dateText}
                        onChange={(e) => setEventForm({ ...eventForm, dateText: e.target.value })}
                        required
                        disabled={eventLoading}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="eventTimeText" className="text-xs">Time / Mode Label</Label>
                      <Input
                        id="eventTimeText"
                        type="text"
                        placeholder="e.g. 1 PM, Offline"
                        value={eventForm.timeText}
                        onChange={(e) => setEventForm({ ...eventForm, timeText: e.target.value })}
                        disabled={eventLoading}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="space-y-1">
                      <Label htmlFor="eventPrize" className="text-[10px]">Prize Pool</Label>
                      <Input
                        id="eventPrize"
                        type="text"
                        placeholder="e.g. ₹30,000"
                        value={eventForm.prizePool}
                        onChange={(e) => setEventForm({ ...eventForm, prizePool: e.target.value })}
                        disabled={eventLoading}
                        className="h-9 text-xs px-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="eventSize" className="text-[10px]">Team Size</Label>
                      <Input
                        id="eventSize"
                        type="text"
                        placeholder="e.g. 1-2 Members"
                        value={eventForm.teamSize}
                        onChange={(e) => setEventForm({ ...eventForm, teamSize: e.target.value })}
                        disabled={eventLoading}
                        className="h-9 text-xs px-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="eventFee" className="text-[10px]">Entry Fee</Label>
                      <Input
                        id="eventFee"
                        type="text"
                        placeholder="e.g. ₹150"
                        value={eventForm.entryFee}
                        onChange={(e) => setEventForm({ ...eventForm, entryFee: e.target.value })}
                        disabled={eventLoading}
                        className="h-9 text-xs px-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="eventVenue" className="text-xs">Venue Location</Label>
                    <Input
                      id="eventVenue"
                      type="text"
                      placeholder="e.g. VIT Pune, Online"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      disabled={eventLoading}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={eventLoading} className="flex-1 h-10 text-xs font-bold uppercase">
                      {eventLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {eventForm.id ? "Update Event" : "Create Event"}
                    </Button>
                    {eventForm.id && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEventForm({
                          id: "",
                          title: "",
                          description: "",
                          category: "Event",
                          dateText: "",
                          timeText: "",
                          prizePool: "",
                          teamSize: "",
                          entryFee: "",
                          venue: "VIT Pune",
                          type: "PREVIOUS",
                        })}
                        className="h-10 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Dynamic Events Catalog Display */}
            <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base flex items-center gap-2 uppercase font-bold text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" /> Active Events Catalog ({allEvents.length})
                </CardTitle>
                <CardDescription className="text-xs">List of all upcoming and past events currently active on the platform.</CardDescription>
              </CardHeader>

              <div className="overflow-y-auto max-h-[550px] w-full text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Event Details</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-center">Type Grid</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {allEvents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-muted-foreground font-semibold">
                          No dynamic events in database. Catalog is currently showing default seeded templates.
                        </td>
                      </tr>
                    ) : (
                      allEvents.map((evt) => (
                        <tr key={evt._id} className="hover:bg-muted/5 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-foreground text-sm block">{evt.title}</span>
                            <span className="text-[10px] text-primary font-semibold">{evt.category} · {evt.dateText} {evt.timeText && `· ${evt.timeText}`}</span>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 max-w-md">{evt.description}</p>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${evt.type === "UPCOMING" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/10 text-muted-foreground border-border"}`}>
                              {evt.type}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditEventClick(evt)}
                                className="h-7 w-7"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteEvent(evt._id)}
                                className="h-7 w-7 text-destructive hover:text-white hover:bg-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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
        )}

      </main>
    </div>
  );
}
