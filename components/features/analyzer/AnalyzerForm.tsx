"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Terminal,
  Code2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
  Zap,
  AlertCircle,
} from "lucide-react";
import { AnalysisRequest, ProgrammingLanguage } from "@/lib/types";
import { LANGUAGE_LABELS, cn } from "@/lib/utils";
import { DEMO_SAMPLES } from "@/lib/demo-data";

const LANGUAGES = Object.entries(LANGUAGE_LABELS) as [ProgrammingLanguage, string][];

interface AnalyzerFormProps {
    onSubmit: (request: AnalysisRequest) => void;
    isLoading: boolean;
}

export function AnalyzerForm({ onSubmit, isLoading }: AnalyzerFormProps) {
    const searchParams = useSearchParams();
    const sampleParam = searchParams.get("sample");
    const langParam = searchParams.get("lang") as ProgrammingLanguage | null;

    const [errorMessage, setErrorMessage] = useState(sampleParam || "");
    const [codeSnippet, setCodeSnippet] = useState("");
    const [language, setLanguage] = useState<ProgrammingLanguage>(
        langParam && LANGUAGE_LABELS[langParam] ? langParam : "javascript"
    );
    const [langOpen, setLangOpen] = useState(false);
    const [errors, setErrors] = useState<{ errorMessage?: string }>({});

    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        if (sampleParam) setErrorMessage(sampleParam);
        if (langParam && LANGUAGE_LABELS[langParam]) setLanguage(langParam);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [sampleParam, langParam]);

    const handleApplyPreset = (preset: typeof DEMO_SAMPLES[0]) => {
        setErrorMessage(preset.errorMessage);
        setCodeSnippet(preset.codeSnippet);
        setLanguage(preset.language);
        setErrors({});
    };

    const validate = (): boolean => {
        const newErrors: { errorMessage?: string } = {};
        if (!errorMessage.trim()) {
            newErrors.errorMessage = "Please enter an error message or stack trace to diagnose";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({ errorMessage: errorMessage.trim(), codeSnippet: codeSnippet.trim(), language });
    };

    const handleClear = () => {
        setErrorMessage("");
        setCodeSnippet("");
        setLanguage("javascript");
        setErrors({});
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 shadow-2xl overflow-hidden flex flex-col"
        >
            {/* ── TOOLBAR ── */}
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-900/90 border-b border-sky-500/20 flex-wrap">
                {/* Left controls */}
                <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
                    {/* Window dots */}
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500 block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-2 pr-4 sm:pr-5 border-r border-slate-700/80 text-xs font-bold text-white uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400 block" />
                        Diagnostic Studio
                    </div>

                    {/* Language selector dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setLangOpen((p) => !p)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-sky-500/50 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                        >
                            <span className="w-2 h-2 rounded-full bg-sky-400 block" />
                            {LANGUAGE_LABELS[language]}
                            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", langOpen && "rotate-180")} />
                        </button>
                        {langOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 py-1.5 overflow-hidden">
                                {LANGUAGES.map(([value, label]) => (
                                    <button
                                        type="button"
                                        key={value}
                                        className={cn(
                                            "flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left",
                                            language === value
                                                ? "bg-sky-500/15 text-sky-300 font-semibold"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        )}
                                        onClick={() => {
                                            setLanguage(value);
                                            setLangOpen(false);
                                        }}
                                    >
                                        <span>{label}</span>
                                        {language === value && <Check className="w-3.5 h-3.5 text-sky-400" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick sample presets */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3 h-3" />
                            SAMPLES:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {DEMO_SAMPLES.map((preset) => (
                                <button
                                    type="button"
                                    key={preset.id}
                                    className="px-2.5 py-1 rounded-full text-xs font-mono font-medium text-slate-300 bg-slate-900/60 border border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-sky-500/40 transition-all cursor-pointer"
                                    onClick={() => handleApplyPreset(preset)}
                                    title="Load instant demo sample"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2.5 ml-auto">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                        onClick={handleClear}
                        disabled={isLoading || (!errorMessage && !codeSnippet)}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        type="submit"
                        id="analyze-submit-button"
                        className="inline-flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Analyze Bug
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── DUAL PANE EDITOR ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-800/80">
                {/* Left Pane: Error Message */}
                <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-950/40">
                    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/60 border-b border-slate-800/80 text-xs font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/60 block" />
                            <Terminal className="w-3.5 h-3.5 text-rose-400" />
                            <span>Error Message or Stack Trace</span>
                            <span className="text-rose-400 font-bold">*</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            STDERR
                        </span>
                    </div>
                    <div className="p-5 flex flex-col gap-2 flex-1">
                        <textarea
                            id="error-message-input"
                            rows={9}
                            className={cn(
                                "w-full flex-1 rounded-xl border border-slate-800 bg-black/50 p-4 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 resize-y min-h-[240px] leading-relaxed transition-all",
                                errors.errorMessage && "border-rose-500/60 focus:border-rose-500"
                            )}
                            placeholder={"Paste your raw terminal error, exception stack trace, or compiler diagnostic message here...\n(e.g. Uncaught TypeError: Cannot read properties of undefined...)"}
                            value={errorMessage}
                            onChange={(e) => {
                                setErrorMessage(e.target.value);
                                if (errors.errorMessage) setErrors({});
                            }}
                            spellCheck={false}
                        />
                        {errors.errorMessage && (
                            <p className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mt-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.errorMessage}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Pane: Source Code Context */}
                <div className="flex flex-col bg-slate-950/20">
                    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/50 border-b border-slate-800/80 text-xs font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400 block" />
                            <Code2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>Relevant Source Code Context</span>
                            <span className="text-slate-500 text-[11px] font-normal">(optional)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            SOURCE
                        </span>
                    </div>
                    <div className="p-5 flex flex-col gap-2 flex-1">
                        <textarea
                            id="code-snippet-input"
                            rows={9}
                            className="w-full flex-1 rounded-xl border border-slate-800 bg-black/50 p-4 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 resize-y min-h-[240px] leading-relaxed transition-all"
                            placeholder={"// Paste the relevant lines of code surrounding where the error occurred:\nfunction processUserData(user) {\n  return user.profile.preferences;\n}"}
                            value={codeSnippet}
                            onChange={(e) => setCodeSnippet(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>

            {/* ── GUIDANCE FOOTER ── */}
            <div className="flex items-center gap-6 px-6 py-3.5 bg-slate-900/40 text-xs text-slate-400 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 block" />
                    <span>Include complete stack trace with line numbers for pinpoint accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 block" />
                    <span>Providing source code scope enables verified copy-paste fixes</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
                    <span>Select target programming language to match compiler version</span>
                </div>
            </div>
        </form>
    );
}
