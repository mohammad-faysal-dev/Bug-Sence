"use client";

import { useState, useCallback } from "react";
import {
  FlaskConical,
  Send,
  RotateCcw,
  Copy,
  CheckCheck,
  Clock,
  Code2,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NAV_ITEMS } from "@/lib/nav-items";

const EXAMPLE_PAYLOAD = {
  errorMessage: "TypeError: Cannot read properties of undefined (reading 'map')",
  language: "javascript",
  codeSnippet: "const items = undefined;\nconst result = items.map(x => x.id);",
};

const EXAMPLE_JSON = JSON.stringify(EXAMPLE_PAYLOAD, null, 2);

type StatusLevel = "success" | "warn" | "error" | null;

function getStatusLevel(status: number | null): StatusLevel {
  if (status === null) return null;
  if (status >= 200 && status < 300) return "success";
  if (status >= 400 && status < 500) return "warn";
  return "error";
}

function StatusBadge({ status }: { status: number | null }) {
  const level = getStatusLevel(status);
  if (status === null) return null;

  const colorMap: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    error: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };

  const labelMap: Record<string, string> = {
    success: "OK",
    warn: "Client Error",
    error: "Server Error",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold font-mono ${colorMap[level!]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status} {level ? labelMap[level] : ""}
    </span>
  );
}

function LineNumberedCode({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="flex text-xs font-mono leading-relaxed overflow-auto max-h-[480px]">
      {/* Line numbers */}
      <div className="select-none pr-4 text-right text-slate-600 border-r border-slate-800 mr-4 shrink-0">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Code */}
      <div className="flex-1 text-slate-200 whitespace-pre">
        {lines.map((line, i) => (
          <div key={i}>{line || " "}</div>
        ))}
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  const [requestBody, setRequestBody] = useState(EXAMPLE_JSON);
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [requestHeaders, setRequestHeaders] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const validateJson = useCallback((val: string) => {
    try {
      JSON.parse(val);
      setJsonError(null);
      return true;
    } catch (e: unknown) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
      return false;
    }
  }, []);

  const handleBodyChange = (val: string) => {
    setRequestBody(val);
    validateJson(val);
  };

  const handleSend = async () => {
    if (!validateJson(requestBody)) return;

    setIsLoading(true);
    setResponse(null);
    setStatus(null);
    setElapsed(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    setRequestHeaders(headers);

    const start = performance.now();
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: requestBody,
      });
      const end = performance.now();
      setElapsed(Math.round(end - start));
      setStatus(res.status);

      let text: string;
      try {
        const json = await res.json();
        text = JSON.stringify(json, null, 2);
      } catch {
        text = await res.text();
      }
      setResponse(text);
    } catch (err: unknown) {
      const end = performance.now();
      setElapsed(Math.round(end - start));
      setStatus(0);
      setResponse(err instanceof Error ? `Network Error: ${err.message}` : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRequestBody(EXAMPLE_JSON);
    setResponse(null);
    setStatus(null);
    setElapsed(null);
    setRequestHeaders(null);
    setJsonError(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell
      title="API Playground"
      subtitle="Live test the BugSense /api/analyze endpoint"
      navItems={NAV_ITEMS}
    >
      <div className="w-full max-w-[1680px] mx-auto pb-12 flex flex-col gap-6">
        {/* Header strip */}
        <div className="flex items-center gap-3 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-950 to-slate-950 border border-violet-500/25 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-white">POST /api/analyze</span>
            <span className="text-xs text-slate-400">
              Send a JSON payload and inspect the raw response in real time.
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !!jsonError}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed border border-violet-500/50 transition-all cursor-pointer shadow-lg shadow-violet-900/30"
            >
              {isLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isLoading ? "Sending…" : "Send Request →"}
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Request Editor */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Code2 className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Request Body
                </span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">application/json</span>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => handleBodyChange(e.target.value)}
                spellCheck={false}
                rows={16}
                className={`w-full resize-none rounded-lg p-4 text-xs font-mono leading-relaxed bg-slate-900 border ${jsonError ? "border-rose-500/50 focus:border-rose-400" : "border-slate-700 focus:border-violet-500/60"} text-slate-200 placeholder-slate-600 outline-none transition-colors`}
                style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace" }}
              />
              {jsonError && (
                <p className="text-xs text-rose-400 font-mono mt-1">
                  ⚠ JSON parse error: {jsonError}
                </p>
              )}
            </div>

            {/* Request Headers */}
            {requestHeaders && (
              <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <ChevronRight className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Request Headers Sent
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(requestHeaders).map(([key, value]) => (
                    <div key={key} className="flex gap-3 text-xs font-mono">
                      <span className="text-sky-400 shrink-0 w-40 truncate">{key}</span>
                      <span className="text-slate-300">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Response Viewer */}
          <div className="flex flex-col gap-4">
            {/* Status & Timing bar */}
            {(status !== null || isLoading) && (
              <div className="flex items-center gap-3 flex-wrap p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                {isLoading ? (
                  <span className="text-xs text-slate-400 animate-pulse">Waiting for response…</span>
                ) : (
                  <>
                    <StatusBadge status={status} />
                    {elapsed !== null && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {elapsed} ms
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!response}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {copied ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied ? "Copied!" : "Copy Response"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Response body */}
            <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-lg min-h-[320px]">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Response Body
                </span>
              </div>

              {!response && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-500">Hit "Send Request →" to see the response here.</p>
                </div>
              )}

              {isLoading && (
                <div className="flex-1 flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {response && !isLoading && (
                <div
                  className="bg-slate-900 rounded-lg p-4 border border-slate-800"
                  style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace" }}
                >
                  <LineNumberedCode content={response} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
