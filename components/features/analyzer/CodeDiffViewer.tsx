"use client";

import { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Columns,
  GitCompare,
  Code2,
  Plus,
  Minus,
} from "lucide-react";
import { computeUnifiedDiff, computeSideBySideDiff } from "@/lib/diff";
import { ProgrammingLanguage } from "@/lib/types";
import { LANGUAGE_LABELS } from "@/lib/utils";

interface CodeDiffViewerProps {
  originalCode?: string;
  fixedCode: string;
  language: ProgrammingLanguage;
}

type ViewMode = "unified" | "side-by-side" | "clean";

export function CodeDiffViewer({
  originalCode = "",
  fixedCode,
  language,
}: CodeDiffViewerProps) {
  const hasOriginal = Boolean(originalCode && originalCode.trim().length > 0);
  const [viewMode, setViewMode] = useState<ViewMode>(hasOriginal ? "unified" : "clean");
  const [copied, setCopied] = useState(false);

  // Compute diffs
  const unifiedDiff = useMemo(() => {
    if (!hasOriginal) return [];
    return computeUnifiedDiff(originalCode, fixedCode);
  }, [originalCode, fixedCode, hasOriginal]);

  const sideBySideDiff = useMemo(() => {
    if (!hasOriginal) return [];
    return computeSideBySideDiff(originalCode, fixedCode);
  }, [originalCode, fixedCode, hasOriginal]);

  // Diff stats
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    for (const item of unifiedDiff) {
      if (item.type === "add") additions++;
      if (item.type === "delete") deletions++;
    }
    return { additions, deletions };
  }, [unifiedDiff]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl sm:rounded-2xl bg-slate-950/95 border border-sky-500/30 shadow-2xl overflow-hidden flex flex-col w-full">
      {/* ── HEADER TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3 bg-slate-900/90 border-b border-slate-800 gap-3">
        {/* Left side: Dots + Title + Mode Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <span className="text-[11px] sm:text-xs font-mono font-bold text-sky-400">
            {LANGUAGE_LABELS[language]} Code Patch
          </span>

          {hasOriginal && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold ml-1">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Plus className="w-2.5 h-2.5" />
                {stats.additions}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Minus className="w-2.5 h-2.5" />
                {stats.deletions}
              </span>
            </div>
          )}
        </div>

        {/* Right side: View tabs & Copy */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {hasOriginal && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("unified")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  viewMode === "unified"
                    ? "bg-sky-500 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Unified Git Diff View"
              >
                <GitCompare className="w-3 h-3" />
                <span className="hidden xs:inline">Unified</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("side-by-side")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  viewMode === "side-by-side"
                    ? "bg-sky-500 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Split Side-by-Side Diff View"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden xs:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("clean")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  viewMode === "clean"
                    ? "bg-sky-500 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Only Final Repaired Code"
              >
                <Code2 className="w-3 h-3" />
                <span className="hidden xs:inline">Repaired</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer shrink-0 shadow-sm"
            onClick={() => handleCopy(fixedCode)}
            title="Copy repaired code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── CODE / DIFF CONTENT ── */}
      <div className="overflow-x-auto bg-[#040814] text-[11px] sm:text-xs font-mono leading-relaxed max-h-[500px] overflow-y-auto">
        {/* VIEW 1: CLEAN REPAIRED CODE */}
        {viewMode === "clean" && (
          <div className="py-2.5">
            {fixedCode.split("\n").map((line, idx) => (
              <div
                key={idx}
                className="flex items-start hover:bg-slate-900/60 transition-colors px-2"
              >
                <span className="w-10 sm:w-12 shrink-0 select-none text-right pr-3.5 text-slate-600 font-mono text-[10px] sm:text-[11px] pt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-100 whitespace-pre overflow-x-visible">
                  {line || " "}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: UNIFIED DIFF */}
        {viewMode === "unified" && (
          <div className="py-2.5 divide-y divide-transparent">
            {unifiedDiff.map((diffLine, idx) => {
              const isAdd = diffLine.type === "add";
              const isDel = diffLine.type === "delete";
              const lineBg = isAdd
                ? "bg-emerald-950/45 text-emerald-200 border-l-2 border-emerald-500"
                : isDel
                ? "bg-rose-950/45 text-rose-300 border-l-2 border-rose-500 opacity-80"
                : "text-slate-300 hover:bg-slate-900/40 border-l-2 border-transparent";

              const sign = isAdd ? "+" : isDel ? "-" : " ";

              return (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 transition-colors ${lineBg}`}
                >
                  {/* Old line number */}
                  <span className="w-8 sm:w-10 shrink-0 select-none text-right pr-2 text-slate-600 text-[10px] font-mono">
                    {diffLine.oldLineNumber || ""}
                  </span>
                  {/* New line number */}
                  <span className="w-8 sm:w-10 shrink-0 select-none text-right pr-2 text-slate-600 text-[10px] font-mono border-r border-slate-800/80 mr-2">
                    {diffLine.newLineNumber || ""}
                  </span>
                  {/* Marker sign */}
                  <span
                    className={`w-4 shrink-0 font-bold select-none ${
                      isAdd
                        ? "text-emerald-400"
                        : isDel
                        ? "text-rose-400"
                        : "text-transparent"
                    }`}
                  >
                    {sign}
                  </span>
                  {/* Line text */}
                  <span className="whitespace-pre overflow-x-visible">
                    {diffLine.content || " "}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: SIDE-BY-SIDE DIFF */}
        {viewMode === "side-by-side" && (
          <div className="min-w-[700px] flex flex-col">
            {/* Column Headers */}
            <div className="grid grid-cols-2 bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider py-1.5 px-3">
              <div className="text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Original (Buggy)
              </div>
              <div className="text-emerald-400 flex items-center gap-1.5 pl-3 border-l border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Repaired (Fixed)
              </div>
            </div>

            {/* Split Lines */}
            <div className="divide-y divide-slate-900/50">
              {sideBySideDiff.map((row, idx) => (
                <div key={idx} className="grid grid-cols-2">
                  {/* Left Column (Original) */}
                  <div
                    className={`flex items-start px-2 py-0.5 border-r border-slate-800 ${
                      row.left.type === "delete"
                        ? "bg-rose-950/40 text-rose-300"
                        : row.left.type === "empty"
                        ? "bg-slate-950/30 text-transparent"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="w-8 shrink-0 select-none text-right pr-2 text-slate-600 text-[10px] font-mono">
                      {row.left.lineNumber || ""}
                    </span>
                    <span className="whitespace-pre overflow-x-visible flex-1">
                      {row.left.content || (row.left.type === "empty" ? "" : " ")}
                    </span>
                  </div>

                  {/* Right Column (Fixed) */}
                  <div
                    className={`flex items-start px-2 py-0.5 ${
                      row.right.type === "add"
                        ? "bg-emerald-950/40 text-emerald-200"
                        : row.right.type === "empty"
                        ? "bg-slate-950/30 text-transparent"
                        : "text-slate-300"
                    }`}
                  >
                    <span className="w-8 shrink-0 select-none text-right pr-2 text-slate-600 text-[10px] font-mono">
                      {row.right.lineNumber || ""}
                    </span>
                    <span className="whitespace-pre overflow-x-visible flex-1">
                      {row.right.content || (row.right.type === "empty" ? "" : " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
