"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    Trash2,
    Clock,
    X,
    Sparkles,
    Calendar,
    Code2,
    CheckCircle2,
    ArrowUpRight,
    Download,
    Terminal,
    Bug,
    Zap,
    BookmarkCheck,
} from "lucide-react";
import { AnalysisRecord } from "@/lib/types";
import { SEVERITY_CONFIG, LANGUAGE_LABELS, formatDate, truncate } from "@/lib/utils";

interface HistoryListProps {
    history: AnalysisRecord[];
    onDelete: (id: string) => void;
    onClearAll: () => void;
    onSelect: (record: AnalysisRecord) => void;
    isLoaded: boolean;
}

type SortOption = "newest" | "oldest" | "severity";

export function HistoryList({
    history,
    onDelete,
    onClearAll,
    onSelect,
    isLoaded,
}: HistoryListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [confirmClearAll, setConfirmClearAll] = useState(false);

    // Dynamic metrics
    const stats = useMemo(() => {
        const total = history.length;
        const critical = history.filter((h) => h.result.severity === "critical").length;
        const high = history.filter((h) => h.result.severity === "high").length;
        const medium = history.filter((h) => h.result.severity === "medium").length;
        const low = history.filter((h) => h.result.severity === "low").length;
        const languages = Array.from(new Set(history.map((h) => h.request.language)));

        return { total, critical, high, medium, low, languages };
    }, [history]);

    // Filtered & sorted history
    const filteredHistory = useMemo(() => {
        const filtered = history.filter((item) => {
            const matchesSearch =
                searchQuery.trim() === "" ||
                item.request.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.result.errorSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.result.possibleCause.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.request.codeSnippet && item.request.codeSnippet.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.request.language.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSeverity =
                selectedSeverity === "all" || item.result.severity === selectedSeverity;

            const matchesLanguage =
                selectedLanguage === "all" || item.request.language === selectedLanguage;

            return matchesSearch && matchesSeverity && matchesLanguage;
        });

        const severityWeight: Record<string, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
        };

        return filtered.sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortBy === "oldest") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            if (sortBy === "severity") {
                return (severityWeight[b.result.severity] || 0) - (severityWeight[a.result.severity] || 0);
            }
            return 0;
        });
    }, [history, searchQuery, selectedSeverity, selectedLanguage, sortBy]);

    // Export history to JSON
    const handleExportJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `bugsense-history-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    if (!isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-400">
                <div className="w-10 h-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                <p className="text-sm font-medium tracking-wide">Loading diagnostic archive...</p>
            </div>
        );
    }

    // ── EMPTY STATE: Pure Tailwind CSS ──
    if (history.length === 0) {
        return (
            <div className="relative w-full rounded-3xl border border-sky-500/25 bg-gradient-to-b from-slate-950 via-[#07132e] to-slate-950 p-12 sm:p-16 md:p-24 text-center shadow-2xl overflow-hidden flex flex-col items-center gap-8">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

                {/* Glowing Radar Icon Badge */}
                <div className="relative z-10 flex items-center justify-center">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center border border-sky-500/30 bg-gradient-to-br from-slate-900 to-blue-950 text-sky-400 shadow-2xl shadow-sky-500/20">
                        <Clock className="w-12 h-12 text-sky-400" />
                        <span className="absolute -top-1 -right-1 flex w-4 h-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                            <span className="relative inline-flex rounded-full w-4 h-4 bg-sky-500" />
                        </span>
                    </div>
                </div>

                {/* Title & Description */}
                <div className="relative z-10 flex flex-col gap-3.5 max-w-lg">
                    <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/25 mx-auto">
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Persistent Diagnostic Archive
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        No Diagnostic Records Saved Yet
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                        Your analyzed bug solutions will be preserved here with complete root-cause breakdowns, technical explanations, and copy-paste verified code patches.
                    </p>
                </div>

                {/* Call-to-action Button */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Link
                        href="/analyzer"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4" />
                        Start Your First Analysis
                    </Link>
                </div>

                {/* Bottom Quick Feature Highlights */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-8 border-t border-slate-800/80 w-full max-w-2xl text-xs text-slate-400">
                    <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                        <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Instant Error Decoding</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                        <Bug className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Deep Root Cause Isolation</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Verified Code Patches</span>
                    </div>
                </div>
            </div>
        );
    }

    const getSeverityBadgeClass = (sev: string) => {
        switch (sev) {
            case "critical":
                return "bg-rose-500/15 text-rose-400 border-rose-500/30";
            case "high":
                return "bg-orange-500/15 text-orange-400 border-orange-500/30";
            case "medium":
                return "bg-amber-500/15 text-amber-400 border-amber-500/30";
            case "low":
            default:
                return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in-50 duration-200">
            {/* 1. Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border border-sky-500/20 shadow-md">
                    <span className="text-xs font-semibold text-slate-400">Saved Records</span>
                    <span className="text-2xl font-extrabold text-white">{stats.total}</span>
                    <span className="text-[11px] text-sky-400/80 font-mono">Archived Solutions</span>
                </div>
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border border-rose-500/30 shadow-md">
                    <span className="text-xs font-semibold text-rose-400">Critical Bugs</span>
                    <span className="text-2xl font-extrabold text-rose-400">{stats.critical}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Immediate Attention</span>
                </div>
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border border-orange-500/30 shadow-md">
                    <span className="text-xs font-semibold text-orange-400">High Severity</span>
                    <span className="text-2xl font-extrabold text-orange-400">{stats.high}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Blockers</span>
                </div>
                <div className="flex flex-col gap-1 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border border-amber-500/30 shadow-md">
                    <span className="text-xs font-semibold text-amber-400">Medium/Low</span>
                    <span className="text-2xl font-extrabold text-amber-400">{stats.medium + stats.low}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Warning/Notice</span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border border-emerald-500/30 shadow-md">
                    <span className="text-xs font-semibold text-emerald-400">Languages</span>
                    <span className="text-2xl font-extrabold text-emerald-400">{stats.languages.length}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Tech Stacks Covered</span>
                </div>
            </div>

            {/* 2. Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-sky-500/20 shadow-lg">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search diagnostics by error, summary, code snippet, or language..."
                        className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-800 bg-black/50 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Severity Filter */}
                    <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-800 bg-black/50 text-xs font-medium text-slate-300 focus:outline-none focus:border-sky-500/60 cursor-pointer"
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    {/* Language Filter */}
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-800 bg-black/50 text-xs font-medium text-slate-300 focus:outline-none focus:border-sky-500/60 cursor-pointer"
                    >
                        <option value="all">All Languages</option>
                        {stats.languages.map((lang) => (
                            <option key={lang} value={lang}>
                                {LANGUAGE_LABELS[lang] || lang}
                            </option>
                        ))}
                    </select>

                    {/* Sort By Filter */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 rounded-xl border border-slate-800 bg-black/50 text-xs font-medium text-slate-300 focus:outline-none focus:border-sky-500/60 cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="severity">Highest Severity</option>
                    </select>

                    {/* Export Button */}
                    <button
                        type="button"
                        onClick={handleExportJson}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        title="Export diagnostic archive to JSON"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>

                    {/* Clear All */}
                    {!confirmClearAll ? (
                        <button
                            type="button"
                            onClick={() => setConfirmClearAll(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear Archive
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 rounded-xl px-2.5 py-1.5">
                            <span className="text-[11px] text-rose-300 font-semibold">Delete all?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    onClearAll();
                                    setConfirmClearAll(false);
                                }}
                                className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                            >
                                Confirm
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmClearAll(false)}
                                className="px-2 py-0.5 rounded text-[11px] text-slate-300 hover:bg-slate-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Records List */}
            {filteredHistory.length === 0 ? (
                <div className="p-16 rounded-2xl bg-slate-950/60 border border-slate-800 text-center flex flex-col items-center gap-3">
                    <p className="text-sm font-semibold text-slate-300">No matching records found</p>
                    <p className="text-xs text-slate-500">Try clearing search filters or search keywords.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredHistory.map((record) => {
                        const severity = SEVERITY_CONFIG[record.result.severity] || SEVERITY_CONFIG.medium;
                        const hasCodePatch = Boolean(record.result.codeExample);

                        return (
                            <div
                                key={record.id}
                                onClick={() => onSelect(record)}
                                className="group relative rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 p-5 sm:p-6 hover:border-sky-500/40 hover:shadow-xl transition-all duration-150 cursor-pointer flex flex-col gap-4"
                            >
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityBadgeClass(record.result.severity)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {severity.label}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-sky-300 bg-sky-500/10 border border-sky-500/20">
                                            <Code2 className="w-3 h-3" />
                                            {LANGUAGE_LABELS[record.request.language] || record.request.language}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            {formatDate(record.createdAt)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-sky-400 group-hover:text-sky-300 transition-colors">
                                            Inspect Solution
                                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(record.id);
                                            }}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                            title="Delete this record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Raw Error Trace excerpt */}
                                <div className="p-3 rounded-xl bg-black/60 border border-slate-800/80 flex items-start gap-2.5 font-mono text-xs text-rose-300/95 leading-relaxed group-hover:border-slate-700 transition-colors">
                                    <Terminal className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                    <span className="truncate break-all">
                                        {truncate(record.request.errorMessage, 160)}
                                    </span>
                                </div>

                                {/* Summary */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <p className="text-slate-300 font-medium leading-relaxed max-w-3xl truncate">
                                        <span className="text-sky-400 font-semibold mr-1.5">Diagnosis:</span>
                                        {truncate(record.result.errorSummary, 140)}
                                    </p>
                                    {hasCodePatch ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verified Code Patch
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 shrink-0">
                                            Action Plan Ready
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
