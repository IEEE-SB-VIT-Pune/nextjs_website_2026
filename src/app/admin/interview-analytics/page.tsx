"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Download,
  ExternalLink,
  Filter,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  XCircle,
  Database,
  Printer,
  FileJson,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  UserCheck,
  CalendarPlus,
  Layers,
  Calendar,
  AlertCircle,
  Check,
  RotateCcw,
  Loader2
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getProfile, type UserProfile } from "@/services/auth";
import * as XLSX from "xlsx";

export default function AdminInterviewAnalyticsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [dataSource, setDataSource] = useState<string>("LIVE_DATABASE");
  const [stats, setStats] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);
  const [expandedCandidateIndex, setExpandedCandidateIndex] = useState<number | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Allotment Modal States
  const [isManualAllotModalOpen, setIsManualAllotModalOpen] = useState(false);
  const [selectedCandidateForAllot, setSelectedCandidateForAllot] = useState<any | null>(null);
  const [availableSlotsForSelect, setAvailableSlotsForSelect] = useState<any[]>([]);
  const [selectedSlotIdToAssign, setSelectedSlotIdToAssign] = useState("");
  const [allottingLoading, setAllottingLoading] = useState(false);
  const [allotError, setAllotError] = useState<string | null>(null);
  const [allotSuccess, setAllotSuccess] = useState<string | null>(null);

  // Auto-Allotment Modal States
  const [isAutoAllotModalOpen, setIsAutoAllotModalOpen] = useState(false);
  const [autoAllotLoading, setAutoAllotLoading] = useState(false);
  const [autoAllotResult, setAutoAllotResult] = useState<any | null>(null);
  const [selectedAutoAllotDate, setSelectedAutoAllotDate] = useState<string>("FUTURE_ONLY");

  // Day-Wise Domain Export Date Picker Modal
  const [isDayWiseExportModalOpen, setIsDayWiseExportModalOpen] = useState(false);
  const [exportDateChoice, setExportDateChoice] = useState("");

  async function fetchAnalytics() {
    try {
      const res = await fetch("/api/admin/interview-analytics");
      const data = await res.json();
      if (data.success) {
        setDataSource(data.source || "LIVE_DATABASE");
        setStats(data.stats);
        setCandidates(data.candidates || []);
        setFilteredCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error("Failed to load interview analytics", err);
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const res = await fetch("/api/admin/allot-slot");
      const data = await res.json();
      if (data.success && data.slots) {
        setAvailableSlotsForSelect(data.slots);
      }
    } catch (err) {
      console.error("Failed to fetch available slots", err);
    }
  };

  useEffect(() => {
    async function initPage() {
      try {
        const response = await getProfile();
        if (response.success && response.user) {
          if (response.user.role !== "ADMIN") {
            router.push("/dashboard?error=forbidden");
          } else {
            setCurrentUser(response.user);
            await fetchAnalytics();
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

  // Apply filters whenever filter state changes
  useEffect(() => {
    let result = [...candidates];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.branch?.toLowerCase().includes(q)
      );
    }

    if (selectedDate) {
      result = result.filter((c) => c.date === selectedDate);
    }

    if (selectedTimeSlot) {
      result = result.filter((c) => c.time_slot === selectedTimeSlot);
    }

    if (selectedDomain) {
      result = result.filter((c) => (c.domains || []).includes(selectedDomain));
    }

    if (selectedStatus) {
      if (selectedStatus === "SELF_BOOKED") {
        result = result.filter((c) => c.status === "BOOKED" && !(c.isAdminAllotted || c.allottedBy === "ADMIN"));
      } else if (selectedStatus === "ALLOTTED_ADMIN") {
        result = result.filter((c) => c.status === "BOOKED" && (c.isAdminAllotted || c.allottedBy === "ADMIN"));
      } else {
        result = result.filter((c) => c.status === selectedStatus);
      }
    }

    setFilteredCandidates(result);
  }, [searchQuery, selectedDate, selectedTimeSlot, selectedDomain, selectedStatus, candidates]);

  // Dynamic filename helper based on selected domain and filter parameters
  const getExportFileName = (ext: string) => {
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, "_");
    const domainPrefix = selectedDomain ? sanitize(selectedDomain) : "All_Domains";
    const datePart = selectedDate ? `_${sanitize(selectedDate)}` : "";
    const panelPart = selectedPanel ? `_${sanitize(selectedPanel)}` : "";
    return `${domainPrefix}${datePart}${panelPart}_Candidates_${filteredCandidates.length}_users.${ext}`;
  };

  // Helper for status text in exports & UI
  const getStatusText = (c: any) => {
    if (c.isAdminAllotted || c.allottedBy === "ADMIN") {
      return "ALLOTTED BY ADMIN";
    }
    if (c.status === "BOOKED") {
      return "SELF BOOKED (STUDENT)";
    }
    return c.status || "N/A";
  };

  // Export ONLY Filtered Candidates to CSV
  const exportFilteredCSV = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available in current filter selection.");
      return;
    }
    let csv = "Name,Email,Phone,Branch,Domains,Date,Time Slot,Status\n";
    filteredCandidates.forEach((c) => {
      const domStr = `"${(c.domains || []).join(", ")}"`;
      const nameStr = `"${(c.name || "").replace(/"/g, '""')}"`;
      const stStr = `"${getStatusText(c)}"`;
      csv += `${nameStr},${c.email},${c.phone},"${c.branch}",${domStr},"${c.date}","${c.time_slot}",${stStr}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", getExportFileName("csv"));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export ONLY Filtered Candidates to Native Binary Excel (.xlsx format)
  const exportFilteredExcel = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available in current filter selection.");
      return;
    }

    const exportData = filteredCandidates.map((c, idx) => ({
      "Sr No": idx + 1,
      "Candidate Name": c.name || "N/A",
      "Email Address": c.email || "N/A",
      "Phone Number": c.phone || "N/A",
      "Branch": c.branch || "N/A",
      "Domain Preferences": (c.domains || []).join(", "),
      "Interview Date": c.date || "N/A",
      "Time Slot": c.time_slot || "N/A",
      "Booking Status": getStatusText(c),
      "Key Skills": c.skills || "N/A",
      "Why Join IEEE": c.whyPart || "N/A",
      "Why Work in Domains": c.whyWork || "N/A",
      "Projects Completed": c.projects || "N/A",
      "Expectations from IEEE": c.expectations || "N/A",
      "Extra Details": c.vagera || "N/A",
      "GitHub Link": c.github || "",
      "LinkedIn Link": c.linkedin || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 8 },  // Sr No
      { wch: 22 }, // Name
      { wch: 28 }, // Email
      { wch: 15 }, // Phone
      { wch: 22 }, // Branch
      { wch: 25 }, // Domains
      { wch: 14 }, // Date
      { wch: 20 }, // Time Slot
      { wch: 16 }, // Status
      { wch: 30 }, // Skills
      { wch: 35 }, // Why Join
      { wch: 35 }, // Why Work
      { wch: 30 }, // Projects
      { wch: 30 }, // Expectations
      { wch: 25 }, // Extra Details
      { wch: 30 }, // GitHub
      { wch: 30 }, // LinkedIn
    ];

    const worksheetTabName = selectedDomain ? selectedDomain.substring(0, 30) : "Filtered Candidates";
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetTabName);

    XLSX.writeFile(workbook, getExportFileName("xlsx"));
  };

  // Day-Wise Domain-Wise Multi-Sheet Excel Export Handler
  const exportDayWiseDomainExcel = (targetDate?: string) => {
    const dateToExport = targetDate || selectedDate;
    if (!dateToExport) {
      // Prompt modal to select date if no date is currently selected in filter
      setIsDayWiseExportModalOpen(true);
      return;
    }

    // Filter candidates booked on target date
    const bookedOnDay = candidates.filter(
      (c) => c.status === "BOOKED" && c.date === dateToExport
    );

    if (bookedOnDay.length === 0) {
      alert(`No booked candidates found for interview date: ${dateToExport}`);
      return;
    }

    // Collect all unique domains selected by candidates who booked on this date
    const uniqueDomainsSet = new Set<string>();
    bookedOnDay.forEach((c) => {
      (c.domains || []).forEach((d: string) => {
        if (d) uniqueDomainsSet.add(d);
      });
    });

    const domainList = Array.from(uniqueDomainsSet).sort();
    const workbook = XLSX.utils.book_new();

    const colWidths = [
      { wch: 8 },  // Sr No
      { wch: 22 }, // Name
      { wch: 28 }, // Email
      { wch: 15 }, // Phone
      { wch: 22 }, // Branch
      { wch: 25 }, // Domains
      { wch: 14 }, // Date
      { wch: 20 }, // Time Slot
      { wch: 16 }, // Status
      { wch: 30 }, // Skills
      { wch: 35 }, // Why Join
      { wch: 35 }, // Why Work
      { wch: 30 }, // Projects
      { wch: 30 }, // Expectations
      { wch: 25 }, // Extra Details
      { wch: 30 }, // GitHub
      { wch: 30 }, // LinkedIn
    ];

    // 1. Add Summary Sheet of All Candidates booked on this day
    const summaryData = bookedOnDay.map((c, idx) => ({
      "Sr No": idx + 1,
      "Candidate Name": c.name || "N/A",
      "Email Address": c.email || "N/A",
      "Phone Number": c.phone || "N/A",
      "Branch": c.branch || "N/A",
      "Domain Preferences": (c.domains || []).join(", "),
      "Interview Date": c.date || "N/A",
      "Time Slot": c.time_slot || "N/A",
      "Booking Status": getStatusText(c),
      "Key Skills": c.skills || "N/A",
      "Why Join IEEE": c.whyPart || "N/A",
      "Why Work in Domains": c.whyWork || "N/A",
      "Projects Completed": c.projects || "N/A",
      "Expectations from IEEE": c.expectations || "N/A",
      "Extra Details": c.vagera || "N/A",
      "GitHub Link": c.github || "",
      "LinkedIn Link": c.linkedin || "",
    }));

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(workbook, summarySheet, "All Candidates");

    // 2. Add Domain-Wise Sheets for each domain
    domainList.forEach((domainName) => {
      const domainCandidates = bookedOnDay.filter((c) =>
        (c.domains || []).includes(domainName)
      );

      if (domainCandidates.length > 0) {
        const domainData = domainCandidates.map((c, idx) => ({
          "Sr No": idx + 1,
          "Candidate Name": c.name || "N/A",
          "Email Address": c.email || "N/A",
          "Phone Number": c.phone || "N/A",
          "Branch": c.branch || "N/A",
          "All Selected Domains": (c.domains || []).join(", "),
          "Interview Date": c.date || "N/A",
          "Time Slot": c.time_slot || "N/A",
          "Booking Status": getStatusText(c),
          "Key Skills": c.skills || "N/A",
          "Why Join IEEE": c.whyPart || "N/A",
          "Why Work in Domains": c.whyWork || "N/A",
          "Projects Completed": c.projects || "N/A",
          "Expectations from IEEE": c.expectations || "N/A",
          "Extra Details": c.vagera || "N/A",
          "GitHub Link": c.github || "",
          "LinkedIn Link": c.linkedin || "",
        }));

        const domainSheet = XLSX.utils.json_to_sheet(domainData);
        domainSheet["!cols"] = colWidths;

        // Clean sheet tab title (Excel max 31 chars and no invalid characters)
        const sanitizedTabTitle = domainName.replace(/[:\\/?*\[\]]/g, "_").substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, domainSheet, sanitizedTabTitle);
      }
    });

    const sanitizedDateStr = dateToExport.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `DayWise_${sanitizedDateStr}_DomainResponses_${bookedOnDay.length}_Students.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setIsDayWiseExportModalOpen(false);
  };

  // Export ONLY Filtered Candidates to JSON
  const exportFilteredJSON = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available in current filter selection.");
      return;
    }
    const dataStr = JSON.stringify(filteredCandidates, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", getExportFileName("json"));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export ONLY Filtered Candidates as PDF / Print Report
  const exportFilteredPDF = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available in current filter selection.");
      return;
    }

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const filterCriteriaStr = [
      selectedDate ? `Date: ${selectedDate}` : null,
      selectedTimeSlot ? `Time: ${selectedTimeSlot}` : null,
      selectedDomain ? `Domain: ${selectedDomain}` : null,
      selectedPanel ? `Panel: ${selectedPanel}` : null,
      selectedStatus ? `Status: ${selectedStatus}` : null,
      searchQuery ? `Search: "${searchQuery}"` : null,
    ]
      .filter(Boolean)
      .join(" | ") || "All Registered Candidates";

    const rowsHtml = filteredCandidates
      .map(
        (c, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${idx + 1}. ${c.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${c.email}<br><small style="color: #666;">${c.phone}</small></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${c.branch || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${(c.domains || []).join(", ") || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${c.date || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${c.time_slot || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${c.status === "BOOKED" ? "#059669" : "#dc2626"
          };">${c.status}</td>
      </tr>
    `
      )
      .join("");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>IEEE VIT Pune - Segregated Candidate Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
          h1 { color: #0066cc; margin-bottom: 4px; font-size: 20px; }
          p { margin: 0 0 16px 0; color: #555; font-size: 12px; }
          .filter-box { background: #f0f4f8; padding: 10px; border-radius: 6px; border-left: 4px solid #0066cc; margin-bottom: 20px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #0066cc; color: white; padding: 8px; text-align: left; font-size: 11px; border: 1px solid #0055b3; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>IEEE Student Branch VIT Pune</h1>
        <p>Interview Candidate Segregation Report • Total Exported Users: <strong>${filteredCandidates.length}</strong></p>
        <div class="filter-box">
          <strong>Applied Segregation Filters:</strong> ${filterCriteriaStr}
        </div>
        <table>
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Contact Email & Phone</th>
              <th>Branch</th>
              <th>Domains</th>
              <th>Interview Date</th>
              <th>Time Slot</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Export ONLY Admin Allotted Candidates as dedicated PDF Report (User details + Allotted Slot info only)
  const exportAdminAllottedPDF = () => {
    const adminAllottedCandidates = candidates.filter(
      (c) => c.status === "BOOKED" && (c.isAdminAllotted || c.allottedBy === "ADMIN")
    );

    if (adminAllottedCandidates.length === 0) {
      alert("No candidates found whose interview slot was allotted by Admin.");
      return;
    }

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const rowsHtml = adminAllottedCandidates
      .map(
        (c, idx) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">
          <strong style="color: #0f172a; font-size: 13px;">${c.name}</strong>
        </td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${c.branch || "N/A"}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #0284c7;">
          ${(c.domains || []).join(", ") || "N/A"}
        </td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #1e293b;">
          ${c.date || "N/A"}
        </td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-family: monospace; color: #334155;">
          ${c.time_slot || "N/A"}
        </td>
      </tr>
    `
      )
      .join("");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>IEEE VIT Pune - Admin Allotted Candidates Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 24px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #7c3aed; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { color: #6d28d9; margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { color: #64748b; margin: 4px 0 0 0; font-size: 13px; font-weight: 500; }
          .badge { background: #f3e8ff; color: #7c3aed; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #ddd6fe; display: inline-block; }
          .summary-card { background: #faf5ff; border: 1px solid #e9d5ff; border-left: 5px solid #7c3aed; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { background: #7c3aed; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #6d28d9; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 24px; text-align: right; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>IEEE Student Branch VIT Pune</h1>
            <p class="subtitle">Official Admin Allotted Interview Candidates Master Schedule</p>
          </div>
          <div style="text-align: right;">
            <span class="badge">ADMIN ALLOTTED ONLY</span>
          </div>
        </div>

        <div class="summary-card">
          <strong style="color: #6d28d9; font-size: 13px;">Executive Allotment Summary:</strong><br>
          Total Candidates Allotted by Admin: <strong>${adminAllottedCandidates.length} Candidates</strong><br>
          Report Generated On: <strong>${new Date().toLocaleString("en-IN")}</strong>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Candidate Name</th>
              <th>Branch</th>
              <th>Applied Domains</th>
              <th>Interview Date</th>
              <th>Time Slot</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          IEEE VIT Pune Recruitment Management System • Confidential Master Schedule
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Toggle allotment source for a candidate (ADMIN vs STUDENT)
  const handleToggleAllotmentSource = async (candidate: any) => {
    if (!candidate?.email || candidate.status !== "BOOKED") return;
    const currentIsAdmin = !!(candidate.isAdminAllotted || candidate.allottedBy === "ADMIN");
    const targetAllottedBy = currentIsAdmin ? "STUDENT" : "ADMIN";

    try {
      const res = await fetch("/api/admin/allot-slot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: candidate.email,
          allottedBy: targetAllottedBy,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAnalytics();
      } else {
        alert(data.message || "Failed to update allotment source.");
      }
    } catch (err) {
      alert("Network error updating allotment source.");
    }
  };

  // Open Manual Slot Allotment Modal for a specific candidate
  const openManualAllotModal = async (candidate: any) => {
    setSelectedCandidateForAllot(candidate);
    setSelectedSlotIdToAssign("");
    setAllotError(null);
    setAllotSuccess(null);
    await fetchAvailableSlots();
    setIsManualAllotModalOpen(true);
  };

  // Confirm Manual Slot Allotment Submission
  const handleConfirmManualAllot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateForAllot || !selectedSlotIdToAssign) {
      setAllotError("Please select an available interview slot.");
      return;
    }

    setAllottingLoading(true);
    setAllotError(null);
    setAllotSuccess(null);

    try {
      const res = await fetch("/api/admin/allot-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: selectedCandidateForAllot.email,
          slotId: selectedSlotIdToAssign,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAllotSuccess(data.message);
        await fetchAnalytics();
        await fetchAvailableSlots();
      } else {
        setAllotError(data.message || "Failed to allot slot.");
      }
    } catch (err) {
      setAllotError("Network error: Failed to complete slot allotment.");
    } finally {
      setAllottingLoading(false);
    }
  };

  // Open Bulk Auto-Allotment Modal
  const openAutoAllotModal = async () => {
    setAutoAllotResult(null);
    await fetchAvailableSlots();
    setIsAutoAllotModalOpen(true);
  };

  // Execute Bulk Auto-Allotment with Date Selection
  const handleRunAutoAllotment = async () => {
    setAutoAllotLoading(true);
    setAutoAllotResult(null);

    try {
      const res = await fetch("/api/admin/allot-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoAllot: true,
          targetDate: selectedAutoAllotDate,
          excludePastDates: selectedAutoAllotDate !== "ALL_INCLUDING_PAST",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAutoAllotResult(data);
        await fetchAnalytics();
        await fetchAvailableSlots();
      } else {
        alert(data.message || "Failed to auto-allot slots.");
      }
    } catch (err) {
      alert("Network error: Failed to execute auto-allotment.");
    } finally {
      setAutoAllotLoading(false);
    }
  };

  // Revert/Clear Admin Allotted Candidate Bookings
  const handleRevertAdminAllotments = async () => {
    const isSpecificDate = selectedAutoAllotDate && selectedAutoAllotDate !== "FUTURE_ONLY" && selectedAutoAllotDate !== "ALL" && selectedAutoAllotDate !== "ALL_INCLUDING_PAST";
    const datePromptStr = isSpecificDate ? `on date ${selectedAutoAllotDate}` : "across all dates";
    if (!confirm(`Are you sure you want to revert all admin-allotted candidate bookings ${datePromptStr}? They will return to the pending unbooked candidates queue.`)) {
      return;
    }

    setAutoAllotLoading(true);
    try {
      const res = await fetch("/api/admin/allot-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revertAdminAllotted: true,
          targetDate: isSpecificDate ? selectedAutoAllotDate : "ALL",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchAnalytics();
        await fetchAvailableSlots();
        setIsAutoAllotModalOpen(false);
      } else {
        alert(data.message || "Failed to revert allotments.");
      }
    } catch (err) {
      alert("Network error: Failed to revert allotments.");
    } finally {
      setAutoAllotLoading(false);
    }
  };

  // Revert/Clear All Candidate Bookings Created After 1:00 PM Today (Cutoff time fix)
  const handleRevertRecentAutoAllotments = async () => {
    if (!confirm("Are you sure you want to revert all candidate bookings created after 1:00 PM today? All auto-allotted candidates will return to the pending booking queue.")) {
      return;
    }

    setAutoAllotLoading(true);
    try {
      const res = await fetch("/api/admin/allot-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revertByCutoffTime: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchAnalytics();
        await fetchAvailableSlots();
        setIsAutoAllotModalOpen(false);
      } else {
        alert(data.message || "Failed to revert recent allotments.");
      }
    } catch (err) {
      alert("Network error: Failed to revert recent allotments.");
    } finally {
      setAutoAllotLoading(false);
    }
  };

  // Mark All Candidate Bookings Created After 1:00 PM Today as Admin Allotted
  const handleMarkRecentAsAdminAllotted = async () => {
    if (!confirm("Mark all candidate bookings created after 1:00 PM today as Admin Allotted?")) {
      return;
    }

    setAutoAllotLoading(true);
    try {
      const res = await fetch("/api/admin/allot-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markAdminByCutoffTime: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchAnalytics();
        await fetchAvailableSlots();
        setIsAutoAllotModalOpen(false);
      } else {
        alert(data.message || "Failed to mark recent allotments.");
      }
    } catch (err) {
      alert("Network error: Failed to mark recent allotments.");
    } finally {
      setAutoAllotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading live database interview analytics...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "ADMIN" || !stats) return null;

  const topDomain = Object.entries(stats.domain_counts || {}).sort((a: any, b: any) => b[1] - a[1])[0];
  const pendingCandidatesCount = candidates.filter((c) => c.status === "PENDING_BOOKING").length;
  const adminAllottedCount = candidates.filter((c) => c.status === "BOOKED" && (c.isAdminAllotted || c.allottedBy === "ADMIN")).length;
  const studentBookedCount = candidates.filter((c) => c.status === "BOOKED" && !(c.isAdminAllotted || c.allottedBy === "ADMIN")).length;

  return (
    <div className="p-6 relative z-10 min-h-[calc(100vh-4rem)] max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" /> Interview Segregation CMS Panel
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">
                Real-time read-only segregation engine connected to live database
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                <Database className="h-3 w-3" />
                {dataSource === "LIVE_DATABASE" ? "LIVE MONGODB" : "DATASET FILE"}
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Actions Toolbar (Allotments & Exports) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk Auto-Allotment Trigger */}
          <Button
            onClick={openAutoAllotModal}
            size="sm"
            className="gap-1.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5" /> Auto-Allot Empty Slots ({pendingCandidatesCount})
          </Button>

          {/* Revert Auto-Allotments Created After 1:00 PM Today */}
          <Button
            onClick={handleRevertRecentAutoAllotments}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20 shadow-sm"
            title="Reverts all candidate bookings created after 1:00 PM today back to pending status"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Revert Auto-Allotments (Post 1 PM)
          </Button>

          {/* Tag Bookings Created After 1:00 PM Today as Admin Allotted */}
          <Button
            onClick={handleMarkRecentAsAdminAllotted}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold border-purple-500/40 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 shadow-sm"
            title="Tags all candidate bookings created after 1:00 PM today as Admin Allotted"
          >
            <UserCheck className="h-3.5 w-3.5" /> Tag Post 1 PM as Admin
          </Button>

          {/* Day-Wise Multi-Domain Excel Export Trigger */}
          <Button
            onClick={() => exportDayWiseDomainExcel()}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-sm"
          >
            <Layers className="h-3.5 w-3.5" /> Day-Wise Domain Excel
          </Button>

          {/* Filtered Excel (.xlsx) */}
          <Button
            onClick={exportFilteredExcel}
            variant="outline"
            size="sm"
            className="gap-1 text-xs font-semibold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel (.xlsx)
          </Button>

          <Button
            onClick={exportFilteredCSV}
            variant="outline"
            size="sm"
            className="gap-1 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </Button>

          <Button
            onClick={exportFilteredJSON}
            variant="outline"
            size="sm"
            className="gap-1 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
          >
            <FileJson className="h-3.5 w-3.5" /> JSON
          </Button>

          <Button
            onClick={exportFilteredPDF}
            size="sm"
            className="gap-1 text-xs font-semibold bg-primary text-primary-foreground shadow-md"
          >
            <Printer className="h-3.5 w-3.5" /> PDF Report (Filtered)
          </Button>

          <Button
            onClick={exportAdminAllottedPDF}
            size="sm"
            className="gap-1 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 shadow-md"
          >
            <Printer className="h-3.5 w-3.5" /> PDF (Admin Allotted) ({adminAllottedCount})
          </Button>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Applicant Applications</p>
            <p className="text-3xl font-extrabold text-foreground mt-2">{stats.total_applicants}</p>
            <p className="text-[11px] text-primary mt-1 font-semibold">
              {stats.total_slots} Total Record Slots
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Confirmed Bookings</p>
            <p className="text-3xl font-extrabold text-green-400 mt-2">{stats.booked_slots}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {adminAllottedCount} Admin Allotted
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {studentBookedCount} Self Booked
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Slot Bookings</p>
            <p className="text-3xl font-extrabold text-amber-400 mt-2">{pendingCandidatesCount}</p>
            <p className="text-[11px] text-amber-500 mt-1 font-semibold">
              Needs Empty Slot Allotment
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Most Popular Domain</p>
            <p className="text-2xl font-extrabold text-primary mt-2 truncate">
              {topDomain ? topDomain[0] : "N/A"}
            </p>
            <p className="text-[11px] text-primary/80 mt-1 font-semibold">
              {topDomain ? String(topDomain[1]) : 0} Candidates Selected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segregation Filter Toolbar */}
      <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" /> Live Segregation Filters
            </CardTitle>
            <CardDescription className="text-xs">
              Filter candidates live in the CMS panel & export ONLY the filtered subset below
            </CardDescription>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Showing <span className="font-bold text-primary">{filteredCandidates.length}</span> of {candidates.length} users
          </div>
        </CardHeader>

        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="space-y-1">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">Search Candidate</Label>
            <div className="relative">
              <Input
                placeholder="Name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-14 bg-background/50"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">Interview Date</Label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-14 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Dates</option>
              {(stats.unique_dates || []).map((d: string) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot */}
          <div className="space-y-1">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">Time Slot</Label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full h-14 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Time Slots</option>
              {(stats.unique_times || []).map((t: string) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Domain */}
          <div className="space-y-1">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">Domain</Label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full h-14 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Domains</option>
              {(stats.unique_domains || []).map((dom: string) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">Status</Label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-14 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Statuses</option>
              <option value="SELF_BOOKED">SELF BOOKED (STUDENT)</option>
              <option value="ALLOTTED_ADMIN">ALLOTTED BY ADMIN</option>
              <option value="PENDING_BOOKING">PENDING BOOKING</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Data Table */}
      <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Filtered Candidate List ({filteredCandidates.length})</CardTitle>
            <CardDescription className="text-xs">
              Live records from MongoDB database based on active filter choices
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => exportDayWiseDomainExcel()}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Layers className="h-3.5 w-3.5" /> Day-Wise Domain Excel
            </Button>
            <Button
              onClick={exportFilteredExcel}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Filtered Excel
            </Button>
            <Button
              onClick={exportFilteredPDF}
              size="sm"
              className="h-8 text-xs font-semibold gap-1 bg-primary text-primary-foreground"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </Button>
            <Button
              onClick={exportAdminAllottedPDF}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold gap-1 border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
            >
              <Printer className="h-3.5 w-3.5 text-purple-300" /> Admin Allotted PDF ({adminAllottedCount})
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground">Candidate Profile</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground">Branch</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground">Domain Preferences</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground">Interview Date</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground">Time Slot</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground text-center">Allotted By Source</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground text-right">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground font-semibold">
                    No candidate records match the current segregation filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c, i) => {
                  const isBooked = c.status === "BOOKED";
                  const isPending = c.status === "PENDING_BOOKING";
                  const isAdminAllotted = !!(c.isAdminAllotted || c.allottedBy === "ADMIN");
                  const isStudentBooked = isBooked && !isAdminAllotted;
                  const isAdminAllottedBooked = isBooked && isAdminAllotted;

                  const isExpanded = expandedCandidateIndex === i;
                  const hasEvaluationData = c.whyPart || c.whyWork || c.skills || c.projects || c.expectations;

                  return (
                    <React.Fragment key={i}>
                      <tr className={`transition-colors ${
                        isAdminAllottedBooked
                          ? "bg-purple-950/30 border-l-4 border-l-purple-500 hover:bg-purple-900/40"
                          : isStudentBooked
                            ? "bg-emerald-950/15 border-l-4 border-l-emerald-500 hover:bg-emerald-900/20"
                            : "hover:bg-muted/10 border-l-4 border-l-amber-500/50"
                      }`}>
                        <td className="p-3.5">
                          <div className="font-bold text-foreground flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5">
                              {c.name}
                              {isAdminAllottedBooked && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-500/30 text-purple-200 border border-purple-400">
                                  ADMIN ALLOTTED
                                </span>
                              )}
                            </span>
                            {hasEvaluationData && (
                              <button
                                type="button"
                                onClick={() => setExpandedCandidateIndex(isExpanded ? null : i)}
                                className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded"
                              >
                                <FileText className="h-3 w-3" />
                                {isExpanded ? "Hide Evaluation" : "View Evaluation"}
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground/60" /> {c.email}
                          </div>
                          <div className="text-[10px] text-muted-foreground/80 font-mono flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 text-muted-foreground/50" /> {c.phone}
                          </div>
                        </td>

                        <td className="p-3.5 text-muted-foreground font-medium">{c.branch || "N/A"}</td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(c.domains || []).map((dom: string, dIdx: number) => (
                              <span
                                key={dIdx}
                                className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold"
                              >
                                {dom}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-muted-foreground">{c.date || "N/A"}</td>

                        <td className="p-3.5 font-mono text-muted-foreground">{c.time_slot || "N/A"}</td>

                        {/* Dedicated Allotted By Source Column */}
                        <td className="p-3.5 text-center">
                          {isBooked ? (
                            <div className="flex flex-col items-center gap-1">
                              {isAdminAllottedBooked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/25 text-purple-200 border border-purple-400 shadow-md shadow-purple-500/20">
                                  <UserCheck className="h-3 w-3 text-purple-300" />
                                  ALLOTTED BY ADMIN
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  CANDIDATE SELF-BOOKED
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleAllotmentSource(c)}
                                className="text-[9px] text-muted-foreground hover:text-foreground hover:underline font-semibold"
                                title="Click to change allotment source tag"
                              >
                                {isAdminAllottedBooked ? "[Switch to Self-Booked]" : "[Mark Admin Allotted]"}
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              UNBOOKED
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-y-1">
                          <div>
                            {isAdminAllottedBooked ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
                                <UserCheck className="h-3 w-3 text-purple-300" />
                                ALLOTTED BY ADMIN
                              </span>
                            ) : isStudentBooked ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                SELF BOOKED
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                <XCircle className="h-3 w-3 text-amber-400" />
                                PENDING BOOKING
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/25">
                                <XCircle className="h-3 w-3" />
                                {c.status}
                              </span>
                            )}
                          </div>

                          {/* Action to allot slot if student has not selected a slot */}
                          {isPending && (
                            <div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openManualAllotModal(c)}
                                className="h-6 text-[10px] font-bold gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 px-2 py-0"
                              >
                                <CalendarPlus className="h-3 w-3" /> Allot Slot
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Evaluation Form Details */}
                      {isExpanded && (
                        <tr className="bg-primary/5 border-b border-border/40">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
                              <FileText className="h-4 w-4" /> Candidate Interview Form Evaluation Details
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                              {c.skills && (
                                <div className="bg-background/60 p-2.5 rounded border border-border/50 space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Key Skills & Tech:</span>
                                  <p className="text-foreground">{c.skills}</p>
                                </div>
                              )}

                              {c.whyPart && (
                                <div className="bg-background/60 p-2.5 rounded border border-border/50 space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Why Join IEEE:</span>
                                  <p className="text-foreground">{c.whyPart}</p>
                                </div>
                              )}

                              {c.whyWork && (
                                <div className="bg-background/60 p-2.5 rounded border border-border/50 space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Why Work in Domains:</span>
                                  <p className="text-foreground">{c.whyWork}</p>
                                </div>
                              )}

                              {c.projects && (
                                <div className="bg-background/60 p-2.5 rounded border border-border/50 space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Projects Completed:</span>
                                  <p className="text-foreground">{c.projects}</p>
                                </div>
                              )}

                              {c.expectations && (
                                <div className="bg-background/60 p-2.5 rounded border border-border/50 space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Expectations from IEEE:</span>
                                  <p className="text-foreground">{c.expectations}</p>
                                </div>
                              )}

                              {(c.github || c.linkedin) && (
                                <div className="bg-background/60 p-2.5 rounded border border-border/50 space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Profiles & Links:</span>
                                  <div className="flex flex-col gap-1 text-[11px]">
                                    {c.github && (
                                      <a href={c.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono truncate">
                                        GitHub: {c.github}
                                      </a>
                                    )}
                                    {c.linkedin && (
                                      <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono truncate">
                                        LinkedIn: {c.linkedin}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MANUAL SLOT ALLOTMENT MODAL */}
      <Dialog open={isManualAllotModalOpen} onOpenChange={setIsManualAllotModalOpen}>
        <DialogContent onClose={() => setIsManualAllotModalOpen(false)} className="bg-card/95 backdrop-blur-xl border-border/80 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <CalendarPlus className="h-5 w-5 text-amber-400" /> Admin Slot Allotment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assign an empty interview slot to candidate who hasn&apos;t booked yet.
            </DialogDescription>
          </DialogHeader>

          {selectedCandidateForAllot && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1 text-xs">
              <p className="font-bold text-foreground">{selectedCandidateForAllot.name}</p>
              <p className="text-muted-foreground font-mono">{selectedCandidateForAllot.email} | {selectedCandidateForAllot.phone}</p>
              <p className="text-primary font-semibold">Domains: {(selectedCandidateForAllot.domains || []).join(", ")}</p>
            </div>
          )}

          {allotError && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive-foreground">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{allotError}</span>
            </div>
          )}

          {allotSuccess && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-xs flex items-center gap-2 font-bold text-green-400">
              <Check className="h-4 w-4 shrink-0" />
              <span>{allotSuccess}</span>
            </div>
          )}

          <form onSubmit={handleConfirmManualAllot} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Select Active Empty Slot</Label>
              <select
                value={selectedSlotIdToAssign}
                onChange={(e) => setSelectedSlotIdToAssign(e.target.value)}
                required
                className="w-full h-10 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Choose an available slot --</option>
                {availableSlotsForSelect.map((slot) => {
                  const dateStr = new Date(slot.dateTime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const startTimeStr = new Date(slot.dateTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endTimeStr = new Date(slot.endDateTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isFull = slot.isFull;

                  return (
                    <option key={slot._id} value={slot._id} disabled={isFull}>
                      {dateStr} ({startTimeStr} - {endTimeStr}) — {slot.availableSpots} / {slot.maxStudents} spots open {isFull ? "[FULL]" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManualAllotModalOpen(false)}
                disabled={allottingLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-1.5 font-bold bg-amber-500 text-black hover:bg-amber-400"
                disabled={allottingLoading || !selectedSlotIdToAssign}
              >
                {allottingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Slot Allotment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BULK AUTO-ALLOTMENT MODAL */}
      <Dialog open={isAutoAllotModalOpen} onOpenChange={setIsAutoAllotModalOpen}>
        <DialogContent onClose={() => setIsAutoAllotModalOpen(false)} className="bg-card/95 backdrop-blur-xl border-border/80 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-amber-400" /> Auto-Allot Empty Slots
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Automatically assign active empty interview slots to all candidates whose booking status is pending.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
              <p className="font-bold text-amber-300">Pending Unbooked Candidates: {pendingCandidatesCount}</p>
              <p className="text-muted-foreground">
                Total available spots across open active slots:{" "}
                <span className="font-bold text-foreground">
                  {availableSlotsForSelect.reduce((acc, s) => acc + (s.availableSpots || 0), 0)}
                </span>
              </p>
            </div>

            {/* Target Date Selector */}
            <div className="space-y-1.5 border-t border-border/20 pt-3">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Target Interview Date for Auto-Allotment
              </Label>
              <select
                value={selectedAutoAllotDate}
                onChange={(e) => setSelectedAutoAllotDate(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
              >
                <option value="FUTURE_ONLY">📅 Future / Upcoming Dates Only (Excludes Past Dates)</option>
                <option value="ALL">📅 All Active Dates (Chronological)</option>
                {(stats?.unique_dates || []).map((d: string) => (
                  <option key={d} value={d}>
                    📅 Specific Date: {d}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground">
                Selecting a specific date forces the auto-allotment engine to ONLY assign candidates into open slots on that exact day!
              </p>
            </div>

            {autoAllotResult && (
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-xs space-y-1 font-bold text-green-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{autoAllotResult.message}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRevertRecentAutoAllotments}
              disabled={autoAllotLoading}
              className="text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10 gap-1 sm:mr-auto"
              title="Reverts all candidate bookings created after 1:00 PM today back to pending status"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Revert Auto-Allotments (Post 1 PM)
            </Button>

            <Button
              type="button"
              onClick={handleRunAutoAllotment}
              disabled={autoAllotLoading || pendingCandidatesCount === 0}
              className="flex items-center gap-1.5 font-bold bg-amber-500 text-black hover:bg-amber-400"
            >
              {autoAllotLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Run Auto-Allotment Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DAY-WISE DOMAIN EXPORT DATE PICKER MODAL */}
      <Dialog open={isDayWiseExportModalOpen} onOpenChange={setIsDayWiseExportModalOpen}>
        <DialogContent onClose={() => setIsDayWiseExportModalOpen(false)} className="bg-card/95 backdrop-blur-xl border-border/80 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Layers className="h-5 w-5 text-emerald-400" /> Day-Wise Domain Excel Export
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an interview date to generate an Excel workbook with multi-sheets for all domains.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="font-bold text-foreground">Select Interview Date</Label>
              <select
                value={exportDateChoice}
                onChange={(e) => setExportDateChoice(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Select Date --</option>
                {(stats?.unique_dates || []).map((d: string) => (
                  <option key={d} value={d}>
                    {d} ({candidates.filter((c) => c.date === d && c.status === "BOOKED").length} booked candidates)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDayWiseExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!exportDateChoice}
              onClick={() => exportDayWiseDomainExcel(exportDateChoice)}
              className="flex items-center gap-1.5 font-bold bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <Download className="h-4 w-4" /> Download Day-Wise Workbook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
