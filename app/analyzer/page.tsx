"use client";

import { useState, Suspense } from "react";
import {
  Scan,
  AlertCircle,
  Target,
  Code2,
  ShieldCheck,
  Sparkles,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AnalyzerForm } from "@/components/features/analyzer/AnalyzerForm";
import { AnalysisResult } from "@/components/features/analyzer/AnalysisResult";
import { useAnalyze } from "@/hooks/useAnalyze";
import { useHistory } from "@/hooks/useHistory";
import { AnalysisRequest, BugAnalysis } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav-items";
import { Badge } from "@/components/ui/badge";

function AnalyzerContent() {
    const { analyze, isLoading, error, clearError } = useAnalyze();
    const { addRecord } = useHistory();

    const [currentResult, setCurrentResult] = useState<BugAnalysis | null>(null);
    const [currentRequest, setCurrentRequest] = useState<AnalysisRequest | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = async (request: AnalysisRequest) => {
        clearError();
        setCurrentResult(null);
        setIsSaved(false);
        const result = await analyze(request);
        if (result) {
            const now = new Date().toISOString();
            const record = {
                id: generateId(),
                request,
                result,
                createdAt: now,
            };
            // Automatically save to localhost localStorage history
            addRecord(record);
            setCurrentResult(result);
            setCurrentRequest(request);
            setCurrentTime(now);
            setIsSaved(true);
        }
    };

    const handleSave = () => {
        if (!currentResult || !currentRequest) return;
        addRecord({
            id: generateId(),
            request: currentRequest,
            result: currentResult,
            createdAt: currentTime || new Date().toISOString(),
        });
        setIsSaved(true);
    };

    return (
        <div className="w-full flex flex-col gap-10">
            {/* Diagnostic Workbench */}
            <section className="w-full">
                <AnalyzerForm onSubmit={handleSubmit} isLoading={isLoading} />
            </section>

            {/* Output Section */}
            <section className="w-full flex flex-col gap-6">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center gap-7 p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border border-sky-500/30 shadow-2xl flex-col sm:flex-row">
                        <div className="relative w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
                            <Scan className="w-8 h-8 text-sky-400 animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
                            <div className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                                <Sparkles className="w-4 h-4 text-sky-400" />
                                BugSense Neural Engine In Action
                            </div>
                            <div className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                                Dissecting stack frames, analyzing AST structure, and generating verified resolution steps...
                            </div>
                            <div className="flex items-center gap-3.5 flex-wrap mt-1 justify-center sm:justify-start">
                                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                                    Syntax &amp; Trace Parsing
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                                    Root Cause Isolation
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
                                    Fix Synthesis &amp; Verification
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Notice State */}
                {error && !isLoading && (
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-5 p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/40 shadow-xl">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>AI Engine Error</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-normal">
                                        Diagnostics
                                    </span>
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">{error}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors shrink-0 cursor-pointer"
                            onClick={clearError}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Initial State: Capabilities Showcase */}
                {!currentResult && !isLoading && !error && (
                    <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border border-sky-500/25 shadow-2xl flex flex-col gap-8">
                        <div className="flex items-center justify-between gap-4 pb-6 border-b border-sky-500/15 flex-wrap">
                            <div className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/25 uppercase tracking-wider w-fit">
                                    <Activity className="w-3 h-3" />
                                    AI Diagnostic Capabilities
                                </span>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    What BugSense Detects &amp; Solves
                                </h2>
                            </div>
                            <Badge variant="emerald" className="gap-2 py-1.5 px-3.5 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                                Engine Active &amp; Ready
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Root Cause */}
                            <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:-translate-y-1 transition-all duration-200 shadow-lg">
                                <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div className="text-base font-bold text-white">Root Cause Isolation</div>
                                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    Instantly traces undefined properties, off-by-one errors, null pointer dereferences, and async race conditions across 13+ languages.
                                </div>
                            </div>

                            {/* Code Patches */}
                            <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-200 shadow-lg">
                                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                                    <Code2 className="w-5 h-5" />
                                </div>
                                <div className="text-base font-bold text-white">Automated Code Patches</div>
                                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    Synthesizes clean, production-ready code replacements with syntax highlighting, explanatory comments, and 1-click copy.
                                </div>
                            </div>

                            {/* Defensive Architecture */}
                            <div className="flex flex-col gap-3.5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 shadow-lg">
                                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="text-base font-bold text-white">Defensive Architecture</div>
                                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    Explains the underlying architectural logic so you avoid repeating errors, safeguarding codebases against silent regressions.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result Output */}
                {currentResult && currentRequest && !isLoading && !error && (
                    <div className="w-full">
                        <AnalysisResult
                            result={currentResult}
                            request={currentRequest}
                            createdAt={currentTime}
                            onSave={handleSave}
                            isSaved={isSaved}
                        />
                    </div>
                )}
            </section>
        </div>
    );
}

export default function AnalyzerPage() {
    return (
        <AppShell
            title="Bug Analyzer Studio"
            subtitle="Dual-pane diagnostic workbench powered by BugSense AI"
            navItems={NAV_ITEMS}
        >
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-400">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                    <p className="text-sm font-medium">Loading diagnostic studio...</p>
                </div>
            }>
                <AnalyzerContent />
            </Suspense>
        </AppShell>
    );
}
