"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowRight,
  Sparkles,
  FileCode,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Code2,
  Filter,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseStackTrace, SAMPLE_TRACES } from "@/lib/stack-parser";
import { FrameType, StackFrame } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/nav-items";

export default function StackLensPage() {
  const router = useRouter();
  const [rawTrace, setRawTrace] = useState<string>(SAMPLE_TRACES[0].trace);
  const [filterType, setFilterType] = useState<"all" | "user" | "non-internal">("all");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseStackTrace(rawTrace), [rawTrace]);

  const filteredFrames = useMemo(() => {
    if (filterType === "user") {
      return parsed.frames.filter((f) => f.type === "user");
    }
    if (filterType === "non-internal") {
      return parsed.frames.filter((f) => f.type !== "internal");
    }
    return parsed.frames;
  }, [parsed.frames, filterType]);

  const handleCopyClean = () => {
    const text = `Error: ${parsed.errorName}: ${parsed.errorMessage}\nCulprit: ${parsed.culpritFrame?.file || "N/A"}:${parsed.culpritFrame?.line || "N/A"}\n\nUser Frames:\n` +
      parsed.frames.filter((f) => f.type === "user").map((f) => `  at ${f.method} (${f.file}:${f.line}:${f.column || 0})`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToAnalyzer = () => {
    const fullError = `${parsed.errorName}: ${parsed.errorMessage}`;
    // Store in sessionStorage or push with params
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bugsense_prefill_error", fullError);
      sessionStorage.setItem("bugsense_prefill_lang", parsed.detectedLanguage);
      if (parsed.culpritFrame) {
        sessionStorage.setItem(
          "bugsense_prefill_snippet",
          `// Origin: ${parsed.culpritFrame.file}:${parsed.culpritFrame.line}\n// Function: ${parsed.culpritFrame.method}`
        );
      }
    }
    router.push("/analyzer");
  };

  const getTypeBadge = (type: FrameType) => {
    switch (type) {
      case "user":
        return <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">App Code</Badge>;
      case "vendor":
        return <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] font-mono">node_modules</Badge>;
      case "internal":
        return <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] font-mono">Runtime</Badge>;
    }
  };

  return (
    <AppShell
      title="Stack Lens"
      subtitle="Interactive stack trace demangler and root-frame inspector"
      navItems={NAV_ITEMS}
      actions={
        <Button
          onClick={handleSendToAnalyzer}
          size="sm"
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold gap-1.5 shadow-md shadow-sky-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze with BugSense AI</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Sample selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-sky-500/20">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Load Sample Trace:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TRACES.map((s) => (
              <button
                key={s.id}
                onClick={() => setRawTrace(s.trace)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700 hover:border-sky-500/50 text-slate-300 hover:text-white transition-all font-mono"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Raw Input */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                Raw Stack Trace / Terminal Dump
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRawTrace("")}
                className="text-xs text-slate-400 hover:text-white h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            <textarea
              value={rawTrace}
              onChange={(e) => setRawTrace(e.target.value)}
              placeholder="Paste raw stack trace, panic, or traceback here..."
              rows={18}
              className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-sky-500/60 text-xs font-mono text-slate-200 resize-none leading-relaxed focus:outline-none"
            />
          </div>

          {/* Right: Parsed Frames & Demangled Visuals */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Header Summary Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/20 flex flex-col gap-3 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {parsed.errorName}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-sky-400 border-sky-500/30 uppercase font-mono">
                      {parsed.detectedLanguage}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-white break-words">
                    {parsed.errorMessage || "No error message extracted"}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyClean}
                  className="h-8 border-slate-700 text-xs text-slate-300 hover:text-white shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy Clean"}
                </Button>
              </div>

              {/* Culprit Banner */}
              {parsed.culpritFrame && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Culprit Application Frame
                      </div>
                      <div className="text-xs font-mono text-white truncate">
                        {parsed.culpritFrame.file}:{parsed.culpritFrame.line || "?"}
                        <span className="text-slate-400"> in </span>
                        <span className="text-sky-300 font-bold">{parsed.culpritFrame.method}()</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendToAnalyzer}
                    className="h-7 text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 shrink-0"
                  >
                    Diagnose
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Frames ({filteredFrames.length} of {parsed.frames.length}):</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setFilterType("all")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filterType === "all" ? "bg-sky-500/20 text-sky-300 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({parsed.frames.length})
                </button>
                <button
                  onClick={() => setFilterType("user")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filterType === "user" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  App Only ({parsed.frames.filter((f) => f.type === "user").length})
                </button>
                <button
                  onClick={() => setFilterType("non-internal")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    filterType === "non-internal" ? "bg-blue-500/20 text-blue-300 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Exclude Runtime
                </button>
              </div>
            </div>

            {/* Frame List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredFrames.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
                  No frames matched the active filter.
                </div>
              ) : (
                filteredFrames.map((frame, idx) => (
                  <div
                    key={frame.id}
                    className={`p-3 rounded-xl border transition-all text-xs font-mono flex flex-col gap-1.5 ${
                      frame.isCulprit
                        ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-950"
                        : frame.type === "user"
                        ? "bg-slate-900/80 border-slate-700/80 hover:border-slate-600"
                        : "bg-slate-950/60 border-slate-800/60 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 select-none w-5 text-right font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-sky-300 truncate">
                          {frame.method}
                        </span>
                        {frame.isCulprit && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] px-1 py-0 uppercase">
                            Root Culprit
                          </Badge>
                        )}
                      </div>
                      <div>{getTypeBadge(frame.type)}</div>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-7 break-all">
                      {frame.file}
                      {frame.line !== undefined && (
                        <span className="text-slate-200 font-semibold">
                          :{frame.line}
                          {frame.column !== undefined ? `:${frame.column}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
