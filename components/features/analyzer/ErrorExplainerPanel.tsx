"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  FileX,
  Wifi,
  ShieldX,
  MemoryStick,
  Braces,
  Sparkles,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorPattern {
  id: string;
  title: string;
  description: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  iconBgClass: string;
  iconColorClass: string;
  icon: React.ReactNode;
  fixes: string[];
}

function detectPatterns(text: string): ErrorPattern[] {
  const lower = text.toLowerCase();
  const patterns: ErrorPattern[] = [];

  if (lower.includes("undefined") || lower.includes("null")) {
    patterns.push({
      id: "null-ref",
      title: "Null / Undefined Reference",
      description: "A variable or property is being accessed but holds no value.",
      colorClass: "text-amber-300",
      borderClass: "border-amber-500/30",
      bgClass: "bg-amber-500/5",
      iconBgClass: "bg-amber-500/15",
      iconColorClass: "text-amber-400",
      icon: <AlertTriangle className="w-4 h-4" />,
      fixes: [
        "Add a null/undefined guard before accessing the property",
        "Use optional chaining (?.) and nullish coalescing (??)",
        "Ensure async data has loaded before rendering dependent UI",
      ],
    });
  }

  if (lower.includes("enoent") || lower.includes("no such file")) {
    patterns.push({
      id: "file-not-found",
      title: "File Not Found",
      description: "The file or directory the process tried to open does not exist.",
      colorClass: "text-orange-300",
      borderClass: "border-orange-500/30",
      bgClass: "bg-orange-500/5",
      iconBgClass: "bg-orange-500/15",
      iconColorClass: "text-orange-400",
      icon: <FileX className="w-4 h-4" />,
      fixes: [
        "Verify the file path is correct and uses the right separators",
        "Check that the file exists at runtime (not just at build time)",
        "Use path.resolve() / __dirname to construct absolute paths",
      ],
    });
  }

  if (lower.includes("econnrefused") || lower.includes("timeout")) {
    patterns.push({
      id: "network",
      title: "Network / Connection Issue",
      description: "A network request was refused or timed out before completing.",
      colorClass: "text-blue-300",
      borderClass: "border-blue-500/30",
      bgClass: "bg-blue-500/5",
      iconBgClass: "bg-blue-500/15",
      iconColorClass: "text-blue-400",
      icon: <Wifi className="w-4 h-4" />,
      fixes: [
        "Confirm the target service is running and reachable",
        "Check firewall rules, proxy settings, or VPN configuration",
        "Increase request timeout or add a retry/backoff strategy",
      ],
    });
  }

  if (lower.includes("permission denied") || lower.includes("eacces")) {
    patterns.push({
      id: "permission",
      title: "Permission Error",
      description: "The process lacks the OS-level permissions to perform the operation.",
      colorClass: "text-rose-300",
      borderClass: "border-rose-500/30",
      bgClass: "bg-rose-500/5",
      iconBgClass: "bg-rose-500/15",
      iconColorClass: "text-rose-400",
      icon: <ShieldX className="w-4 h-4" />,
      fixes: [
        "Run the process with the required privileges (sudo / admin)",
        "Fix file/directory ownership or mode (chmod / icacls)",
        "Move the target path to a location the current user can write",
      ],
    });
  }

  if (lower.includes("out of memory") || lower.includes("heap")) {
    patterns.push({
      id: "memory",
      title: "Memory Issue",
      description: "The process exhausted available heap memory.",
      colorClass: "text-purple-300",
      borderClass: "border-purple-500/30",
      bgClass: "bg-purple-500/5",
      iconBgClass: "bg-purple-500/15",
      iconColorClass: "text-purple-400",
      icon: <MemoryStick className="w-4 h-4" />,
      fixes: [
        "Increase heap size (--max-old-space-size for Node.js)",
        "Profile for memory leaks — look for objects retaining large arrays",
        "Process large datasets in streams or batches instead of loading all at once",
      ],
    });
  }

  if (lower.includes("syntax error") || text.includes("SyntaxError")) {
    patterns.push({
      id: "syntax",
      title: "Syntax Error",
      description: "The parser encountered code it could not interpret.",
      colorClass: "text-amber-300",
      borderClass: "border-amber-500/30",
      bgClass: "bg-amber-500/5",
      iconBgClass: "bg-amber-500/15",
      iconColorClass: "text-amber-400",
      icon: <Braces className="w-4 h-4" />,
      fixes: [
        "Check for missing or mismatched brackets, parentheses, or quotes",
        "Verify the file is saved with the correct encoding (UTF-8)",
        "Lint with ESLint / Prettier to pinpoint the exact token",
      ],
    });
  }

  return patterns;
}

interface ErrorExplainerPanelProps {
  errorText: string;
}

export function ErrorExplainerPanel({ errorText }: ErrorExplainerPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const patterns = useMemo(() => detectPatterns(errorText), [errorText]);
  const hasText = errorText.trim().length > 0;

  if (!hasText) return null;

  return (
    <div
      className={cn(
        "rounded-xl border bg-slate-950/80 overflow-hidden transition-all duration-300",
        "border-sky-500/20 shadow-lg shadow-sky-500/5",
        "animate-fade-in"
      )}
      style={{ animationDuration: "250ms" }}
    >
      {/* Panel header / toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/70 hover:bg-slate-900 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
          <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
          <span>Smart Error Explainer</span>
          {patterns.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
              {patterns.length} hint{patterns.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
            collapsed && "rotate-180"
          )}
        />
      </button>

      {/* Panel body */}
      {!collapsed && (
        <div className="p-3.5 flex flex-col gap-2.5">
          {patterns.length === 0 ? (
            /* Default placeholder */
            <div className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
              <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
              <p className="text-xs text-slate-400 italic">
                AI will analyze this error… keep typing for instant pattern hints.
              </p>
            </div>
          ) : (
            patterns.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "rounded-lg border p-3 flex flex-col gap-2 transition-all",
                  p.borderClass,
                  p.bgClass,
                  "animate-fade-in"
                )}
                style={{ animationDuration: "200ms" }}
              >
                {/* Card header */}
                <div className="flex items-center gap-2">
                  <span className={cn("p-1 rounded-md shrink-0", p.iconBgClass, p.iconColorClass)}>
                    {p.icon}
                  </span>
                  <span className={cn("text-xs font-bold", p.colorClass)}>{p.title}</span>
                </div>
                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                {/* Fixes */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Common Fixes:
                  </span>
                  <ul className="mt-1 flex flex-col gap-1">
                    {p.fixes.map((fix, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <span className={cn("mt-0.5 w-1 h-1 rounded-full shrink-0", p.iconColorClass)} />
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in var(--duration, 250ms) ease both;
        }
      `}</style>
    </div>
  );
}
