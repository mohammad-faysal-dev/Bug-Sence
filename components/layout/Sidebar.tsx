"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    items: NavItem[];
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ items, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 bottom-0 left-0 w-64 bg-slate-950/95 border-r border-sky-500/20 backdrop-blur-xl z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-sky-500/15">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                        <Bug className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-white tracking-tight">BugSense</span>
                        <Badge variant="cyan" className="text-[10px] px-1.5 py-0 font-mono">
                            AI
                        </Badge>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto">
                    <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Platform
                    </div>
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                                    isActive
                                        ? "bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30 shadow-sm shadow-sky-950"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                                )}
                                onClick={onClose}
                            >
                                <span className={cn("transition-colors", isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200")}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-sky-500/15 bg-slate-950/60 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                        <span>BugSense Neural Core</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                        v2.5.0 • Enterprise Ready
                    </p>
                </div>
            </aside>
        </>
    );
}
