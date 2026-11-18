"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Zap, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { getHistory } from "@/lib/storage";
import { AnalysisRecord } from "@/lib/types";

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
}

type Severity = "low" | "medium" | "high" | "critical";

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  critical: {
    label: "Critical",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: AlertTriangle,
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: AlertTriangle,
  },
  low: {
    label: "Low",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: CheckCircle,
  },
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.medium;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function LanguageBadge({ language }: { language: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/25 uppercase tracking-wide">
      {language}
    </span>
  );
}

export function RecentActivity() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = () => {
      const history = getHistory();
      setRecords(history.slice(0, 5));
    };
    load();
    // Listen for updates from other parts of the app
    window.addEventListener("bugsense_history_updated", load);
    return () => window.removeEventListener("bugsense_history_updated", load);
  }, []);

  if (!mounted) return null;

  return (
    <section className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            Recent Activity
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Your last 5 error analyses
          </p>
        </div>
        {records.length > 0 && (
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Feed */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border border-dashed border-slate-700/60 bg-slate-950/50 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/25 flex items-center justify-center">
            <Zap className="w-6 h-6 text-sky-400" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-slate-200">
              No recent analyses yet
            </span>
            <span className="text-xs text-slate-500">
              Paste your first error and let BugSense diagnose it.
            </span>
          </div>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-500/20"
          >
            <Zap className="w-3.5 h-3.5" />
            Start Analyzing!
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((record) => {
            const severity = record.result.severity as Severity;
            const errorPreview = record.request.errorMessage.length > 90
              ? record.request.errorMessage.slice(0, 90) + "…"
              : record.request.errorMessage;
            const summaryPreview = record.result.errorSummary?.length > 80
              ? record.result.errorSummary.slice(0, 80) + "…"
              : record.result.errorSummary;

            return (
              <Link
                key={record.id}
                href={`/history`}
                className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-sky-500/30 hover:bg-slate-900/60 transition-all duration-200 shadow-sm"
              >
                {/* Left: severity badge */}
                <div className="shrink-0">
                  <SeverityBadge severity={severity} />
                </div>

                {/* Middle: error info */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-mono text-slate-200 leading-snug truncate">
                    {errorPreview}
                  </span>
                  {summaryPreview && (
                    <span className="text-[11px] sm:text-xs text-slate-400 leading-snug truncate">
                      {summaryPreview}
                    </span>
                  )}
                </div>

                {/* Right: language + time */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 shrink-0">
                  <LanguageBadge language={record.request.language} />
                  <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3 inline" />
                    {getRelativeTime(record.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* View all link at bottom */}
          <Link
            href="/history"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700/60 text-xs font-semibold text-slate-400 hover:text-sky-400 hover:border-sky-500/40 transition-all duration-200"
          >
            View All History
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
