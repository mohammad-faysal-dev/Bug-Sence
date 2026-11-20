"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Code2,
  Flame,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { executeJavaScript, SANDBOX_SAMPLES, SandboxSample } from "@/lib/code-runner";
import { ExecutionResult } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/nav-items";

export default function CodeSandboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"buggy" | "fixed">("buggy");
  const [currentSample, setCurrentSample] = useState<SandboxSample>(SANDBOX_SAMPLES[0]);
  const [buggyCode, setBuggyCode] = useState(SANDBOX_SAMPLES[0].buggyCode);
  const [fixedCode, setFixedCode] = useState(SANDBOX_SAMPLES[0].fixedCode);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const activeCode = activeTab === "buggy" ? buggyCode : fixedCode;
  const setActiveCode = (val: string) => {
    if (activeTab === "buggy") setBuggyCode(val);
    else setFixedCode(val);
  };

  const handleSelectSample = (sample: SandboxSample) => {
    setCurrentSample(sample);
    setBuggyCode(sample.buggyCode);
    setFixedCode(sample.fixedCode);
    setResult(null);
  };

  const handleRun = async () => {
    setExecuting(true);
    setResult(null);
    try {
      const res = await executeJavaScript(activeCode);
      setResult(res);
    } catch (err: unknown) {
      setResult({
        success: false,
        logs: [],
        error: String(err),
        durationMs: 0,
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSendToAnalyzer = () => {
    if (!result?.error) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bugsense_prefill_error", result.error);
      sessionStorage.setItem("bugsense_prefill_lang", "javascript");
      sessionStorage.setItem("bugsense_prefill_snippet", activeCode);
    }
    router.push("/analyzer");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell
      title="Code Sandbox"
      subtitle="Interactive in-browser code execution & fix verification playground"
      navItems={NAV_ITEMS}
      actions={
        <Button
          onClick={handleRun}
          disabled={executing}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-1.5 shadow-md shadow-emerald-500/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{executing ? "Executing..." : "Run Code (JS/TS)"}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Sample Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Preset Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SANDBOX_SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSample(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                  currentSample.id === s.id
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                    : "bg-slate-950/80 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Editor & Console Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Code Editor with Tabs */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab("buggy");
                    setResult(null);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === "buggy"
                      ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Buggy Code
                </button>
                <button
                  onClick={() => {
                    setActiveTab("fixed");
                    setResult(null);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === "fixed"
                      ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Patched Solution
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs text-slate-400 hover:text-white h-7 px-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCode("")}
                  className="text-xs text-slate-400 hover:text-white h-7 px-2"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <textarea
              value={activeCode}
              onChange={(e) => setActiveCode(e.target.value)}
              placeholder="Write JavaScript / TypeScript code to run in browser sandbox..."
              rows={18}
              className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-emerald-500/60 text-xs font-mono text-slate-200 resize-none leading-relaxed focus:outline-none"
            />
          </div>

          {/* Right: Execution Console Output */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Console Output
              </label>

              {result && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{result.durationMs}ms</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/95 border border-slate-800 min-h-[380px] max-h-[500px] overflow-y-auto flex flex-col justify-between font-mono text-xs">
              {!result && !executing && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 gap-2">
                  <Play className="w-6 h-6 text-slate-600 opacity-60" />
                  <p className="text-xs">Click &ldquo;Run Code&rdquo; to execute snippet in browser runtime.</p>
                </div>
              )}

              {executing && (
                <div className="h-full flex items-center justify-center p-8 text-emerald-400 gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Running snippet...</span>
                </div>
              )}

              {result && !executing && (
                <div className="space-y-3">
                  {/* Status header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                          <XCircle className="w-4 h-4" /> Runtime Crash
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                      Sandbox v1.0
                    </Badge>
                  </div>

                  {/* Standard output logs */}
                  {result.logs.length > 0 && (
                    <div className="space-y-1">
                      {result.logs.map((log, i) => (
                        <div
                          key={i}
                          className={`text-slate-200 break-words ${
                            log.startsWith("[WARN]")
                              ? "text-amber-300"
                              : log.startsWith("[ERROR]")
                              ? "text-rose-400"
                              : ""
                          }`}
                        >
                          <span className="text-slate-600 select-none mr-2">&gt;</span>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Return value */}
                  {result.returnValue !== undefined && (
                    <div className="p-2 rounded bg-sky-950/20 border border-sky-500/30 text-sky-300">
                      <span className="text-slate-500">Return: </span>
                      {result.returnValue}
                    </div>
                  )}

                  {/* Error box */}
                  {result.error && (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 space-y-2">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Uncaught Runtime Exception:</span>
                      </div>
                      <pre className="text-[11px] whitespace-pre-wrap break-words">{result.error}</pre>

                      <Button
                        size="sm"
                        onClick={handleSendToAnalyzer}
                        className="mt-2 w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs h-7 gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Diagnose Crash with BugSense AI
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
