"use client";

import { useState, useMemo } from "react";
import {
  Regex as RegexIcon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Code2,
  Flame,
  Info,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyzeRegex, REGEX_PRESETS, RegexPreset } from "@/lib/regex-utils";
import { NAV_ITEMS } from "@/lib/nav-items";

export default function RegexStudioPage() {
  const [pattern, setPattern] = useState(REGEX_PRESETS[0].pattern);
  const [flags, setFlags] = useState(REGEX_PRESETS[0].flags);
  const [testString, setTestString] = useState(REGEX_PRESETS[0].testString);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => analyzeRegex(pattern, flags, testString), [pattern, flags, testString]);

  const handleSelectPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.testString);
  };

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell
      title="Regex Studio"
      subtitle="Interactive regular expression debugger and catastrophic backtracking (ReDoS) detector"
      navItems={NAV_ITEMS}
      actions={
        <Button
          onClick={handleCopyPattern}
          size="sm"
          className="bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold gap-1.5 shadow-md shadow-purple-500/20"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied!" : "Copy Regex"}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-purple-500/20">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <span>Regex Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {REGEX_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                  pattern === p.pattern
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold"
                    : "bg-slate-950/80 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern & Flags Input */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-3 shadow-lg">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <RegexIcon className="w-4 h-4 text-purple-400" />
            Regular Expression Pattern &amp; Flags
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-lg select-none">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. ^[a-zA-Z0-9]+$"
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
            />
            <span className="text-slate-500 font-mono text-lg select-none">/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gims"
              className="w-20 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white text-center focus:outline-none focus:border-purple-500/60"
              title="Flags: g (global), i (ignore case), m (multiline), s (dotAll)"
            />
          </div>

          {/* ReDoS Alert Banner */}
          {analysis.hasRedosRisk && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/50 flex items-start gap-3 text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold uppercase tracking-wider text-rose-400">
                  Critical Hazard: Catastrophic Backtracking (ReDoS) Risk
                </div>
                <p className="leading-relaxed">{analysis.redosReason}</p>
              </div>
            </div>
          )}

          {/* Syntax Error */}
          {!analysis.isValid && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              Syntax Error: {analysis.error}
            </div>
          )}
        </div>

        {/* Dual Split: Test String vs Match Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Test String */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                Test Strings (Target Input)
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestString("")}
                className="text-xs text-slate-400 hover:text-white h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to match against the pattern..."
              rows={14}
              className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-purple-500/60 text-xs font-mono text-slate-200 resize-none leading-relaxed focus:outline-none"
            />
          </div>

          {/* Right: Matches & Token Breakdown */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Matches Found ({analysis.matches.length})
              </label>
              <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 font-mono">
                {flags ? `flags: /${flags}` : "no flags"}
              </Badge>
            </div>

            {/* Match list */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {analysis.matches.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
                  No matches found in the test string.
                </div>
              ) : (
                analysis.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">#{idx + 1}</span>
                        <span className="text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {m.match}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Index: {m.index}..{m.index + m.length}
                      </span>
                    </div>

                    {m.captures && m.captures.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1 pt-1.5 border-t border-slate-800/80">
                        {m.captures.map((cap, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-sky-400 border border-slate-800"
                          >
                            Group ${cIdx + 1}: &ldquo;{cap}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Token Breakdown Explainer */}
            {analysis.tokensExplanation.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  Pattern Structure Breakdown
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {analysis.tokensExplanation.map((item, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col gap-0.5"
                    >
                      <span className="font-mono font-bold text-sky-400">{item.token}</span>
                      <span className="text-[11px] text-slate-400 leading-tight">{item.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
