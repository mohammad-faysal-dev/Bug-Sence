"use client";

import { useMemo } from "react";
import {
  BarChart2,
  Activity,
  AlertTriangle,
  Code2,
  Layers,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NAV_ITEMS } from "@/lib/nav-items";
import { getHistory } from "@/lib/storage";
import { AnalysisRecord } from "@/lib/types";
import { useEffect, useState } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

function dayKey(iso: string) {
  return iso.slice(0, 10); // "YYYY-MM-DD"
}

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function shortDay(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  borderClass,
  bgClass,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  sub?: string;
}) {
  return (
    <div
      className={`flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border ${borderClass} shadow-xl`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${bgClass} ${borderClass} ${colorClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className={`text-3xl font-extrabold tracking-tight ${colorClass}`}>
          {value}
        </span>
        <span className="text-sm font-semibold text-slate-100 truncate">{label}</span>
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
        <Icon className="w-5 h-5 text-sky-400" />
        {title}
      </h3>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRecords(getHistory());
    setMounted(true);

    const handler = () => setRecords(getHistory());
    window.addEventListener("bugsense_history_updated", handler);
    return () => window.removeEventListener("bugsense_history_updated", handler);
  }, []);

  const stats = useMemo(() => {
    const total = records.length;

    // Severity counts
    const severity = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const r of records) {
      const s = r.result.severity as keyof typeof severity;
      if (s in severity) severity[s]++;
    }

    // Top languages
    const langMap: Record<string, number> = {};
    for (const r of records) {
      const lang = r.request.language ?? "other";
      langMap[lang] = (langMap[lang] ?? 0) + 1;
    }
    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Most common error types (first 4–6 words of errorSummary)
    const errorMap: Record<string, number> = {};
    for (const r of records) {
      const summary = r.result.errorSummary ?? "";
      const key = summary.split(/\s+/).slice(0, 5).join(" ").toLowerCase();
      if (key) errorMap[key] = (errorMap[key] ?? 0) + 1;
    }
    const topErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Weekly heatmap
    const days = last7Days();
    const dayMap: Record<string, number> = {};
    for (const r of records) {
      const k = dayKey(r.createdAt);
      dayMap[k] = (dayMap[k] ?? 0) + 1;
    }
    const weeklyData = days.map((d) => ({ day: d, count: dayMap[d] ?? 0 }));

    // Average per day (over days that have at least one analysis)
    const activeDays = Object.keys(dayMap).length;
    const avgPerDay = activeDays > 0 ? (total / activeDays).toFixed(1) : "0";

    return { total, severity, topLanguages, topErrors, weeklyData, avgPerDay };
  }, [records]);

  if (!mounted) {
    return (
      <AppShell title="Analytics" subtitle="Visual insights from your analysis history" navItems={NAV_ITEMS}>
        <div className="flex items-center justify-center h-64">
          <span className="text-slate-400 text-sm animate-pulse">Loading analytics…</span>
        </div>
      </AppShell>
    );
  }

  const { total, severity, topLanguages, topErrors, weeklyData, avgPerDay } = stats;
  const maxSev = Math.max(...Object.values(severity), 1);
  const maxLang = topLanguages[0]?.[1] ?? 1;
  const maxError = topErrors[0]?.[1] ?? 1;
  const maxWeek = Math.max(...weeklyData.map((d) => d.count), 1);

  const severityConfig = [
    { key: "critical" as const, label: "Critical", color: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/30" },
    { key: "high" as const, label: "High", color: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
    { key: "medium" as const, label: "Medium", color: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30" },
    { key: "low" as const, label: "Low", color: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30" },
  ];

  return (
    <AppShell
      title="Analytics"
      subtitle="Visual insights from your analysis history"
      navItems={NAV_ITEMS}
    >
      <div className="flex flex-col gap-10 w-full pb-14">

        {/* ── TOP STAT CARDS ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Analyses"
            value={total}
            icon={BarChart2}
            colorClass="text-sky-400"
            borderClass="border-sky-500/30"
            bgClass="bg-sky-500/10"
            sub="All time records"
          />
          <StatCard
            label="Avg per Active Day"
            value={avgPerDay}
            icon={TrendingUp}
            colorClass="text-blue-400"
            borderClass="border-blue-500/30"
            bgClass="bg-blue-500/10"
            sub="Across active days"
          />
          <StatCard
            label="Critical Issues"
            value={severity.critical}
            icon={AlertTriangle}
            colorClass="text-rose-400"
            borderClass="border-rose-500/30"
            bgClass="bg-rose-500/10"
            sub="Highest severity"
          />
          <StatCard
            label="Languages Used"
            value={topLanguages.length}
            icon={Code2}
            colorClass="text-emerald-400"
            borderClass="border-emerald-500/30"
            bgClass="bg-emerald-500/10"
            sub="Distinct languages"
          />
        </section>

        {/* ── SEVERITY BREAKDOWN ── */}
        <section className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 p-6 shadow-xl flex flex-col gap-6">
          <SectionHeader icon={Layers} title="Severity Breakdown" sub="Distribution of bug severity across all analyses" />

          {total === 0 ? (
            <p className="text-slate-500 text-sm">No data yet. Run some analyses first.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {severityConfig.map(({ key, label, color, text, border }) => {
                const count = severity[key];
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const barW = Math.round((count / maxSev) * 100);
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${text}`}>{label}</span>
                      <span className="text-xs text-slate-400 font-mono">{count} · {pct}%</span>
                    </div>
                    <div className={`h-2.5 rounded-full bg-slate-800 border ${border} overflow-hidden`}>
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${barW}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── TOP LANGUAGES + COMMON ERRORS ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Top Languages bar chart */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 p-6 shadow-xl flex flex-col gap-6">
            <SectionHeader icon={Code2} title="Top Languages" sub="Most analyzed programming languages (top 5)" />
            {topLanguages.length === 0 ? (
              <p className="text-slate-500 text-sm">No language data yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topLanguages.map(([lang, count]) => {
                  const barW = Math.round((count / maxLang) * 100);
                  return (
                    <div key={lang} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-slate-200 capitalize">{lang}</span>
                        <span className="text-xs text-slate-400 font-mono">{count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-800 border border-sky-500/20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Most common error types */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 p-6 shadow-xl flex flex-col gap-6">
            <SectionHeader icon={AlertTriangle} title="Common Error Types" sub="Top 5 by frequency from error summaries" />
            {topErrors.length === 0 ? (
              <p className="text-slate-500 text-sm">No error type data yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topErrors.map(([error, count], idx) => {
                  const barW = Math.round((count / maxError) * 100);
                  return (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-slate-300 truncate max-w-56" title={error}>
                          {error}
                        </span>
                        <span className="text-xs text-slate-400 font-mono shrink-0">{count}×</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-800 border border-amber-500/20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── WEEKLY ACTIVITY HEATMAP ── */}
        <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 p-6 shadow-xl flex flex-col gap-6">
          <SectionHeader icon={Activity} title="Weekly Activity" sub="Number of analyses per day over the last 7 days" />
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map(({ day, count }) => {
              const intensity = count === 0 ? 0 : Math.min(Math.ceil((count / maxWeek) * 4), 4);
              const bg = [
                "bg-slate-800",
                "bg-emerald-900/60",
                "bg-emerald-700/60",
                "bg-emerald-600/80",
                "bg-emerald-500",
              ][intensity];
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-full aspect-square rounded-lg ${bg} border border-slate-700/50 flex items-center justify-center transition-all duration-300`}
                    title={`${day}: ${count} analyses`}
                  >
                    {count > 0 && (
                      <span className="text-xs font-bold text-white">{count}</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{shortDay(day)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-slate-500">Less</span>
            {["bg-slate-800", "bg-emerald-900/60", "bg-emerald-700/60", "bg-emerald-600/80", "bg-emerald-500"].map(
              (bg, i) => (
                <div key={i} className={`w-4 h-4 rounded ${bg} border border-slate-700/40`} />
              )
            )}
            <span className="text-xs text-slate-500">More</span>
          </div>
        </section>

        {/* ── EMPTY STATE CTA ── */}
        {total === 0 && (
          <section className="rounded-2xl border border-sky-500/25 bg-gradient-to-r from-blue-950/60 via-slate-950 to-blue-950/60 p-10 flex flex-col items-center gap-4 text-center shadow-xl">
            <Zap className="w-10 h-10 text-sky-400" />
            <p className="text-lg font-bold text-white">No analyses yet</p>
            <p className="text-sm text-slate-400 max-w-md">
              Head to the Bug Analyzer, run your first analysis, and your stats will appear here automatically.
            </p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
