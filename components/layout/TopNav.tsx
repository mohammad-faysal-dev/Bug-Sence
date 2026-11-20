"use client";

import { useState, useEffect } from "react";
import { Menu, Settings, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/features/settings/SettingsModal";
import { getSettings } from "@/lib/settings";

interface TopNavProps {
    title: string;
    subtitle?: string;
    onMenuClick?: () => void;
    actions?: React.ReactNode;
}

export function TopNav({ title, subtitle, onMenuClick, actions }: TopNavProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [modelLabel, setModelLabel] = useState("Llama 3.3");

    useEffect(() => {
        const update = () => {
            const s = getSettings();
            if (s.selectedModel === "llama-3.1-8b-instant") setModelLabel("Llama 3.1 8B");
            else if (s.selectedModel === "mixtral-8x7b-32768") setModelLabel("Mixtral 8x7B");
            else if (s.selectedModel === "offline-heuristic") setModelLabel("Offline Heuristic");
            else setModelLabel("Llama 3.3 70B");
        };
        update();
        window.addEventListener("bugsense_settings_updated", update);
        return () => window.removeEventListener("bugsense_settings_updated", update);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10 bg-slate-950/80 backdrop-blur-md border-b border-sky-500/15 gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Button
                        variant="outline"
                        size="icon"
                        className="md:hidden text-slate-300 hover:text-white shrink-0 h-9 w-9"
                        onClick={onMenuClick}
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate hidden sm:block">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="hidden lg:flex items-center gap-2">
                        <Badge variant="cyan" className="gap-2 py-1 px-3 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                            {modelLabel} Active
                        </Badge>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSettingsOpen(true)}
                        className="h-9 px-3 gap-1.5 text-xs border-slate-800 hover:border-sky-500/30 text-slate-300 hover:text-white bg-slate-900/60"
                        title="AI Engine Settings"
                    >
                        <Settings className="h-3.5 w-3.5 text-sky-400" />
                        <span className="hidden sm:inline">Settings</span>
                    </Button>

                    {actions && <div className="shrink-0">{actions}</div>}
                </div>
            </header>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}
