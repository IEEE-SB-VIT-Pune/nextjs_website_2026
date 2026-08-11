#!/usr/bin/env python3
import os
import json
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLOT_FILE = os.path.join(WORKSPACE_DIR, "Interview Slot.xlsx")
RESPONSE_FILE = os.path.join(WORKSPACE_DIR, "Interview Response 4 Aug 848pm.xlsx")
JSON_OUTPUT = os.path.join(WORKSPACE_DIR, "src", "lib", "interview_analytics_data.json")
STANDALONE_HTML_OUTPUT = os.path.join(WORKSPACE_DIR, "public", "interview-analytics.html")

def parse_xlsx(file_path):
    if not os.path.exists(file_path):
        return []
    with zipfile.ZipFile(file_path, 'r') as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for elem in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                strings.append(elem.text if elem.text else '')

        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in sheet_tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_vals = []
            for cell in row.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                t = cell.attrib.get('t')
                v = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = v.text if v is not None else ''
                if t == 's' and val.isdigit() and int(val) < len(strings):
                    val = strings[int(val)]
                row_vals.append(val.strip())
            rows.append(row_vals)
        return rows

def process_data():
    print(f"Reading {SLOT_FILE}...")
    slot_rows = parse_xlsx(SLOT_FILE)
    print(f"Reading {RESPONSE_FILE}...")
    response_rows = parse_xlsx(RESPONSE_FILE)

    # Process responses to build applicant map by email
    applicant_map = {}
    if response_rows:
        resp_headers = [h.lower() for h in response_rows[0]]
        for r in response_rows[1:]:
            if len(r) >= 3 and r[2]:
                email = r[2].strip().lower()
                applicant_map[email] = {
                    "timestamp": r[0] if len(r) > 0 else "",
                    "name": r[1] if len(r) > 1 else "",
                    "email": email,
                    "phone": r[3] if len(r) > 3 else "",
                    "github": r[4] if len(r) > 4 else "",
                    "linkedin": r[5] if len(r) > 5 else "",
                    "branch": r[6] if len(r) > 6 else "",
                    "domains": r[7] if len(r) > 7 else "",
                    "why_join": r[8] if len(r) > 8 else "",
                    "why_domains": r[9] if len(r) > 9 else "",
                    "skills": r[10] if len(r) > 10 else "",
                    "projects": r[11] if len(r) > 11 else "",
                }

    # Process interview slot bookings
    candidates = []
    # Identify header row for slots
    header_idx = -1
    for i, r in enumerate(slot_rows):
        if any("Name" in cell or "email" in cell or "Domain" in cell for cell in r):
            header_idx = i
            break

    if header_idx != -1:
        data_rows = slot_rows[header_idx + 1:]
    else:
        data_rows = slot_rows

    # Parse slot rows
    for r in data_rows:
        if not r or len(r) < 3:
            continue
        # Expected structure: TimeStamp, Name, email, Phone No., Branch, Domain, Interview Date, Interview Time, Panel, EventId/bookingStatus
        timestamp = r[0] if len(r) > 0 else ""
        name = r[1] if len(r) > 1 else ""
        email = r[2].strip().lower() if len(r) > 2 else ""
        phone = r[3] if len(r) > 3 else ""
        branch = r[4] if len(r) > 4 else ""
        domain = r[5] if len(r) > 5 else ""
        date = r[6] if len(r) > 6 else ""
        time_slot = r[7] if len(r) > 7 else ""
        panel = r[8] if len(r) > 8 else ""
        status = r[9] if len(r) > 9 else "BOOKED"
        if len(r) > 10 and r[10] in ["BOOKED", "CANCELLED"]:
            status = r[10]

        if not email and not name:
            continue

        # Split domains into list
        domain_list = [d.strip() for d in domain.split(",") if d.strip()]

        resp_info = applicant_map.get(email, {})

        candidate = {
            "timestamp": timestamp,
            "name": name or resp_info.get("name", "N/A"),
            "email": email or resp_info.get("email", "N/A"),
            "phone": phone or resp_info.get("phone", "N/A"),
            "branch": branch or resp_info.get("branch", "N/A"),
            "domain": domain,
            "domains": domain_list,
            "date": date,
            "time_slot": time_slot,
            "panel": panel,
            "status": status,
            "github": resp_info.get("github", ""),
            "linkedin": resp_info.get("linkedin", ""),
            "skills": resp_info.get("skills", ""),
            "whyPart": resp_info.get("why_join", ""),
            "whyWork": resp_info.get("why_domains", ""),
            "projects": resp_info.get("projects", ""),
            "expectations": resp_info.get("expectations", ""),
            "vagera": resp_info.get("extra", ""),
        }
        candidates.append(candidate)

    # Compute Statistics & Aggregations
    total_slots = len(candidates)
    booked_slots = len([c for c in candidates if c["status"] == "BOOKED"])
    cancelled_slots = len([c for c in candidates if c["status"] == "CANCELLED"])
    total_applicants = len(applicant_map)

    # Domain Counts (a candidate may have multiple domains)
    domain_counts = Counter()
    for c in candidates:
        if c["status"] == "BOOKED":
            for d in c["domains"]:
                domain_counts[d] += 1

    # Date Counts
    date_counts = Counter()
    for c in candidates:
        if c["status"] == "BOOKED" and c["date"]:
            date_counts[c["date"]] += 1

    # Time Slot Counts
    time_counts = Counter()
    for c in candidates:
        if c["status"] == "BOOKED" and c["time_slot"]:
            time_counts[c["time_slot"]] += 1

    # Panel Counts
    panel_counts = Counter()
    for c in candidates:
        if c["status"] == "BOOKED" and c["panel"]:
            panel_counts[c["panel"]] += 1

    # Branch Counts
    branch_counts = Counter()
    for c in candidates:
        if c["status"] == "BOOKED" and c["branch"]:
            branch_counts[c["branch"]] += 1

    # Matrix: Date -> TimeSlot -> Count
    date_time_matrix = defaultdict(lambda: defaultdict(int))
    for c in candidates:
        if c["status"] == "BOOKED" and c["date"] and c["time_slot"]:
            date_time_matrix[c["date"]][c["time_slot"]] += 1

    # Matrix: Date -> Domain -> Count
    date_domain_matrix = defaultdict(lambda: defaultdict(int))
    for c in candidates:
        if c["status"] == "BOOKED" and c["date"]:
            for d in c["domains"]:
                date_domain_matrix[c["date"]][d] += 1

    stats = {
        "total_slots": total_slots,
        "booked_slots": booked_slots,
        "cancelled_slots": cancelled_slots,
        "total_applicants": total_applicants,
        "domain_counts": dict(domain_counts),
        "date_counts": dict(date_counts),
        "time_counts": dict(time_counts),
        "panel_counts": dict(panel_counts),
        "branch_counts": dict(branch_counts),
        "unique_dates": sorted(list(set(c["date"] for c in candidates if c["date"]))),
        "unique_times": sorted(list(set(c["time_slot"] for c in candidates if c["time_slot"]))),
        "unique_domains": sorted(list(domain_counts.keys())),
        "unique_panels": sorted(list(set(c["panel"] for c in candidates if c["panel"]))),
        "date_time_matrix": {d: dict(ts) for d, ts in date_time_matrix.items()},
        "date_domain_matrix": {d: dict(doms) for d, doms in date_domain_matrix.items()},
    }

    full_payload = {
        "stats": stats,
        "candidates": candidates
    }

    # Save to JSON
    os.makedirs(os.path.dirname(JSON_OUTPUT), exist_ok=True)
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(full_payload, f, indent=2)
    print(f"Saved analytics data to {JSON_OUTPUT}")

    # Generate Standalone HTML Page
    generate_standalone_html(full_payload)

def generate_standalone_html(payload):
    json_data_str = json.dumps(payload)
    
    html_content = f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IEEE VIT Pune - Interview Slot Analytics & Candidate Segregation</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {{
      font-family: 'Inter', sans-serif;
      background: #090d16;
      color: #f1f5f9;
    }}
    .glass-card {{
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }}
    .accent-gradient {{
      background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%);
    }}
  </style>
</head>
<body class="min-h-screen p-4 sm:p-6 lg:p-8">
  <!-- Top Navigation Header -->
  <header class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-xl accent-gradient flex items-center justify-center font-bold text-white shadow-lg">
        IEEE
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          Interview Segregation & Analytics
        </h1>
        <p class="text-xs text-slate-400">Standalone Executive Report & Interactive Filter System • IEEE VIT Pune</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button onclick="exportToExcel()" class="px-3 py-1.5 bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 text-xs font-bold rounded-lg border border-emerald-700/50 transition flex items-center gap-1">
        📊 Excel (.xls) (Filtered)
      </button>
      <button onclick="exportToCSV()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1">
        📥 CSV (Filtered)
      </button>
      <button onclick="exportToJSON()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1">
        📄 JSON (Filtered)
      </button>
      <button onclick="exportToPDF()" class="px-3 py-1.5 accent-gradient hover:opacity-90 text-xs font-bold rounded-lg shadow transition flex items-center gap-1">
        🖨 PDF Report (Filtered)
      </button>
    </div>
  </header>

  <main class="max-w-7xl mx-auto space-y-8">
    <!-- Stat Cards Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Slot Bookings</p>
        <p class="text-3xl font-extrabold text-white mt-2" id="stat-total-slots">0</p>
        <p class="text-[11px] text-blue-400 mt-1" id="stat-applicants-info">From recruitment responses</p>
      </div>

      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Bookings</p>
        <p class="text-3xl font-extrabold text-emerald-400 mt-2" id="stat-booked-slots">0</p>
        <p class="text-[11px] text-emerald-500 mt-1" id="stat-booked-pct">0% confirmed</p>
      </div>

      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cancelled Bookings</p>
        <p class="text-3xl font-extrabold text-rose-400 mt-2" id="stat-cancelled-slots">0</p>
        <p class="text-[11px] text-rose-500 mt-1" id="stat-cancelled-pct">0% cancelled</p>
      </div>

      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Preference Domain</p>
        <p class="text-2xl font-extrabold text-cyan-400 mt-2 truncate" id="stat-top-domain">Technical</p>
        <p class="text-[11px] text-cyan-500 mt-1" id="stat-top-domain-count">0 candidate choices</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Domain Breakdown Chart -->
      <div class="glass-card p-5 rounded-2xl lg:col-span-2">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Domain Distribution (Booked Candidates)</span>
          <span class="text-xs text-slate-400 font-normal">Candidate Domain Selections</span>
        </h3>
        <div class="h-64 relative">
          <canvas id="domainChart"></canvas>
        </div>
      </div>

      <!-- Date Breakdown Chart -->
      <div class="glass-card p-5 rounded-2xl">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Interview Schedule Dates</h3>
        <div class="h-64 relative">
          <canvas id="dateChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Interactive Segregation Filters & Search -->
    <div class="glass-card p-6 rounded-2xl space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-lg font-bold text-white uppercase flex items-center gap-2">
            Candidate Segregation Engine
          </h2>
          <p class="text-xs text-slate-400">Filter and segregate candidates in real-time by Date, Time Slot, Domain, Panel, or Status</p>
        </div>
        <div class="text-xs text-slate-400 font-mono">
          Showing <span id="filtered-count" class="font-bold text-blue-400">0</span> candidates
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Search Input -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-400 uppercase">Search Candidate</label>
          <input type="text" id="filter-search" oninput="applyFilters()" placeholder="Name, Email, Phone..." class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500">
        </div>

        <!-- Filter Date -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-400 uppercase">Interview Date</label>
          <select id="filter-date" onchange="applyFilters()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
            <option value="">All Dates</option>
          </select>
        </div>

        <!-- Filter Time Slot -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-400 uppercase">Time Slot</label>
          <select id="filter-time" onchange="applyFilters()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
            <option value="">All Time Slots</option>
          </select>
        </div>

        <!-- Filter Domain -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-400 uppercase">Domain Preference</label>
          <select id="filter-domain" onchange="applyFilters()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
            <option value="">All Domains</option>
          </select>
        </div>

        <!-- Filter Status -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-400 uppercase">Booking Status</label>
          <select id="filter-status" onchange="applyFilters()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
            <option value="">All Statuses</option>
            <option value="BOOKED">BOOKED Only</option>
            <option value="CANCELLED">CANCELLED Only</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Candidate Data Table -->
    <div class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900/80">
              <th class="p-3.5 font-bold uppercase tracking-wider text-slate-400">Candidate Info</th>
              <th class="p-3.5 font-bold uppercase tracking-wider text-slate-400">Branch</th>
              <th class="p-3.5 font-bold uppercase tracking-wider text-slate-400">Domain Preferences</th>
              <th class="p-3.5 font-bold uppercase tracking-wider text-slate-400">Scheduled Date</th>
              <th class="p-3.5 font-bold uppercase tracking-wider text-slate-400">Time Slot</th>
              <th class="p-3.5 font-bold uppercase tracking-wider text-slate-400 text-center">Panel</th>
              <th class="p-3.5 font-bold uppercase tracking-wider text-slate-400 text-right">Status</th>
            </tr>
          </thead>
          <tbody id="candidate-table-body" class="divide-y divide-slate-800/60">
            <!-- Rows rendered via JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <footer class="max-w-7xl mx-auto mt-12 text-center text-xs text-slate-500 pb-8">
    © 2026 IEEE Student Branch VIT Pune • Interview Operations & Segregation Analytics System
  </footer>

  <script>
    const data = {json_data_str};
    let filteredCandidates = [...data.candidates];

    document.addEventListener("DOMContentLoaded", () => {{
      initStats();
      populateDropdowns();
      renderCharts();
      applyFilters();
    }});

    function initStats() {{
      const stats = data.stats;
      document.getElementById("stat-total-slots").innerText = stats.total_slots;
      document.getElementById("stat-booked-slots").innerText = stats.booked_slots;
      document.getElementById("stat-cancelled-slots").innerText = stats.cancelled_slots;

      const bookedPct = stats.total_slots ? ((stats.booked_slots / stats.total_slots) * 100).toFixed(1) : 0;
      const cancelledPct = stats.total_slots ? ((stats.cancelled_slots / stats.total_slots) * 100).toFixed(1) : 0;
      document.getElementById("stat-booked-pct").innerText = `${{bookedPct}}% confirmed`;
      document.getElementById("stat-cancelled-pct").innerText = `${{cancelledPct}}% cancelled`;

      // Top domain
      const sortedDomains = Object.entries(stats.domain_counts).sort((a, b) => b[1] - a[1]);
      if (sortedDomains.length > 0) {{
        document.getElementById("stat-top-domain").innerText = sortedDomains[0][0];
        document.getElementById("stat-top-domain-count").innerText = `${{sortedDomains[0][1]}} candidate choices`;
      }}
    }}

    function populateDropdowns() {{
      const stats = data.stats;
      
      const dateSelect = document.getElementById("filter-date");
      stats.unique_dates.forEach(d => {{
        const opt = document.createElement("option");
        opt.value = d;
        opt.innerText = d;
        dateSelect.appendChild(opt);
      }});

      const timeSelect = document.getElementById("filter-time");
      stats.unique_times.forEach(t => {{
        const opt = document.createElement("option");
        opt.value = t;
        opt.innerText = t;
        timeSelect.appendChild(opt);
      }});

      const domainSelect = document.getElementById("filter-domain");
      stats.unique_domains.forEach(dom => {{
        const opt = document.createElement("option");
        opt.value = dom;
        opt.innerText = dom;
        domainSelect.appendChild(opt);
      }});
    }}

    function renderCharts() {{
      const stats = data.stats;
      
      // Domain Chart
      const domainCtx = document.getElementById("domainChart").getContext("2d");
      const domainLabels = Object.keys(stats.domain_counts);
      const domainValues = Object.values(stats.domain_counts);

      new Chart(domainCtx, {{
        type: "bar",
        data: {{
          labels: domainLabels,
          datasets: [{{
            label: "Candidate Count",
            data: domainValues,
            backgroundColor: "rgba(0, 153, 255, 0.7)",
            borderColor: "rgba(0, 153, 255, 1)",
            borderWidth: 1.5,
            borderRadius: 6,
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ display: false }} }},
          scales: {{
            x: {{ ticks: {{ color: "#94a3b8", font: {{ size: 10 }} }}, grid: {{ display: false }} }},
            y: {{ ticks: {{ color: "#94a3b8", font: {{ size: 10 }} }}, grid: {{ color: "rgba(255, 255, 255, 0.05)" }} }}
          }}
        }}
      }});

      // Date Chart
      const dateCtx = document.getElementById("dateChart").getContext("2d");
      const dateLabels = Object.keys(stats.date_counts);
      const dateValues = Object.values(stats.date_counts);

      new Chart(dateCtx, {{
        type: "doughnut",
        data: {{
          labels: dateLabels,
          datasets: [{{
            data: dateValues,
            backgroundColor: [
              "#0066cc", "#0099ff", "#38bdf8", "#818cf8", "#c084fc", "#f472b6"
            ],
            borderWidth: 2,
            borderColor: "#0f172a"
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{
            legend: {{ position: "bottom", labels: {{ color: "#94a3b8", font: {{ size: 10 }} }} }}
          }}
        }}
      }});
    }}

    function applyFilters() {{
      const search = document.getElementById("filter-search").value.toLowerCase().trim();
      const dateVal = document.getElementById("filter-date").value;
      const timeVal = document.getElementById("filter-time").value;
      const domainVal = document.getElementById("filter-domain").value;
      const statusVal = document.getElementById("filter-status").value;

      filteredCandidates = data.candidates.filter(c => {{
        if (search) {{
          const text = `${{c.name}} ${{c.email}} ${{c.phone}} ${{c.branch}}`.toLowerCase();
          if (!text.includes(search)) return false;
        }}
        if (dateVal && c.date !== dateVal) return false;
        if (timeVal && c.time_slot !== timeVal) return false;
        if (domainVal && !c.domains.includes(domainVal)) return false;
        if (statusVal && c.status !== statusVal) return false;
        return true;
      }});

      document.getElementById("filtered-count").innerText = filteredCandidates.length;
      renderTable();
    }}

    function renderTable() {{
      const tbody = document.getElementById("candidate-table-body");
      tbody.innerHTML = "";

      if (filteredCandidates.length === 0) {{
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500 font-semibold">No candidates match the selected segregation filters.</td></tr>`;
        return;
      }}

      filteredCandidates.forEach(c => {{
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-800/40 transition";
        
        const isBooked = c.status === "BOOKED";
        const statusBadge = isBooked
          ? `<span class="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BOOKED</span>`
          : `<span class="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">CANCELLED</span>`;

        const domainTags = c.domains.map(d => `<span class="inline-block px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] mr-1 mb-1 font-semibold">${{d}}</span>`).join("");

        tr.innerHTML = `
          <td class="p-3.5">
            <div class="font-bold text-white">${{c.name}}</div>
            <div class="text-[11px] text-slate-400 font-mono">${{c.email}}</div>
            <div class="text-[10px] text-slate-500 font-mono">${{c.phone}}</div>
          </td>
          <td class="p-3.5 text-slate-300">${{c.branch || "N/A"}}</td>
          <td class="p-3.5">${{domainTags || '<span class="text-slate-500">N/A</span>'}}</td>
          <td class="p-3.5 font-mono text-slate-300">${{c.date || "N/A"}}</td>
          <td class="p-3.5 font-mono text-slate-300">${{c.time_slot || "N/A"}}</td>
          <td class="p-3.5 text-center font-bold text-blue-400">${{c.panel || "N/A"}}</td>
          <td class="p-3.5 text-right">${{statusBadge}}</td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    function getExportFileName(ext) {{
      const domainVal = document.getElementById("filter-domain") ? document.getElementById("filter-domain").value : "";
      const dateVal = document.getElementById("filter-date") ? document.getElementById("filter-date").value : "";
      const sanitize = (str) => (str || "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const domainPrefix = domainVal ? sanitize(domainVal) : "All_Domains";
      const datePart = dateVal ? `_${{sanitize(dateVal)}}` : "";
      return `${{domainPrefix}}${{datePart}}_Candidates_${{filteredCandidates.length}}_users.${{ext}}`;
    }}

    function exportToExcel() {{
      if (filteredCandidates.length === 0) {{
        alert("No candidates to export.");
        return;
      }}

      const escapeXml = (str) =>
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

      filteredCandidates.forEach((c, idx) => {{
        const statusStyle = c.status === "BOOKED" ? "Booked" : c.status === "CANCELLED" ? "Cancelled" : "Pending";

        excelXml += `
   <Row>
    <Cell><Data ss:Type="Number">${{idx + 1}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml(c.name)}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml(c.email)}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml(c.phone)}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml(c.branch)}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml((c.domains || []).join(", "))}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml(c.date)}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml(c.time_slot)}}</Data></Cell>
    <Cell><Data ss:Type="String">${{escapeXml(c.panel)}}</Data></Cell>
    <Cell ss:StyleID="${{statusStyle}}"><Data ss:Type="String">${{escapeXml(c.status)}}</Data></Cell>
   </Row>`;
      }});

      excelXml += `
  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([excelXml], {{ type: "application/vnd.ms-excel" }});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", getExportFileName("xls"));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }}

    function exportToCSV() {{
      if (filteredCandidates.length === 0) {{
        alert("No candidates to export.");
        return;
      }}
      let csv = "Name,Email,Phone,Branch,Domains,Date,Time Slot,Panel,Status\\n";
      filteredCandidates.forEach(c => {{
        const domStr = `"${{(c.domains || []).join(", ")}}"`;
        const nameStr = `"${{c.name.replace(/"/g, '""')}}"`;
        csv += `${{nameStr}},${{c.email}},${{c.phone}},"${{c.branch}}",${{domStr}},"${{c.date}}","${{c.time_slot}}","${{c.panel}}",${{c.status}}\\n`;
      }});

      const blob = new Blob([csv], {{ type: "text/csv;charset=utf-8;" }});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", getExportFileName("csv"));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }}

    function exportToJSON() {{
      if (filteredCandidates.length === 0) {{
        alert("No candidates to export.");
        return;
      }}
      const dataStr = JSON.stringify(filteredCandidates, null, 2);
      const blob = new Blob([dataStr], {{ type: "application/json" }});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", getExportFileName("json"));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }}

    function exportToPDF() {{
      if (filteredCandidates.length === 0) {{
        alert("No candidates to export.");
        return;
      }}
      const printWin = window.open("", "_blank");
      if (!printWin) return;

      const rowsHtml = filteredCandidates.map((c, idx) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${{idx + 1}}. ${{c.name}}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${{c.email}}<br><small style="color: #666;">${{c.phone}}</small></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${{c.branch || "N/A"}}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${{(c.domains || []).join(", ") || "N/A"}}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${{c.date || "N/A"}}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${{c.time_slot || "N/A"}}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${{c.panel || "N/A"}}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${{c.status === "BOOKED" ? "#059669" : "#dc2626"}};">${{c.status}}</td>
        </tr>
      `).join("");

      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>IEEE VIT Pune - Segregated Candidate Report</title>
          <style>
            body {{ font-family: Arial, sans-serif; padding: 20px; color: #111; }}
            h1 {{ color: #0066cc; margin-bottom: 4px; font-size: 20px; }}
            p {{ margin: 0 0 16px 0; color: #555; font-size: 12px; }}
            table {{ width: 100%; border-collapse: collapse; font-size: 11px; }}
            th {{ background: #0066cc; color: white; padding: 8px; text-align: left; font-size: 11px; border: 1px solid #0055b3; }}
          </style>
        </head>
        <body>
          <h1>IEEE Student Branch VIT Pune</h1>
          <p>Filtered Candidate Segregation Report • Exported Users: <strong>${{filteredCandidates.length}}</strong></p>
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
              ${{rowsHtml}}
            </tbody>
          </table>
          <script>
            window.onload = function() {{ window.print(); }};
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    }}
  </script>
</body>
</html>
"""
    os.makedirs(os.path.dirname(STANDALONE_HTML_OUTPUT), exist_ok=True)
    with open(STANDALONE_HTML_OUTPUT, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated standalone HTML dashboard at {STANDALONE_HTML_OUTPUT}")

if __name__ == "__main__":
    process_data()
