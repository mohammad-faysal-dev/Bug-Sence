import Link from "next/link";
import {
  Search,
  Sparkles,
  Zap,
  Code2,
  CheckCircle2,
  Cpu,
  Layers,
  History,
  Terminal,
  ShieldAlert,
  Play,
  Regex as RegexIcon,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NAV_ITEMS } from "@/lib/nav-items";

const STATS = [
  {
    label: "Bugs Analyzed",
    value: "100k+",
    desc: "Powered by BugSense AI",
    icon: Search,
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
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/25",
    valueColor: "text-emerald-400",
    cardBorder: "border-emerald-500/30",
  },
];

const TOOLS = [
  {
    href: "/analyzer",
    title: "AI Bug Analyzer",
    desc: "Dissect cryptic exceptions, isolate architectural root causes, and synthesize verified code patches.",
    icon: Terminal,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    badge: "Core Engine",
  },
  {
    href: "/stack-lens",
    title: "Stack Lens (Demangler)",
    desc: "De-obfuscate raw terminal dumps, isolate user code from node_modules, and identify root culprit frames.",
    icon: Layers,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    badge: "New Feature",
  },
  {
    href: "/security",
    title: "Security Guard & OWASP",
    desc: "Detect SQL injection, XSS, hardcoded secrets, and unsafe eval() with automatic code hardening.",
    icon: ShieldAlert,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    badge: "New Feature",
  },
  {
    href: "/sandbox",
    title: "Live Code Sandbox",
    desc: "Safely execute JavaScript and TypeScript snippets in-browser with live console capture and timing.",
    icon: Play,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badge: "Interactive",
  },
  {
    href: "/regex",
    title: "Regex Studio & ReDoS",
    desc: "Debug regular expressions in real-time and detect catastrophic backtracking hazards before deploy.",
    icon: RegexIcon,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    badge: "New Feature",
  },
  {
    href: "/history",
    title: "Diagnostic Archive & Audit",
    desc: "Search, filter, and inspect past resolutions, triage incidents, and export team runbook reports.",
    icon: History,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    badge: "Knowledge Base",
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
      subtitle="Welcome to BugSense — your intelligent developer diagnostics and code intelligence suite"
      navItems={NAV_ITEMS}
    >
      <div className="flex flex-col gap-8 sm:gap-12 md:gap-14 w-full">

        {/* ── HERO SECTION ── */}
        <section className="relative rounded-2xl sm:rounded-3xl border border-sky-500/25 bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 p-5 sm:p-8 md:p-12 lg:p-14 shadow-2xl shadow-blue-950/40 overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
              <div>
                <Badge variant="cyan" className="gap-2 py-1 px-3 sm:px-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Next-Gen AI Code Diagnostics Suite
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Fix Bugs Faster with{" "}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  BugSense AI
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-xl">
                An enterprise-grade developer workbench to decode complex stack traces, audit security flaws,
                verify fixes in live sandboxes, and synthesize verified patches in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link href="/analyzer" className="w-full sm:w-auto">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto gap-2 font-semibold shadow-lg shadow-sky-500/25 justify-center">
                    <Search className="w-4 h-4" />
                    Start Analyzing
                  </Button>
                </Link>
                <Link href="/stack-lens" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-slate-700 hover:border-sky-500/40 text-slate-200 justify-center">
                    <Layers className="w-4 h-4 text-sky-400" />
                    Explore Stack Lens
                  </Button>
                </Link>
              </div>

              {/* Sample Quick-Picks */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Try a sample crash:</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_BUGS.map((sample) => (
                    <Link
                      key={sample.label}
                      href={`/analyzer?sample=${encodeURIComponent(sample.label)}&lang=${sample.lang}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300 bg-slate-900/90 border border-slate-700/80 hover:border-sky-500/50 hover:text-white transition-all"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span className="truncate max-w-[220px]">{sample.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-sky-500/30 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-sm space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-[11px] text-slate-400">bugsense.engine</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <p className="text-rose-400 font-bold">&gt; TypeError: Cannot read properties of undefined</p>
                  <p className="text-slate-500">  at renderUserList (UserProfile.tsx:18:24)</p>
                  <p className="text-sky-300">&gt; Root Cause: users array undefined on initial render</p>
                  <p className="text-emerald-400">&gt; Fix: users?.map(...) ?? [] applied</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Severity: High</span>
                  <span className="text-emerald-400 font-bold">Latency: 420ms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DEVELOPER DIAGNOSTIC SUITE ── */}
        <section className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Developer Diagnostic Suite
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Complete toolkit engineered for rapid debugging, security hardening, and code verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex flex-col justify-between gap-4 p-5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-sky-500/40 hover:-translate-y-1 transition-all duration-200 shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${tool.bg} ${tool.color} border ${tool.border}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-mono ${tool.color} ${tool.border}`}>
                      {tool.badge}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="text-base font-bold text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
                      <span>{tool.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-sky-400" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{tool.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── STATS GRID ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`flex items-start gap-4 p-4.5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-950 via-[#07132e] to-slate-950 border ${stat.cardBorder} shadow-xl hover:-translate-y-1 transition-all duration-200`}
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.iconBg} ${stat.iconBorder} ${stat.valueColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${stat.valueColor}`}>
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">{stat.label}</span>
                  <span className="text-[11px] sm:text-xs text-slate-400 leading-snug">{stat.desc}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── HOW BUGSENSE WORKS ── */}
        <section className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              How BugSense Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              A seamless 3-stage intelligence pipeline built for modern engineering teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col justify-between gap-5 p-5 sm:p-7 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-sky-500/35 hover:-translate-y-1 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-mono font-bold border ${feature.stepColor}`}>
                      STEP {feature.step}
                    </span>
                    <div className={`p-2 sm:p-2.5 rounded-xl ${feature.iconBg} ${feature.iconColor} border border-slate-800`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="text-sm sm:text-base font-bold text-white">{feature.title}</div>
                    <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">{feature.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="relative rounded-2xl sm:rounded-3xl border border-sky-500/30 bg-gradient-to-r from-blue-950/80 via-slate-950 to-blue-950/80 p-6 sm:p-10 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2 text-center md:text-left">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Ready to debug smarter?</div>
            <div className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl">
              Paste your error message and get an AI-powered verified solution in seconds.
            </div>
          </div>
          <Link href="/analyzer" className="relative z-10 w-full sm:w-auto shrink-0">
            <Button variant="gradient" size="lg" className="w-full sm:w-auto gap-2 font-semibold shadow-xl shadow-sky-500/25 px-6 sm:px-8 justify-center">
              <Zap className="w-4 h-4" />
              Analyze a Bug Now
            </Button>
          </Link>
        </section>

      </div>
    </AppShell>
  );
}
