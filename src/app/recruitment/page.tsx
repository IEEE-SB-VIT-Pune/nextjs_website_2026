"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, AlertCircle, Loader2, Mail, Calendar, ArrowRight, ShieldCheck, ChevronDown, RefreshCw } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getProfile, type UserProfile } from "@/services/auth";

// Schema for Interview Form - avoid Zod defaults mismatch
const interviewFormSchema = z.object({
  fullname: z.string().min(1, "Full name is required").trim(),
  phone_number: z.string().min(10, "WhatsApp number must be at least 10 digits").trim(),
  branch: z.string().min(1, "Branch selection is required"),
  whyPart: z.string().min(1, "Motivation field is required").trim(),
  domain: z
    .array(z.string())
    .min(1, "Select at least one domain preference")
    .max(3, "You can select a maximum of 3 domains"),
  whyWork: z.string().min(1, "Please answer this required field").trim(),
  skills: z.string().min(1, "Skills lists are required").trim(),
  projects: z.string(),
  expectations: z.string(),
  vagera: z.string(),
  github: z.string(),
  linkedin: z.string(),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

interface SlotDetails {
  id: string;
  dateTime: string;
  endDateTime: string;
  maxStudents: number;
  availableSpots: number;
  isFull: boolean;
  studentsCount: number;
}

interface MyBookingDetails {
  slotId: string;
  dateTime: string;
  endDateTime: string;
  panel: number;
  bookedAt: string;
}

const branches = [
  "Artificial Intelligence & Data Science",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Engineering (Software Engineering)",
  "Computer Science & Engineering (AI)",
  "Computer Science and Engineering (AI & ML)",
  "Computer Science and Engineering (Data Science)",
  "Computer Science & Engineering (IoT and Cyber Security Including Blockchain Technology)",
  "Electronics and Telecommunication Engineering",
  "Information Technology",
  "Instrumentation Engineering",
  "Mechanical Engineering",
  "Others"
];

export default function RecruitmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/recruitment/config");
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error("Failed to load config", err);
    }
  };

  // Workflow states
  const [step, setStep] = useState<"verify" | "apply" | "book">("verify");

  // OTP states
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  // Apply Form states
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Booking states
  const [slots, setSlots] = useState<SlotDetails[]>([]);
  const [myBooking, setMyBooking] = useState<MyBookingDetails | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      fullname: "",
      phone_number: "",
      branch: "",
      domain: [],
      whyWork: "",
      whyPart: "",
      skills: "",
      projects: "",
      expectations: "",
      vagera: "",
      github: "",
      linkedin: "",
    },
  });

  const selectedDomains = watch("domain") || [];

  const loadUserData = async () => {
    try {
      await loadConfig();
      const response = await getProfile();
      if (response.success && response.user) {
        if (response.user.role !== "USER") {
          // Admins don't fill interview forms
          router.push("/dashboard");
          return;
        }

        setUser(response.user);
        setValue("fullname", response.user.name);

        // Compute step
        if (!response.user.isEmailVerified) {
          setStep("verify");
        } else if (!response.user.hasSubmittedInterview) {
          setStep("apply");
        } else {
          setStep("book");
          loadBookingInfo();
        }
      } else {
        router.push("/register?from=/recruitment");
      }
    } catch (err) {
      console.error("Failed to load user session", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadBookingInfo = async () => {
    setBookingLoading(true);
    try {
      // 1. Fetch current booking
      const myRes = await fetch("/api/recruitment/booking/my-booking");
      const myData = await myRes.json();
      if (myData.success && myData.data) {
        setMyBooking(myData.data);
      } else {
        setMyBooking(null);
        // 2. Fetch available slots if no active booking
        const slotsRes = await fetch("/api/recruitment/booking/available-slots");
        const slotsData = await slotsRes.json();
        if (slotsData.success && slotsData.data) {
          setSlots(slotsData.data);
        }
      }
    } catch (err) {
      console.error("Failed to load booking slots", err);
    } finally {
      setBookingLoading(false);
    }
  };

  // --- OTP Verification Logic ---
  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      const res = await fetch("/api/recruitment/otp/send", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpSuccess(data.message);
      } else {
        setOtpError(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      setOtpError("Network error: Please check your connection.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("OTP code must be exactly 6 digits.");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      const res = await fetch("/api/recruitment/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSuccess("Email address successfully verified!");
        // Refresh session
        setTimeout(() => {
          loadUserData();
        }, 1500);
      } else {
        setOtpError(data.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      setOtpError("Network error: Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Submit Application Logic ---
  const onApplySubmit = async (values: InterviewFormValues) => {
    setApplyLoading(true);
    setApplyError(null);
    try {
      const res = await fetch("/api/recruitment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        // Move to Booking
        setStep("book");
        loadBookingInfo();
      } else {
        setApplyError(data.message || "Submission failed.");
      }
    } catch (err) {
      setApplyError("Network error: Failed to submit application form.");
    } finally {
      setApplyLoading(false);
    }
  };

  // --- Booking Operations Logic ---
  const handleBookSlot = async (slotId: string) => {
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const res = await fetch("/api/recruitment/booking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess("Interview slot booked successfully!");
        setSelectedSlotId(null);
        loadBookingInfo();
      } else {
        setBookingError(data.message || "Failed to book slot.");
      }
    } catch (err) {
      setBookingError("Network error: Failed to confirm booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel your booked interview slot?")) return;

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const res = await fetch("/api/recruitment/booking/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess("Booking cancelled successfully.");
        setMyBooking(null);
        loadBookingInfo();
      } else {
        setBookingError(data.message || "Failed to cancel booking.");
      }
    } catch (err) {
      setBookingError("Network error: Failed to cancel booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Formatter helpers
  const formatTimeStr = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const groupSlotsByDate = () => {
    const groups: Record<string, SlotDetails[]> = {};
    slots.forEach((s) => {
      const dateStr = new Date(s.dateTime).toDateString();
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(s);
    });
    return groups;
  };

  const toggleExpandDate = (dateStr: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading recruitment portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isApplyClosed = (step === "verify" || step === "apply") && (!config || !config.interviewForm?.isCurrentlyLive);
  if (isApplyClosed) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="max-w-md w-full border border-border bg-card/40 backdrop-blur-md text-center">
          <CardHeader className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Applications Closed</CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              Recruitment questionnaire is currently closed. Thank you for your interest!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/">
              <Button className="w-full">Go Back Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBookingClosed = step === "book" && !myBooking && (!config || !config.slotBooking?.isCurrentlyLive);
  if (isBookingClosed) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="max-w-md w-full border border-border bg-card/40 backdrop-blur-md text-center">
          <CardHeader className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Interview Booking Closed</CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              Interview slot booking is currently closed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/">
              <Button className="w-full">Go Back Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 relative z-10 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] space-y-8">
      {/* Page Header */}
      <header className="flex flex-col items-start pb-6 border-b border-border/50 gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
          🚀 IEEE Recruitment Portal
        </h1>
        <p className="text-sm text-muted-foreground">Follow the steps below to verify your email, submit the application form, and book your interview.</p>
      </header>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-4 border border-border/50 bg-card/25 p-3 rounded-lg text-xs font-bold text-center">
        <div className={`p-2 rounded ${step === "verify" ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground"}`}>
          1. Verify Email
        </div>
        <div className={`p-2 rounded ${step === "apply" ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground"}`}>
          2. Questionnaire Form
        </div>
        <div className={`p-2 rounded ${step === "book" ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground"}`}>
          3. Interview Slot Booking
        </div>
      </div>

      {/* STEP 1: VERIFY EMAIL */}
      {step === "verify" && (
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              <CardTitle className="text-lg">Email Verification OTP</CardTitle>
            </div>
            <CardDescription>
              We will send a 6-digit OTP code to verify your VIT email address: <span className="font-semibold text-foreground">{user.email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otpError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{otpSuccess}</span>
              </div>
            )}

            {!otpSent ? (
              <Button onClick={handleSendOtp} disabled={otpLoading} className="w-full flex justify-center items-center gap-2">
                {otpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Verification OTP ✉️
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="E.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                    disabled={otpLoading}
                    className="text-center font-bold tracking-[6px]"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleVerifyOtp} disabled={otpLoading || otpCode.length !== 6} className="flex-1 flex justify-center items-center gap-2">
                    {otpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirm Code
                  </Button>
                  <Button variant="outline" onClick={handleSendOtp} disabled={otpLoading} className="px-3">
                    Resend
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 2: RECRUITMENT APPLICATION FORM */}
      {step === "apply" && (
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <CardTitle className="text-lg">Recruitment Questionnaire</CardTitle>
            </div>
            <CardDescription>Specify your branch, select domains of interest, and showcase your skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-6">
              {applyError && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              <div className="form-section-title text-sm font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/40 mb-3">
                1. Candidate Profile
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    type="text"
                    error={!!errors.fullname}
                    disabled={applyLoading}
                    {...register("fullname")}
                  />
                  {errors.fullname && (
                    <p className="text-xs font-semibold text-destructive">{errors.fullname.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone_number">WhatsApp Number</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="10-digit mobile number"
                    error={!!errors.phone_number}
                    disabled={applyLoading}
                    {...register("phone_number")}
                  />
                  {errors.phone_number && (
                    <p className="text-xs font-semibold text-destructive">{errors.phone_number.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="github">GitHub Profile Link (Optional)</Label>
                  <Input
                    id="github"
                    type="url"
                    placeholder="https://github.com/username"
                    error={!!errors.github}
                    disabled={applyLoading}
                    {...register("github")}
                  />
                  {errors.github && (
                    <p className="text-xs font-semibold text-destructive">{errors.github.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="linkedin">LinkedIn Profile Link (Optional)</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    error={!!errors.linkedin}
                    disabled={applyLoading}
                    {...register("linkedin")}
                  />
                  {errors.linkedin && (
                    <p className="text-xs font-semibold text-destructive">{errors.linkedin.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch">Branch</Label>
                  <select
                    id="branch"
                    className="flex h-13 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    disabled={applyLoading}
                    {...register("branch")}
                  >
                    <option value="">Select your branch</option>
                    {branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {errors.branch && (
                    <p className="text-xs font-semibold text-destructive">{errors.branch.message}</p>
                  )}
                </div>
              </div>

              <div className="form-section-title text-sm font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/40 mt-6 mb-3">
                2. Domains of Interest
              </div>
              <div className="space-y-2">
                <p
                  className={`text-xs ${selectedDomains.length === 3
                      ? "text-amber-500 font-medium"
                      : "text-muted-foreground"
                    }`}
                >
                  You can select up to 3 domains. ({selectedDomains.length}/3 selected)
                </p>
                <Label>Select domains you are interested in (Multiple allowed)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-card/25 p-3 rounded-lg border border-border/40">
                  {[
                    "Aesthetic",
                    "Content",
                    "Curation",
                    "Finance",
                    "Graphics",
                    "Management",
                    "PR & SM",
                    "Sponsorship",
                    "Technical",
                    "Video Editing"
                  ].map((domain) => (
                    <div key={domain} className="flex items-center space-x-2">
                      <Checkbox
                        id={`domain-${domain}`}
                        checked={selectedDomains.includes(domain)}
                        disabled={

                          applyLoading ||

                          (!selectedDomains.includes(domain) && selectedDomains.length >= 3)

                        }
                        onChange={(e: any) => {
                          const checked = e.target.checked;

                          if (checked) {
                            // Prevent selecting more than 3
                            if (selectedDomains.length >= 3) {
                              return;
                            }

                            setValue("domain", [...selectedDomains, domain], {
                              shouldValidate: true,
                            });
                          } else {
                            setValue(
                              "domain",
                              selectedDomains.filter((d) => d !== domain),
                              {
                                shouldValidate: true,
                              }
                            );
                          }
                        }}
                      />
                      <label htmlFor={`domain-${domain}`} className="text-xs font-medium cursor-pointer text-foreground">
                        {domain}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.domain && (
                  <p className="text-xs font-semibold text-destructive">{errors.domain.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whyWork">Why do you want to work in the selected domain(s)?</Label>
                <textarea
                  id="whyWork"
                  rows={3}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="Explain your interest and alignment with the chosen domain(s)..."
                  disabled={applyLoading}
                  {...register("whyWork")}
                />
                {errors.whyWork && (
                  <p className="text-xs font-semibold text-destructive">{errors.whyWork.message}</p>
                )}
              </div>

              <div className="form-section-title text-sm font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/40 mt-6 mb-3">
                3. Technical Experience & Soft Skills
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whyPart">Why do you want to join IEEE Student Branch VIT Pune?</Label>
                <textarea
                  id="whyPart"
                  rows={3}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="Share your motivation..."
                  disabled={applyLoading}
                  {...register("whyPart")}
                />
                {errors.whyPart && (
                  <p className="text-xs font-semibold text-destructive">{errors.whyPart.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="skills">Relevant Skills</Label>
                <textarea
                  id="skills"
                  rows={3}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="E.g. React, public speaking, video editing, Canva, negotiation..."
                  disabled={applyLoading}
                  {...register("skills")}
                />
                {errors.skills && (
                  <p className="text-xs font-semibold text-destructive">{errors.skills.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="projects">Projects Worked On (Optional)</Label>
                <textarea
                  id="projects"
                  rows={2}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="List 1-2 major projects you have built..."
                  disabled={applyLoading}
                  {...register("projects")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expectations">Expectations from IEEE</Label>
                <textarea
                  id="expectations"
                  rows={2}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="What do you hope to gain or learn?"
                  disabled={applyLoading}
                  {...register("expectations")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vagera">Is there anything else you would like to tell us? (Optional)</Label>
                <textarea
                  id="vagera"
                  rows={2}
                  className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  placeholder="Other club experiences, questions, comments..."
                  disabled={applyLoading}
                  {...register("vagera")}
                />
              </div>

              <Button type="submit" disabled={applyLoading} className="w-full flex justify-center items-center gap-2 mt-4">
                {applyLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Recruitment Questionnaire 🚀
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: BOOK INTERVIEW SLOT */}
      {step === "book" && (
        <div className="space-y-6">
          {bookingError && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {bookingSuccess && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg border border-green-500/25 bg-green-500/10 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{bookingSuccess}</span>
            </div>
          )}

          {/* Active Booking details card */}
          {myBooking ? (
            <Card className="border border-green-500/25 bg-green-500/5 backdrop-blur-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <CardTitle className="text-lg">Confirmed Booking Slot</CardTitle>
                </div>
                <CardDescription>Your panel interview is scheduled and synced to your calendar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4 border border-green-500/10 p-4 rounded-lg bg-green-500/5 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Interview Date</span>
                    <span className="font-bold text-foreground">{new Date(myBooking.dateTime).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Time Window</span>
                    <span className="font-bold text-foreground">{formatTimeStr(myBooking.dateTime)} - {formatTimeStr(myBooking.endDateTime)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Assigned Panel</span>
                    <span className="font-bold text-primary text-base">Panel {myBooking.panel}</span>
                  </div>
                </div>

                {!config?.slotBooking?.isCurrentlyLive && (
                  <div className="flex items-center gap-2 p-3.5 rounded-lg border border-yellow-500/25 bg-yellow-500/10 text-sm text-yellow-400 mt-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Slot booking is currently closed. You cannot change or reschedule your slot.</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="destructive" onClick={handleCancelBooking} disabled={bookingLoading || !config?.slotBooking?.isCurrentlyLive} className="gap-2">
                    {bookingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Cancel Booking Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Slots lists card selector */
            <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Select Time Slot
                  </CardTitle>
                  <CardDescription>Select an available interview slot block below.</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={loadBookingInfo} disabled={bookingLoading} className="h-8 w-8">
                  <RefreshCw className={`h-4 w-4 ${bookingLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!config?.slotBooking?.isCurrentlyLive && (
                  <div className="flex items-center gap-2 p-3.5 rounded-lg border border-yellow-500/25 bg-yellow-500/10 text-sm text-yellow-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Slot booking is currently closed by the administration. You cannot book or change slots.</span>
                  </div>
                )}
                {slots.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground font-semibold">
                    No active interview time slots generated at the moment. Please notify the administrator.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupSlotsByDate()).map(([dateStr, dateSlots]) => {
                      const isExpanded = !!expandedDates[dateStr];
                      const dateObj = new Date(dateStr);
                      const formattedDate = dateObj.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
                      const slotsOpen = dateSlots.filter((s) => !s.isFull).length;

                      return (
                        <div key={dateStr} className="border border-border/40 rounded-lg overflow-hidden bg-card/10">
                          {/* Date block collapsible toggler */}
                          <div
                            onClick={() => toggleExpandDate(dateStr)}
                            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors border-b border-border/20 bg-muted/5"
                          >
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{formattedDate}</h4>
                              <span className="text-[10px] font-semibold text-muted-foreground block mt-0.5">
                                {slotsOpen} time block{slotsOpen !== 1 ? "s" : ""} available
                              </span>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>

                          {/* Time cards grid */}
                          {isExpanded && (
                            <div className="p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-border/10">
                              {dateSlots.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => setSelectedSlotId(s.id)}
                                  disabled={s.isFull || bookingLoading || !config?.slotBooking?.isCurrentlyLive}
                                  className={`p-3.5 border rounded-lg text-left transition-all relative ${s.isFull
                                    ? "border-border opacity-40 cursor-not-allowed bg-muted/5"
                                    : selectedSlotId === s.id
                                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                                      : "border-border/80 hover:border-primary/50 text-foreground"
                                    }`}
                                >
                                  <div className="font-bold text-sm">
                                    {formatTimeStr(s.dateTime)} - {formatTimeStr(s.endDateTime)}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-semibold mt-1">
                                    {s.availableSpots} / {s.maxStudents} seats open
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Booking confirmation drawer drawer style */}
                {selectedSlotId && (
                  <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                    <div>
                      <h4 className="font-bold text-sm text-foreground uppercase">Confirm Time Slot</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Selected:{" "}
                        <span className="font-semibold text-primary">
                          {(() => {
                            const match = slots.find((s) => s.id === selectedSlotId);
                            if (!match) return "";
                            return `${new Date(match.dateTime).toLocaleDateString()} at ${formatTimeStr(match.dateTime)}`;
                          })()}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleBookSlot(selectedSlotId)} disabled={bookingLoading || !config?.slotBooking?.isCurrentlyLive} className="gap-2">
                        {bookingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirm Slot <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedSlotId(null)} disabled={bookingLoading}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sticky Guidelines */}
          <Card className="border border-border/40 bg-card/20 p-4">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              📌 Booking Guidelines
            </h4>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-2.5">
              <li>Candidates are balanced dynamically across Panel 1 to Panel 4.</li>
              <li>Each interview slot block has a default maximum capacity of 4 candidates.</li>
              <li>Ensure you have a reliable network connection prior to the interview session.</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
