"use client";

import Link from "next/link";
import {
  Search,
  Code2,
  Cpu,
  Zap,
  CheckCircle2,
  Sparkles,
  History,
  Terminal,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NAV_ITEMS } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATS = [
  {
    label: "Bugs Analyzed",
    value: "100k+",
    desc: "Powered by BugSense AI",
    icon: Search,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10",
    iconBorder: "border-sky-500/25",
    valueColor: "text-sky-400",
    cardBorder: "border-sky-500/30",
  },
  {
    label: "Languages Supported",
    value: "13+",
    desc: "JS, TS, Python, Go, Rust & more",
    icon: Code2,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/25",
    valueColor: "text-blue-400",
    cardBorder: "border-blue-500/30",
  },
  {
    label: "Diagnostic Engine",
    value: "Neural v2.5",
    desc: "Deep multi-stage reasoning",
    icon: Cpu,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    iconBorder: "border-purple-500/25",
    valueColor: "text-purple-400",
    cardBorder: "border-purple-500/30",
  },
  {
    label: "Resolution Speed",
    value: "< 2.5s",
    desc: "Real-time intelligent analysis",
    icon: Zap,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/25",
    valueColor: "text-emerald-400",
    cardBorder: "border-emerald-500/30",
  },
];

const FEATURES = [
  {
    step: "01",
    icon: Terminal,
    title: "Instant Error Parsing",
    desc: "Paste raw terminal stack traces, console exceptions, or runtime crashes and receive immediate, structured diagnostics.",
    stepColor: "text-sky-400 border-sky-500/30",
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10",
  },
  {
    step: "02",
    icon: Cpu,
    title: "Deep Root Cause Isolation",
    desc: "Our neural reasoning engine dissects your code context to pinpoint exactly why and where the bug occurred.",
    stepColor: "text-blue-400 border-blue-500/30",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Production-Ready Solutions",
    desc: "Get actionable step-by-step resolution plans accompanied by copy-pasteable, verified code fixes.",
    stepColor: "text-emerald-400 border-emerald-500/30",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
];

const SAMPLE_BUGS = [
  { label: "TypeError: Cannot read properties of undefined", lang: "javascript" },
  { label: "KeyError: 'user_profile_id'", lang: "python" },
  { label: "runtime error: invalid memory address or nil pointer", lang: "go" },
];

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Welcome to BugSense — your intelligent debugging suite"
      navItems={NAV_ITEMS}
    >
      <div className="flex flex-col gap-12 sm:gap-14 w-full">

        {/* ── HERO SECTION ── */}
        <section className="relative rounded-3xl border border-sky-500/25 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 p-8 sm:p-12 lg:p-14 shadow-2xl shadow-blue-950/40 overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <Badge variant="cyan" className="gap-2 py-1 px-3.5 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Next-Gen AI Code Diagnostics
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Fix Bugs Faster with{" "}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  BugSense AI
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                BugSense leverages cutting-edge artificial intelligence to decode complex stack
                traces, isolate root causes, and generate production-ready fixes in seconds.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link href="/analyzer">
                  <Button variant="gradient" size="lg" className="gap-2 font-semibold shadow-lg shadow-sky-500/25">
                    <Search className="w-4 h-4" />
                    Start Analyzing
                  </Button>
                </Link>
                <Link href="/history">
                  <Button variant="outline" size="lg" className="gap-2">
                    <History className="w-4 h-4" />
                    View History
                  </Button>
                </Link>
              </div>

              {/* Quick sample bugs */}
              <div className="flex flex-col gap-2.5 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Quick Test Examples:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_BUGS.map((bug) => (
                    <Link
                      key={bug.label}
                      href={`/analyzer?sample=${encodeURIComponent(bug.label)}&lang=${bug.lang}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 bg-slate-900/80 border border-slate-700/80 hover:border-sky-500/50 hover:text-sky-300 hover:bg-slate-800/80 transition-all cursor-pointer"
                    >
                      <span className="text-sky-400">•</span>
                      {bug.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Terminal Mockup */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">diagnostics://live-preview</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider">
                    LIVE SCAN
                  </span>
                </div>
                <div className="p-5 font-mono text-xs flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400 font-bold">$</span>
                    <span className="text-slate-200">bugsense analyze --trace error.log</span>
                  </div>
                  <div className="text-rose-400 font-medium">
                    ✗ TypeError: Cannot read properties of undefined (reading &apos;map&apos;)
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="text-emerald-400 font-medium">
                    ✓ Root Cause: data is undefined prior to async fetch resolution
                  </div>
                  <div className="text-sky-300">
                    ↳ Fix Generated: Optional chaining &amp; fallback array added
                  </div>
                  <div className="p-3 rounded-lg bg-black/60 border border-slate-800 text-slate-200 mt-1">
                    <span className="text-sky-400 font-bold">const</span> items = data?.products ?? [];
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS GRID ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`flex items-start gap-4.5 p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border ${stat.cardBorder} shadow-xl hover:-translate-y-1 transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.iconBg} ${stat.iconBorder} ${stat.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${stat.valueColor}`}>
                    {stat.value}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{stat.label}</span>
                  <span className="text-xs text-slate-400 leading-snug">{stat.desc}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── HOW BUGSENSE WORKS ── */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              How BugSense Works
            </h3>
            <p className="text-sm text-slate-400">
              A seamless 3-stage intelligence pipeline built for modern engineering teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col justify-between gap-6 p-7 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-sky-500/35 hover:-translate-y-1 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${feature.stepColor}`}>
                      STEP {feature.step}
                    </span>
                    <div className={`p-2.5 rounded-xl ${feature.iconBg} ${feature.iconColor} border border-slate-800`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-base font-bold text-white">{feature.title}</div>
                    <div className="text-sm text-slate-300 leading-relaxed">{feature.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="relative rounded-3xl border border-sky-500/30 bg-gradient-to-r from-blue-950/80 via-slate-950 to-blue-950/80 p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2 text-center md:text-left">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">Ready to debug smarter?</div>
            <div className="text-sm sm:text-base text-slate-300 max-w-xl">
              Paste your error message and get an AI-powered verified solution in seconds.
            </div>
          </div>
          <Link href="/analyzer" className="relative z-10 shrink-0">
            <Button variant="gradient" size="lg" className="gap-2 font-semibold shadow-xl shadow-sky-500/25 px-8">
              <Zap className="w-4 h-4" />
              Analyze a Bug Now
            </Button>
          </Link>
        </section>

      </div>
    </AppShell>
  );
}
