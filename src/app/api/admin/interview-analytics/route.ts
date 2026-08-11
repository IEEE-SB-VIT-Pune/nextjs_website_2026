import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Slot } from "@/models/Slot";
import { Interview } from "@/models/Interview";
import { verifyJWT } from "@/lib/jwt";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload || !payload.id) return null;

  await connectDB();
  const currentUser = await User.findById(payload.id);
  if (!currentUser || currentUser.status !== "ACTIVE" || currentUser.role !== "ADMIN") {
    return null;
  }
  return currentUser;
}

const DATA_JSON_PATH = path.join(process.cwd(), "src", "lib", "interview_analytics_data.json");

function formatDateStr(dateObj: Date): string {
  const d = dateObj.getDate();
  const m = dateObj.getMonth() + 1;
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatTimeRange(startObj: Date, endObj: Date): string {
  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${strHours}:${strMinutes} ${ampm}`;
  };
  return `${formatTime(startObj)} - ${formatTime(endObj)}`;
}

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Administrator access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Query live MongoDB collections (Read-Only)
    const [dbSlots, dbInterviews, dbUsers] = await Promise.all([
      Slot.find({}).lean(),
      Interview.find({}).lean(),
      User.find({}, { name: 1, email: 1, role: 1, status: 1 }).lean(),
    ]);

    // Build lookup for interview responses by email & userId
    const interviewByEmail = new Map<string, any>();
    dbInterviews.forEach((inv: any) => {
      if (inv.email) {
        interviewByEmail.set(inv.email.toLowerCase().trim(), inv);
      }
    });

    const candidates: any[] = [];
    const bookedEmails = new Set<string>();

    // Process live Slot bookings
    dbSlots.forEach((slot: any) => {
      const start = new Date(slot.dateTime);
      const end = new Date(slot.endDateTime);
      const dateStr = formatDateStr(start);
      const timeStr = formatTimeRange(start, end);

      if (Array.isArray(slot.students)) {
        slot.students.forEach((st: any) => {
          const studentEmail = st.studentEmail ? st.studentEmail.toLowerCase().trim() : "";
          if (studentEmail) bookedEmails.add(studentEmail);

          const inv = interviewByEmail.get(studentEmail);
          const domainList: string[] = Array.isArray(inv?.domain)
            ? inv.domain
            : inv?.domain
            ? [inv.domain]
            : [];

          candidates.push({
            timestamp: st.bookedAt ? new Date(st.bookedAt).toLocaleString("en-IN") : "",
            name: st.studentName || inv?.fullname || "N/A",
            email: studentEmail || st.studentEmail || "N/A",
            phone: inv?.phone_number || "N/A",
            branch: inv?.branch || "N/A",
            domain: domainList.join(", "),
            domains: domainList,
            date: dateStr,
            time_slot: timeStr,
            panel: `Panel ${st.panel || 1}`,
            status: "BOOKED",
            github: inv?.github || "",
            linkedin: inv?.linkedin || "",
            skills: inv?.skills || "",
            whyPart: inv?.whyPart || "",
            whyWork: inv?.whyWork || "",
            projects: inv?.projects || "",
            expectations: inv?.expectations || "",
            vagera: inv?.vagera || "",
          });
        });
      }
    });

    // Also include candidates from Interview collection who haven't booked a slot yet
    dbInterviews.forEach((inv: any) => {
      const email = inv.email ? inv.email.toLowerCase().trim() : "";
      if (email && !bookedEmails.has(email)) {
        const domainList: string[] = Array.isArray(inv.domain) ? inv.domain : inv.domain ? [inv.domain] : [];
        candidates.push({
          timestamp: inv.createdAt ? new Date(inv.createdAt).toLocaleString("en-IN") : "",
          name: inv.fullname || "N/A",
          email: email,
          phone: inv.phone_number || "N/A",
          branch: inv.branch || "N/A",
          domain: domainList.join(", "),
          domains: domainList,
          date: "Unscheduled",
          time_slot: "Unscheduled",
          panel: "N/A",
          status: "PENDING_BOOKING",
          github: inv.github || "",
          linkedin: inv.linkedin || "",
          skills: inv.skills || "",
          whyPart: inv.whyPart || "",
          whyWork: inv.whyWork || "",
          projects: inv.projects || "",
          expectations: inv.expectations || "",
          vagera: inv.vagera || "",
        });
      }
    });

    // If live MongoDB has candidate records, compute live statistics
    if (candidates.length > 0) {
      const total_slots = candidates.length;
      const booked_slots = candidates.filter((c) => c.status === "BOOKED").length;
      const cancelled_slots = candidates.filter((c) => c.status === "CANCELLED").length;
      const total_applicants = dbInterviews.length || dbUsers.length;

      const domain_counts: Record<string, number> = {};
      const date_counts: Record<string, number> = {};
      const time_counts: Record<string, number> = {};
      const panel_counts: Record<string, number> = {};
      const branch_counts: Record<string, number> = {};

      candidates.forEach((c) => {
        if (c.status === "BOOKED") {
          (c.domains || []).forEach((d: string) => {
            domain_counts[d] = (domain_counts[d] || 0) + 1;
          });
          if (c.date && c.date !== "Unscheduled") {
            date_counts[c.date] = (date_counts[c.date] || 0) + 1;
          }
          if (c.time_slot && c.time_slot !== "Unscheduled") {
            time_counts[c.time_slot] = (time_counts[c.time_slot] || 0) + 1;
          }
          if (c.panel && c.panel !== "N/A") {
            panel_counts[c.panel] = (panel_counts[c.panel] || 0) + 1;
          }
          if (c.branch && c.branch !== "N/A") {
            branch_counts[c.branch] = (branch_counts[c.branch] || 0) + 1;
          }
        }
      });

      const unique_dates = Array.from(new Set(candidates.map((c) => c.date).filter(Boolean))).sort();
      const unique_times = Array.from(new Set(candidates.map((c) => c.time_slot).filter(Boolean))).sort();
      const unique_domains = Object.keys(domain_counts).sort();
      const unique_panels = Array.from(new Set(candidates.map((c) => c.panel).filter(Boolean))).sort();

      const stats = {
        total_slots,
        booked_slots,
        cancelled_slots,
        total_applicants,
        domain_counts,
        date_counts,
        time_counts,
        panel_counts,
        branch_counts,
        unique_dates,
        unique_times,
        unique_domains,
        unique_panels,
      };

      return NextResponse.json({
        success: true,
        source: "LIVE_DATABASE",
        stats,
        candidates,
      });
    }

    // Fallback to static file if MongoDB yields no records yet
    if (fs.existsSync(DATA_JSON_PATH)) {
      const rawData = fs.readFileSync(DATA_JSON_PATH, "utf-8");
      const parsedData = JSON.parse(rawData);
      return NextResponse.json({
        success: true,
        source: "DATASET_FILE",
        stats: parsedData.stats,
        candidates: parsedData.candidates,
      });
    }

    return NextResponse.json({
      success: true,
      source: "EMPTY",
      stats: {
        total_slots: 0,
        booked_slots: 0,
        cancelled_slots: 0,
        total_applicants: 0,
        domain_counts: {},
        date_counts: {},
        time_counts: {},
        panel_counts: {},
        branch_counts: {},
        unique_dates: [],
        unique_times: [],
        unique_domains: [],
        unique_panels: [],
      },
      candidates: [],
    });
  } catch (error: any) {
    console.error("GET /api/admin/interview-analytics error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
