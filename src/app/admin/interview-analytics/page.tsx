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
  FileText
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [selectedPanel, setSelectedPanel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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

    if (selectedPanel) {
      result = result.filter((c) => c.panel === selectedPanel);
    }

    if (selectedStatus) {
      result = result.filter((c) => c.status === selectedStatus);
    }

    setFilteredCandidates(result);
  }, [searchQuery, selectedDate, selectedTimeSlot, selectedDomain, selectedPanel, selectedStatus, candidates]);

  // Dynamic filename helper based on selected domain and filter parameters
  const getExportFileName = (ext: string) => {
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, "_");
    const domainPrefix = selectedDomain ? sanitize(selectedDomain) : "All_Domains";
    const datePart = selectedDate ? `_${sanitize(selectedDate)}` : "";
    const panelPart = selectedPanel ? `_${sanitize(selectedPanel)}` : "";
    return `${domainPrefix}${datePart}${panelPart}_Candidates_${filteredCandidates.length}_users.${ext}`;
  };

  // Export ONLY Filtered Candidates to CSV
  const exportFilteredCSV = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available in current filter selection.");
      return;
    }
    let csv = "Name,Email,Phone,Branch,Domains,Date,Time Slot,Panel,Status\n";
    filteredCandidates.forEach((c) => {
      const domStr = `"${(c.domains || []).join(", ")}"`;
      const nameStr = `"${(c.name || "").replace(/"/g, '""')}"`;
      csv += `${nameStr},${c.email},${c.phone},"${c.branch}",${domStr},"${c.date}","${c.time_slot}","${c.panel}",${c.status}\n`;
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
      "Panel": c.panel || "N/A",
      "Booking Status": c.status || "N/A",
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

    // Set column widths for readability
    worksheet["!cols"] = [
      { wch: 8 },  // Sr No
      { wch: 22 }, // Name
      { wch: 28 }, // Email
      { wch: 15 }, // Phone
      { wch: 22 }, // Branch
      { wch: 25 }, // Domains
      { wch: 14 }, // Date
      { wch: 20 }, // Time Slot
      { wch: 12 }, // Panel
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
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${c.panel || "N/A"}</td>
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
              <th>Panel</th>
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

        {/* Dedicated Export Actions Toolbar for Filtered Users Only */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={exportFilteredExcel}
            variant="outline"
            size="sm"
            className="gap-1 text-xs font-semibold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel (.xlsx) (Filtered)
          </Button>

          <Button
            onClick={exportFilteredCSV}
            variant="outline"
            size="sm"
            className="gap-1 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV (Filtered)
          </Button>

          <Button
            onClick={exportFilteredJSON}
            variant="outline"
            size="sm"
            className="gap-1 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
          >
            <FileJson className="h-3.5 w-3.5" /> JSON (Filtered)
          </Button>

          <Button
            onClick={exportFilteredPDF}
            size="sm"
            className="gap-1 text-xs font-semibold bg-primary text-primary-foreground shadow-md"
          >
            <Printer className="h-3.5 w-3.5" /> PDF Report (Filtered)
          </Button>

          <a href="/interview-analytics.html" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" /> Standalone HTML
            </Button>
          </a>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Slot Bookings</p>
            <p className="text-3xl font-extrabold text-foreground mt-2">{stats.total_slots}</p>
            <p className="text-[11px] text-primary mt-1 font-semibold">
              {stats.total_applicants} Live Registered Applicants
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Bookings</p>
            <p className="text-3xl font-extrabold text-green-400 mt-2">{stats.booked_slots}</p>
            <p className="text-[11px] text-green-500 mt-1 font-semibold">
              {((stats.booked_slots / (stats.total_slots || 1)) * 100).toFixed(1)}% Confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/40 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cancelled Bookings</p>
            <p className="text-3xl font-extrabold text-destructive mt-2">{stats.cancelled_slots}</p>
            <p className="text-[11px] text-destructive mt-1 font-semibold">
              {((stats.cancelled_slots / (stats.total_slots || 1)) * 100).toFixed(1)}% Cancelled
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

        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
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

          {/* Panel */}
          <div className="space-y-1">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">Panel</Label>
            <select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
              className="w-full h-14 rounded-md border border-input bg-background/50 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Panels</option>
              {(stats.unique_panels || []).map((p: string) => (
                <option key={p} value={p}>
                  {p}
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
              <option value="BOOKED">BOOKED</option>
              <option value="PENDING_BOOKING">PENDING_BOOKING</option>
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
              onClick={exportFilteredExcel}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export Filtered Excel ({filteredCandidates.length})
            </Button>
            <Button
              onClick={exportFilteredCSV}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold gap-1"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> Export Filtered CSV ({filteredCandidates.length})
            </Button>
            <Button
              onClick={exportFilteredPDF}
              size="sm"
              className="h-8 text-xs font-semibold gap-1 bg-primary text-primary-foreground"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
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
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground text-center">Panel</th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-muted-foreground text-right">Status</th>
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
                  const isExpanded = expandedCandidateIndex === i;
                  const hasEvaluationData = c.whyPart || c.whyWork || c.skills || c.projects || c.expectations;

                  return (
                    <React.Fragment key={i}>
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-foreground flex items-center justify-between gap-2">
                            <span>{c.name}</span>
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

                        <td className="p-3.5 text-center font-bold text-primary">{c.panel || "N/A"}</td>

                        <td className="p-3.5 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isBooked
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : c.status === "PENDING_BOOKING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                              }`}
                          >
                            {isBooked ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {c.status}
                          </span>
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
    </div>
  );
}
