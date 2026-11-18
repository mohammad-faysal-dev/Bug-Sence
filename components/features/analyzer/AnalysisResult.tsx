"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Check,
  Bookmark,
  FileText,
  Sparkles,
  History,
  Download,
  Share2,
  Printer,
} from "lucide-react";
import { BugAnalysis, AnalysisRequest } from "@/lib/types";
import { SEVERITY_CONFIG, LANGUAGE_LABELS, formatDate } from "@/lib/utils";
import { CodeDiffViewer } from "@/components/features/analyzer/CodeDiffViewer";
import { UnitTestGenerator } from "@/components/features/analyzer/UnitTestGenerator";
import { downloadMarkdownFile, generateGitHubIssueTemplate } from "@/lib/export-utils";

interface AnalysisResultProps {
  result: BugAnalysis;
  request: AnalysisRequest;
  createdAt: string;
  onSave?: () => void;
  isSaved?: boolean;
}

export function AnalysisResult({
  result,
  request,
  createdAt,
  onSave,
  isSaved,
}: AnalysisResultProps) {
  const severity = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.medium;
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedGithub, setCopiedGithub] = useState(false);

  const copyFullReport = () => {
    const fullReport = `=== BugSense Diagnostic Report ===
Error: ${request.errorMessage}
Language: ${LANGUAGE_LABELS[request.language]}
Severity: ${severity.label}

[Error Summary]
${result.errorSummary}

[Root Cause]
${result.possibleCause}

[Explanation]
${result.explanation}

[Suggested Solution]
${result.suggestedSolution}

${result.codeExample ? `[Code Fix]\n${result.codeExample}` : ""}
`;
    navigator.clipboard
      .writeText(fullReport)
      .then(() => {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      })
      .catch(() => {});
  };

  const handleCopyGithubIssue = () => {
    const ghIssue = generateGitHubIssueTemplate(result, request);
    navigator.clipboard
      .writeText(ghIssue)
      .then(() => {
        setCopiedGithub(true);
        setTimeout(() => setCopiedGithub(false), 2000);
      })
      .catch(() => {});
  };

  const handleDownloadMarkdown = () => {
    downloadMarkdownFile(result, request, createdAt);
  };

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* ── RESULT HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-950 via-[#07132e] to-slate-950 border border-sky-500/25 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Diagnostic Complete
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                BugSense AI
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {LANGUAGE_LABELS[request.language]} · {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider border ${getSeverityBadgeClass(
              result.severity
            )}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {severity.label} Severity
          </span>

          {/* Download Markdown */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer shadow-sm"
            onClick={handleDownloadMarkdown}
            title="Download full Markdown report"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export .md</span>
          </button>

          {/* Copy GitHub Issue */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer shadow-sm"
            onClick={handleCopyGithubIssue}
            title="Copy as GitHub Issue template"
          >
            {copiedGithub ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Issue!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>GitHub Issue</span>
              </>
            )}
          </button>

          {/* Copy Report */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer shadow-sm"
            onClick={copyFullReport}
            title="Copy entire diagnostic report"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          {/* Print */}
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer shadow-sm"
            onClick={handlePrint}
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {onSave && (
            <button
              id="save-result-button"
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                isSaved
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 cursor-default"
                  : "bg-slate-900/80 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:text-white"
              }`}
              onClick={onSave}
              disabled={isSaved}
              title={isSaved ? "Saved to history" : "Save to history"}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                  <span>Save</span>
                </>
              )}
            </button>
          )}

          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors cursor-pointer shadow-sm"
            title="Open history archive"
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xs:inline">History</span>
          </Link>
        </div>
      </div>

      {/* ── RESULT CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 w-full">
        {/* Error Summary */}
        <div className="flex flex-col gap-2.5 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-amber-500/25 shadow-lg">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 pb-2 border-b border-slate-800/80">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Error Summary</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            {result.errorSummary}
          </p>
        </div>

        {/* Root Cause */}
        <div className="flex flex-col gap-2.5 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-sky-500/25 shadow-lg">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sky-400 pb-2 border-b border-slate-800/80">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>Root Cause</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            {result.possibleCause}
          </p>
        </div>

        {/* Technical Explanation - full width */}
        <div className="md:col-span-2 flex flex-col gap-2.5 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-slate-800/80">
            <FileText className="w-4 h-4 shrink-0" />
            <span>Technical Explanation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {result.explanation}
          </p>
        </div>

        {/* Suggested Solution - full width */}
        <div className="md:col-span-2 flex flex-col gap-2.5 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-emerald-500/25 shadow-lg">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-slate-800/80">
            <Wrench className="w-4 h-4 shrink-0" />
            <span>Step-by-Step Resolution</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-emerald-500/20">
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
              {result.suggestedSolution}
            </p>
          </div>
        </div>

        {/* ── INTERACTIVE CODE DIFF & REPAIRED CODE VIEWER ── */}
        {result.codeExample && result.codeExample.trim() ? (
          <div className="md:col-span-2">
            <CodeDiffViewer
              originalCode={request.codeSnippet}
              fixedCode={result.codeExample}
              language={request.language}
            />
          </div>
        ) : null}

        {/* ── AUTOMATED REGRESSION TEST SUITE GENERATOR ── */}
        <div className="md:col-span-2">
          <UnitTestGenerator
            language={request.language}
            errorMessage={request.errorMessage}
            codeSnippet={request.codeSnippet}
            codeExample={result.codeExample}
          />
        </div>
      </div>
    </div>
  );
}
