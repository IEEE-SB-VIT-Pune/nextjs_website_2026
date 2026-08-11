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
  FileSpreadsheet
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, type UserProfile } from "@/services/auth";

export default function AdminInterviewAnalyticsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [dataSource, setDataSource] = useState<string>("LIVE_DATABASE");
  const [stats, setStats] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);

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
    link.setAttribute("download", `filtered_candidates_${filteredCandidates.length}_users.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export ONLY Filtered Candidates to Excel (.xls / .xlsx format)
  const exportFilteredExcel = () => {
    if (filteredCandidates.length === 0) {
      alert("No candidates available in current filter selection.");
      return;
    }

    const escapeXml = (str: string) =>
      (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    let excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0066CC" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Booked">
   <Font ss:Color="#059669" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Cancelled">
   <Font ss:Color="#DC2626" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Pending">
   <Font ss:Color="#D97706" ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Filtered Candidates">
  <Table>
   <Column ss:Width="50"/>
   <Column ss:Width="160"/>
   <Column ss:Width="190"/>
   <Column ss:Width="110"/>
   <Column ss:Width="160"/>
   <Column ss:Width="150"/>
   <Column ss:Width="100"/>
   <Column ss:Width="130"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Sr No.</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Candidate Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Email Address</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Phone Number</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Branch</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Domain Preferences</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Interview Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Time Slot</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Panel</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
   </Row>`;

    filteredCandidates.forEach((c, idx) => {
      const statusStyle = c.status === "BOOKED" ? "Booked" : c.status === "CANCELLED" ? "Cancelled" : "Pending";

      excelXml += `
   <Row>
    <Cell><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.email)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.phone)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.branch)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml((c.domains || []).join(", "))}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.date)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.time_slot)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(c.panel)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(c.status)}</Data></Cell>
   </Row>`;
    });

    excelXml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelXml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `filtered_candidates_${filteredCandidates.length}_users.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    link.setAttribute("download", `filtered_candidates_${filteredCandidates.length}_users.json`);
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
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel (.xls) (Filtered)
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
                  return (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{c.name}</div>
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
