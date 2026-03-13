// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF4C4C", "#FFC300", "#36CFC9", "#1890FF", "#7C3AED", "#F97316"];

function isoDateDaysAgo(days) {
  if (days === "all") return null;
  const d = new Date();
  d.setDate(d.getDate() - Number(days));
  return d;
}

function csvEscape(str = "") {
  if (typeof str !== "string") str = String(str || "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function Dashboard() {
  // Data
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [dateFilter, setDateFilter] = useState("30"); 
  const [selectedSymptom, setSelectedSymptom] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [focusedSeries, setFocusedSeries] = useState(null);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await API.get("/user/me");
      setProfile(p.data);

      const h = await API.get("/user/history");
      setHistory(h.data || []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError("Failed to load dashboard. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    if (document.documentElement.classList.contains("dark")) setDark(true);
  }, [loadData]);

  // Filtered history
  const filteredHistory = useMemo(() => {
    if (!history?.length) return [];

    const since = isoDateDaysAgo(dateFilter);
    return history.filter((h) => {
      if (since) {
        const created = new Date(h.createdAt);
        if (created < since) return false;
      }
      if (selectedSymptom !== "all") {
        const found = (h.normalized || []).some((s) => s === selectedSymptom);
        if (!found) return false;
      }
      if (selectedSeverity !== "all") {
        const lvl = (h.triageLabel || "").toLowerCase();
        let level = "Low";
        if (lvl.includes("emergency") || lvl.includes("high")) level = "High";
        else if (lvl.includes("clinic") || lvl.includes("medium")) level = "Medium";

        if (selectedSeverity !== level) return false;
      }
      return true;
    });
  }, [history, dateFilter, selectedSymptom, selectedSeverity]);

  // Symptom + triage counts
  const { symptomCounts, triageCounts } = useMemo(() => {
    const sCounts = {};
    const tCounts = { High: 0, Medium: 0, Low: 0 };

    filteredHistory.forEach((h) => {
      (h.normalized || []).forEach((sym) => {
        sCounts[sym] = (sCounts[sym] || 0) + 1;
      });

      const label = (h.triageLabel || "").toLowerCase();
      if (label.includes("high") || label.includes("emergency")) tCounts.High++;
      else if (label.includes("medium") || label.includes("clinic")) tCounts.Medium++;
      else tCounts.Low++;
    });

    return { symptomCounts: sCounts, triageCounts: tCounts };
  }, [filteredHistory]);

  // Trend data
  const trendData = useMemo(() => {
    const map = {};
    filteredHistory.forEach((h) => {
      const dateKey = new Date(h.createdAt).toLocaleDateString();
      if (!map[dateKey]) map[dateKey] = { date: dateKey };
      (h.normalized || []).forEach((sym) => {
        map[dateKey][sym] = (map[dateKey][sym] || 0) + 1;
      });
    });

    return Object.keys(map)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((k) => map[k]);
  }, [filteredHistory]);

  const triageData = [
    { name: "High", value: triageCounts.High },
    { name: "Medium", value: triageCounts.Medium },
    { name: "Low", value: triageCounts.Low },
  ];

  const symptomList = Object.keys(symptomCounts).sort(
    (a, b) => symptomCounts[b] - symptomCounts[a]
  );

  const insights = useMemo(() => {
    const out = [];

    Object.entries(symptomCounts)
      .filter(([, count]) => count >= 2)
      .forEach(([sym, count]) =>
        out.push(`You've reported "${sym}" ${count} times. Consider monitoring it.`)
      );

    if (triageCounts.High >= 3) {
      out.push("Multiple high-severity checks detected — consider seeing a clinician.");
    }

    if (!out.length) out.push("No significant insights yet. Keep tracking your health!");

    return out;
  }, [symptomCounts, triageCounts]);

  // Toggle dark mode
  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const exportCSV = () => {
    if (!filteredHistory.length) return;
    setIsExporting(true);

    try {
      const rows = filteredHistory.map((h) => ({
        date: new Date(h.createdAt).toLocaleString(),
        symptoms: (h.normalized || []).join("; "),
        severity: h.triageLabel || "",
        advice: h.advice || "",
      }));

      const header = Object.keys(rows[0]).join(",");
      const body = rows
        .map((r) => Object.values(r).map(csvEscape).join(","))
        .join("\n");

      const csv = `${header}\n${body}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `health-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // -----------------------------
  // 🔥 PAGE UI STARTS HERE
  // -----------------------------

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="max-w-6xl mx-auto p-4">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Dashboard</h2>
            {profile && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {profile.name} • {profile.email}
              </p>
            )}
          </div>

          <div className="flex gap-2 items-center">
           

            <button
              onClick={loadData}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800"
            >
              Refresh
            </button>

            <button
              onClick={exportCSV}
              className="px-3 py-1 rounded bg-teal-600 text-white disabled:opacity-50"
              disabled={!filteredHistory.length}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* ----- FILTER BAR ----- */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded mb-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">

            <div className="flex items-center gap-2">
              <label className="text-sm">Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Symptom</label>
              <select
                value={selectedSymptom}
                onChange={(e) => setSelectedSymptom(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All</option>
                {symptomList.map((s) => (
                  <option key={s} value={s}>
                    {s} ({symptomCounts[s]})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* ----- CHART LAYOUT ----- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* TRENDS */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <h3 className="font-semibold mb-2">🧠 Symptom Trends</h3>

            {trendData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(trendData[0])
                    .filter((k) => k !== "date")
                    .map((sym, idx) => (
                      <Line
                        key={sym}
                        type="monotone"
                        dataKey={sym}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No data yet.</p>
            )}
          </div>

          {/* PIE CHART */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <h3 className="font-semibold mb-2">⚠️ Triage Breakdown</h3>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={triageData} dataKey="value" nameKey="name" outerRadius={70} label>
                  {triageData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 text-sm space-y-1">
              <div>Total checks: {filteredHistory.length}</div>
              <div>High: {triageCounts.High}</div>
              <div>Medium: {triageCounts.Medium}</div>
              <div>Low: {triageCounts.Low}</div>
            </div>
          </div>

        </div>

        {/* ----- INSIGHTS ----- */}
        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
          <h3 className="font-semibold mb-2">📊 Health Insights</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {insights.map((ins, i) => (
              <li key={i}>{ins}</li>
            ))}
          </ul>
        </div>

        {/* ----- HISTORY ----- */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Symptom History</h3>

          {filteredHistory.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm text-sm">
              No history yet — try the Symptom Checker.
            </div>
          ) : (
            filteredHistory.map((h) => (
              <div key={h._id} className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm mb-3">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {new Date(h.createdAt).toLocaleString()}
                </div>

                <div className="mt-1 text-sm">
                  <span className="px-2 py-1 bg-blue-200 dark:bg-blue-900 rounded text-xs">
                    {h.triageLabel}
                  </span>
                  <span className="ml-2">{h.advice}</span>
                </div>

                <div className="mt-3 flex gap-2 flex-wrap">
                  {(h.normalized || []).map((sym) => (
                    <span
                      key={sym}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
