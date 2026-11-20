"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { executeJavaScript } from "@/lib/code-runner";
import { ExecutionResult, ProgrammingLanguage } from "@/lib/types";

interface LiveFixRunnerProps {
  originalCode?: string;
  fixedCode: string;
  language: ProgrammingLanguage;
}

export function LiveFixRunner({ originalCode, fixedCode, language }: LiveFixRunnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [target, setTarget] = useState<"fixed" | "original">("fixed");

  const isJsOrTs = language === "javascript" || language === "typescript";

  const handleExecute = async (mode: "fixed" | "original") => {
    setTarget(mode);
    setRunning(true);
    setResult(null);
    setIsOpen(true);
    try {
      const codeToRun = mode === "fixed" ? fixedCode : (originalCode || "");
      const res = await executeJavaScript(codeToRun);
      setResult(res);
    } catch (err: unknown) {
      setResult({
        success: false,
        logs: [],
        error: String(err),
        durationMs: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl sm:rounded-2xl bg-slate-950/80 border border-emerald-500/25 shadow-lg overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-emerald-950/30 via-slate-950 to-slate-950 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Live Fix Verification &amp; Sandbox Runner
              </h3>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                In-Browser Runtime
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Execute patched code in an isolated JavaScript execution sandbox to verify behavior.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {originalCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExecute("original")}
              disabled={running}
              className="h-8 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hidden sm:inline-flex"
            >
              Run Original (Buggy)
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => handleExecute("fixed")}
            disabled={running}
            className="h-8 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold gap-1 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{running ? "Verifying..." : "Run & Verify Patch"}</span>
          </Button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded terminal drawer */}
      {isOpen && (
        <div className="p-4 sm:p-5 bg-slate-950 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target: {target === "fixed" ? "Patched Solution" : "Original Buggy Code"}</span>
            </div>
            <div className="flex items-center gap-3">
              {result && (
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  {result.durationMs}ms
                </span>
              )}
              <Link
                href="/sandbox"
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                Full Sandbox <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {running && (
            <div className="p-6 text-center text-emerald-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Executing in sandbox environment...</span>
            </div>
          )}

          {result && !running && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified Output Clean
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]">
                    <XCircle className="w-3 h-3 mr-1" />
                    Runtime Exception Caught
                  </Badge>
                )}
              </div>

              {result.logs.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  {result.logs.map((log, i) => (
                    <div key={i} className="text-slate-200 break-words">
                      <span className="text-slate-600 select-none mr-2">&gt;</span>
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {result.returnValue !== undefined && (
                <div className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-500/30 text-sky-300">
                  <span className="text-slate-500">Return Value: </span>
                  {result.returnValue}
                </div>
              )}

              {result.error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 space-y-1">
                  <div className="font-bold text-xs">Runtime Error:</div>
                  <pre className="text-[11px] whitespace-pre-wrap break-words">{result.error}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
