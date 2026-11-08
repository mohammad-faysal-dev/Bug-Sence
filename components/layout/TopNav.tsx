"use client";

import { Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TopNavProps {
    title: string;
    subtitle?: string;
    onMenuClick?: () => void;
    actions?: React.ReactNode;
}

export function TopNav({ title, subtitle, onMenuClick, actions }: TopNavProps) {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 md:px-10 bg-slate-950/80 backdrop-blur-md border-b border-sky-500/15">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden text-slate-300 hover:text-white"
                    onClick={onMenuClick}
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-base font-bold text-white tracking-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                    <Badge variant="cyan" className="gap-2 py-1 px-3 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                        AI Diagnostic Engine Online
                    </Badge>
                </div>
                {actions && <div>{actions}</div>}
            </div>
        </header>
    );
}
