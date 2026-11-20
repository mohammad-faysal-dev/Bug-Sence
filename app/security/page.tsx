"use client";

import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  Code2,
  FileCode,
  Download,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SECURITY_SAMPLES } from "@/lib/security-scanner";
import { SecurityAuditResult, ProgrammingLanguage } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/nav-items";
import { getSettings } from "@/lib/settings";

export default function SecurityPage() {
  const [code, setCode] = useState<string>(SECURITY_SAMPLES[0].code);
  const [language, setLanguage] = useState<ProgrammingLanguage>(SECURITY_SAMPLES[0].language);
  const [result, setResult] = useState<SecurityAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleAudit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const settings = getSettings();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.customApiKey) headers["x-groq-api-key"] = settings.customApiKey;
      if (settings.selectedModel) headers["x-groq-model"] = settings.selectedModel;
      if (settings.useOfflineEngine) headers["x-use-offline"] = "true";

      const res = await fetch("/api/security-audit", {
        method: "POST",
        headers,
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error("Audit failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = `# BugSense Security Audit Report
Grade: ${result.grade} (Score: ${result.score}/100)
Total Issues: ${result.totalIssues} (Critical: ${result.criticalCount}, High: ${result.highCount})

## Summary
${result.summary}

## Vulnerability Findings
${result.findings.map((f, i) => `### ${i + 1}. [${f.severity.toUpperCase()}] ${f.title} (${f.cwe || "OWASP"})
- Line: ${f.line || "N/A"}
- Description: ${f.description}
- Remediation: ${f.remediation}
${f.vulnerableSnippet ? `\`\`\`\n${f.vulnerableSnippet}\n\`\`\`` : ""}
`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 75) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 uppercase font-mono text-[10px]">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 uppercase font-mono text-[10px]">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 uppercase font-mono text-[10px]">Medium</Badge>;
      default:
        return <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/40 uppercase font-mono text-[10px]">Low</Badge>;
    }
  };

  return (
    <AppShell
      title="Security Guard"
      subtitle="OWASP Top 10 vulnerability auditor and automated code hardening"
      navItems={NAV_ITEMS}
      actions={
        <Button
          onClick={handleAudit}
          disabled={loading || !code.trim()}
          className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold gap-1.5 shadow-md shadow-rose-500/20"
        >
          {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{loading ? "Auditing Code..." : "Run Security Audit"}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Sample vulnerabilities picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Load Vulnerable Code Sample:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SECURITY_SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setCode(s.code);
                  setLanguage(s.language);
                  setResult(null);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-white transition-all font-mono"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Code Input */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-rose-400" />
                Target Source Code for Audit
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
                  className="bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300 px-2 py-1 focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="java">Java</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCode("")}
                  className="text-xs text-slate-400 hover:text-white h-7 px-2"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code to scan for SQL Injection, XSS, hardcoded secrets, ReDoS..."
              rows={18}
              className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-rose-500/60 text-xs font-mono text-slate-200 resize-none leading-relaxed focus:outline-none"
            />
          </div>

          {/* Right: Security Findings */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {!result && !loading && (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-base font-bold text-white">No Security Audit Run Yet</div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click &ldquo;Run Security Audit&rdquo; to scan for OWASP Top 10 vulnerabilities, CWE defects, and receive hardened code.
                </p>
                <Button
                  onClick={handleAudit}
                  size="sm"
                  className="mt-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold"
                >
                  Scan Code Now
                </Button>
              </div>
            )}

            {loading && (
              <div className="p-12 text-center border border-rose-500/30 rounded-2xl bg-slate-950/60 flex flex-col items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-rose-400 animate-spin" />
                <div className="text-sm font-bold text-white">Inspecting AST &amp; Threat Vectors...</div>
                <p className="text-xs text-slate-400">Evaluating against OWASP Top 10 and CWE rules</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                {/* Score & Summary Banner */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/20 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-mono font-black ${getScoreColor(result.score)}`}>
                        <span className="text-xl leading-none">{result.grade}</span>
                        <span className="text-[10px] opacity-80">{result.score}/100</span>
                      </div>
                      <div>
                        <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                          Security Posture
                        </div>
                        <h3 className="text-sm font-semibold text-white mt-0.5">{result.summary}</h3>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyReport}
                      className="border-slate-700 text-xs text-slate-300 hover:text-white shrink-0"
                    >
                      {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedReport ? "Copied" : "Export Report"}
                    </Button>
                  </div>

                  {/* Issue Counter Chips */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <div className="text-xs text-rose-400 font-bold">{result.criticalCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Critical</div>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="text-xs text-orange-400 font-bold">{result.highCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase">High</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="text-xs text-amber-400 font-bold">{result.mediumCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Medium</div>
                    </div>
                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                      <div className="text-xs text-sky-400 font-bold">{result.lowCount}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Low</div>
                    </div>
                  </div>
                </div>

                {/* Findings List */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {result.findings.length === 0 ? (
                    <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-emerald-300 text-xs">
                      ✓ Zero vulnerabilities detected! Code complies with safety baseline.
                    </div>
                  ) : (
                    result.findings.map((f, i) => (
                      <div
                        key={f.id || i}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(f.severity)}
                            {f.cwe && (
                              <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700 font-mono">
                                {f.cwe}
                              </Badge>
                            )}
                            <span className="font-bold text-white">{f.title}</span>
                          </div>
                          {f.line && (
                            <span className="text-[11px] text-slate-400 font-mono">Line {f.line}</span>
                          )}
                        </div>

                        <p className="text-slate-300 leading-relaxed">{f.description}</p>

                        {f.vulnerableSnippet && (
                          <div className="p-2 rounded bg-rose-950/20 border border-rose-500/30 font-mono text-[11px] text-rose-300 truncate">
                            - {f.vulnerableSnippet}
                          </div>
                        )}

                        <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
                          <span className="font-bold">Remedy: </span>
                          {f.remediation}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
