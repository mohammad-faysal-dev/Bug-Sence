"use client";

import { useState } from "react";
import {
  FlaskConical,
  Play,
  Copy,
  Check,
  Sparkles,
  Terminal,
  RefreshCw,
  FileCode,
} from "lucide-react";
import { ProgrammingLanguage, TestGenerationResult } from "@/lib/types";

interface UnitTestGeneratorProps {
  language: ProgrammingLanguage;
  errorMessage: string;
  codeSnippet?: string;
  codeExample?: string;
}

export function UnitTestGenerator({
  language,
  errorMessage,
  codeSnippet,
  codeExample,
}: UnitTestGeneratorProps) {
  const [testResult, setTestResult] = useState<TestGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          errorMessage,
          codeSnippet,
          codeExample,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to synthesize regression unit test.");
      }

      setTestResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error generating test.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-950 via-[#071530] to-slate-950 border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col w-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-5 border-b border-purple-500/20 bg-slate-900/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-sm shadow-purple-500/10">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Automated Regression Test Suite
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                AI Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesize runnable test cases proving the bug cannot regress in CI/CD.
            </p>
          </div>
        </div>

        {/* Generate / Regenerate Action Button */}
        <div>
          {!testResult ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerateTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-purple-600/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Test...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Generate Regression Test</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerateTest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                title="Regenerate test"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(testResult.testCode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Test</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="p-4 bg-rose-950/40 border-b border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* ── PRE-GENERATION TEASER ── */}
      {!testResult && !isLoading && !error && (
        <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-slate-400 max-w-md">
            Click <strong className="text-purple-300">&ldquo;Generate Regression Test&rdquo;</strong> to construct an isolated unit test reproducing the exact failure scenario and verifying your patch.
          </p>
        </div>
      )}

      {/* ── LOADING SKELETON ── */}
      {isLoading && !testResult && (
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
          <p className="text-xs font-medium text-slate-300">
            Constructing test assertions and test runner harness for {language}...
          </p>
        </div>
      )}

      {/* ── GENERATED TEST RESULT ── */}
      {testResult && (
        <div className="flex flex-col">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs gap-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-mono text-slate-200 font-semibold">
                {testResult.fileName}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">
                Framework: <strong className="text-purple-300">{testResult.framework}</strong>
              </span>
            </div>

            {testResult.instructions && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300">{testResult.instructions}</span>
              </div>
            )}
          </div>

          {/* Test Code Block with Line Numbers */}
          <div className="overflow-x-auto bg-[#040814] text-[11px] sm:text-xs font-mono leading-relaxed py-2.5 max-h-[420px] overflow-y-auto">
            {testResult.testCode.split("\n").map((line, idx) => (
              <div
                key={idx}
                className="flex items-start hover:bg-slate-900/60 transition-colors px-2"
              >
                <span className="w-10 shrink-0 select-none text-right pr-3.5 text-slate-600 text-[10px] sm:text-[11px] pt-0.5">
                  {idx + 1}
                </span>
                <span className="text-purple-100 whitespace-pre overflow-x-visible">
                  {line || " "}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
