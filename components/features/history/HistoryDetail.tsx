"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Copy,
    Check,
    Trash2,
    Calendar,
    Code2,
    Terminal,
    Lightbulb,
    FileText,
    Wrench,
    ExternalLink,
    Clock,
    Hash,
    Cpu,
    Download,
    Share2,
    Printer,
} from "lucide-react";
import { AnalysisRecord } from "@/lib/types";
import { SEVERITY_CONFIG, LANGUAGE_LABELS, formatDate } from "@/lib/utils";
import { CodeDiffViewer } from "@/components/features/analyzer/CodeDiffViewer";
import { UnitTestGenerator } from "@/components/features/analyzer/UnitTestGenerator";
import { downloadMarkdownFile, generateGitHubIssueTemplate } from "@/lib/export-utils";

interface HistoryDetailProps {
    record: AnalysisRecord;
    onBack: () => void;
    onDelete: (id: string) => void;
}

export function HistoryDetail({ record, onBack, onDelete }: HistoryDetailProps) {
    const { request, result, createdAt, id } = record;
    const severity = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.medium;

    const [copiedReport, setCopiedReport] = useState(false);
    const [copiedError, setCopiedError] = useState(false);
    const [copiedFix, setCopiedFix] = useState(false);
    const [copiedGithub, setCopiedGithub] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
        navigator.clipboard.writeText(text).then(() => {
            setter(true);
            setTimeout(() => setter(false), 2000);
        }).catch(() => {});
    };

    const handleCopyGithubIssue = () => {
        const ghIssue = generateGitHubIssueTemplate(result, request);
        copyToClipboard(ghIssue, setCopiedGithub);
    };

    const handleDownloadMarkdown = () => {
        downloadMarkdownFile(result, request, createdAt);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyReport = () => {
        const fullReport = `=== BugSense Diagnostic Report ===
Record ID: ${id}
Analyzed: ${formatDate(createdAt)}
Language: ${LANGUAGE_LABELS[request.language] || request.language}
Severity: ${severity.label}

[Error Trace]
${request.errorMessage}

${request.codeSnippet ? `[Source Code Context]\n${request.codeSnippet}\n` : ""}
[Error Summary]
${result.errorSummary}

[Root Cause]
${result.possibleCause}

[Technical Explanation]
${result.explanation}

[Step-by-Step Resolution]
${result.suggestedSolution}

${result.codeExample ? `[Production Code Patch]\n${result.codeExample}` : ""}
`;
        copyToClipboard(fullReport, setCopiedReport);
    };

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

    const getSeverityTextClass = (sev: string) => {
        switch (sev) {
            case "critical":
                return "text-rose-400";
            case "high":
                return "text-orange-400";
            case "medium":
                return "text-amber-400";
            case "low":
            default:
                return "text-emerald-400";
        }
    };

    return (
        <div className="flex flex-col gap-5 sm:gap-6 w-full animate-in fade-in-50 duration-200">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        id="back-to-history-btn"
                        className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all duration-150 cursor-pointer shadow-sm hover:-translate-x-0.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Archive</span>
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                        <span>/</span>
                        <span className="text-slate-400 font-mono">Record #{id.slice(0, 8)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <Link
                        href={`/analyzer?sample=${encodeURIComponent(request.errorMessage)}&lang=${request.language}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all duration-150 shadow-sm"
                        title="Load this error and language back into Diagnostic Studio"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Re-Analyze in Studio</span>
                    </Link>

                    {/* Export Markdown */}
                    <button
                        type="button"
                        onClick={handleDownloadMarkdown}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all duration-150 cursor-pointer shadow-sm"
                        title="Download Markdown Report"
                    >
                        <Download className="h-3.5 w-3.5 text-sky-400" />
                        <span>Export .md</span>
                    </button>

                    {/* Copy GitHub Issue */}
                    <button
                        type="button"
                        onClick={handleCopyGithubIssue}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all duration-150 cursor-pointer shadow-sm"
                        title="Copy as GitHub Issue"
                    >
                        {copiedGithub ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied Issue!</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                                <span>GitHub Issue</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleCopyReport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all duration-150 cursor-pointer shadow-sm"
                    >
                        {copiedReport ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                <span>Copy Report</span>
                            </>
                        )}
                    </button>

                    {/* Print */}
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all duration-150 cursor-pointer shadow-sm"
                        title="Print or Save as PDF"
                    >
                        <Printer className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {!confirmDelete ? (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all duration-150 cursor-pointer"
                            title="Delete this record"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-rose-950/60 p-1 rounded-xl border border-rose-500/40">
                            <span className="text-[11px] text-rose-300 px-2 font-medium">Delete record?</span>
                            <button
                                type="button"
                                onClick={() => onDelete(id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="px-2 py-1 rounded-lg text-xs text-slate-300 hover:text-white cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Header Hero Banner */}
            <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950 border border-sky-500/20 p-4 sm:p-6 md:p-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
                    <div className="flex flex-col gap-2.5 sm:gap-3 max-w-3xl">
                        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider border ${getSeverityBadgeClass(result.severity)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {severity.label} Severity
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/25">
                                <Code2 className="h-3.5 w-3.5" />
                                {LANGUAGE_LABELS[request.language] || request.language}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs text-slate-400 bg-slate-900/60 border border-slate-800">
                                <Calendar className="h-3 w-3" />
                                {formatDate(createdAt)}
                            </span>
                        </div>

                        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white font-mono break-all leading-snug">
                            {request.errorMessage}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                            {result.errorSummary}
                        </p>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
                            <Hash className="h-3.5 w-3.5 text-sky-400" />
                            <span>{id.slice(0, 12)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Diagnostic Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* Left Column: Input Data (Error Trace & Source Context) */}
                <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
                    {/* Error Stack Trace Box */}
                    <div className="rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-900/80 border-b border-slate-800 gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                                <Terminal className="h-4 w-4 text-rose-400 shrink-0" />
                                <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">
                                    Raw Error Trace
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(request.errorMessage, setCopiedError)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                            >
                                {copiedError ? (
                                    <>
                                        <Check className="h-3 w-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        <span>Copy Trace</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="p-3.5 sm:p-4 bg-black/60">
                            <pre className="font-mono text-[11px] sm:text-xs text-rose-300/90 whitespace-pre-wrap break-all leading-relaxed max-h-[360px] overflow-y-auto">
                                {request.errorMessage}
                            </pre>
                        </div>
                    </div>

                    {/* Source Code Context (if provided) */}
                    {request.codeSnippet && request.codeSnippet.trim() ? (
                        <div className="rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-900/80 border-b border-slate-800 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shrink-0" />
                                    <Code2 className="h-4 w-4 text-sky-400 shrink-0" />
                                    <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">
                                        Source Context
                                    </span>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 shrink-0">
                                    {LANGUAGE_LABELS[request.language] || request.language}
                                </span>
                            </div>
                            <div className="p-3.5 sm:p-4 bg-black/60">
                                <pre className="font-mono text-[11px] sm:text-xs text-slate-200 whitespace-pre-wrap break-all leading-relaxed max-h-[300px] overflow-y-auto">
                                    {request.codeSnippet}
                                </pre>
                            </div>
                        </div>
                    ) : null}

                    {/* Diagnostic Metadata Card */}
                    <div className="rounded-xl sm:rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 sm:p-5 shadow-lg flex flex-col gap-3">
                        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
                            <Clock className="h-3.5 w-3.5 text-sky-400" />
                            <span>Diagnostic Telemetry</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                            <div className="flex flex-col gap-0.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-500 text-[10px] sm:text-[11px]">Timestamp</span>
                                <span className="text-slate-200 font-semibold text-[11px] sm:text-xs truncate">{formatDate(createdAt)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-500 text-[10px] sm:text-[11px]">Reasoning Engine</span>
                                <span className="text-sky-400 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
                                    <Cpu className="h-3 w-3 shrink-0" /> Neural v2.5
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-500 text-[10px] sm:text-[11px]">Target Language</span>
                                <span className="text-slate-200 font-semibold text-[11px] sm:text-xs truncate">{LANGUAGE_LABELS[request.language]}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-500 text-[10px] sm:text-[11px]">Assessed Severity</span>
                                <span className={`font-semibold capitalize text-[11px] sm:text-xs ${getSeverityTextClass(result.severity)}`}>
                                    {severity.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Analysis Verdict, Cause, Solution & Code Fix */}
                <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
                    {/* Root Cause Card */}
                    <div className="rounded-xl sm:rounded-2xl bg-slate-950/80 border border-sky-500/25 p-4 sm:p-6 shadow-xl flex flex-col gap-2.5 sm:gap-3 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sky-400">
                            <Lightbulb className="h-4 w-4" />
                            <span>Root Cause Isolation</span>
                        </div>
                        <p className="text-sm md:text-base text-slate-100 font-medium leading-relaxed">
                            {result.possibleCause}
                        </p>
                    </div>

                    {/* Technical Explanation Card */}
                    <div className="rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 sm:p-6 shadow-xl flex flex-col gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-400">
                            <FileText className="h-4 w-4" />
                            <span>Technical Breakdown</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {result.explanation}
                        </p>
                    </div>

                    {/* Step-by-Step Resolution */}
                    <div className="rounded-xl sm:rounded-2xl bg-slate-950/80 border border-emerald-500/25 p-4 sm:p-6 shadow-xl flex flex-col gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
                            <Wrench className="h-4 w-4" />
                            <span>Step-by-Step Action Plan</span>
                        </div>
                        <div className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-emerald-500/20">
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                {result.suggestedSolution}
                            </p>
                        </div>
                    </div>

                    {/* Production Code Fix */}
                    {result.codeExample && result.codeExample.trim() ? (
                        <div className="rounded-xl sm:rounded-2xl bg-slate-950/90 border border-sky-500/30 shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3.5 bg-slate-900/90 border-b border-slate-800 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-mono font-bold text-sky-300 ml-1 sm:ml-2 truncate">
                                        {LANGUAGE_LABELS[request.language]} Patch
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(result.codeExample!, setCopiedFix)}
                                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer shrink-0"
                                >
                                    {copiedFix ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy Code Patch</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="p-3.5 sm:p-5 bg-black/80 overflow-x-auto">
                                <pre className="font-mono text-[11px] sm:text-xs text-slate-100 leading-relaxed">
                                    <code>{result.codeExample}</code>
                                </pre>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
