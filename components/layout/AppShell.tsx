"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { NAV_ITEMS } from "@/lib/nav-items";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
}

interface AppShellProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    navItems?: NavItem[];
    items?: NavItem[];
    topNavActions?: React.ReactNode;
    actions?: React.ReactNode;
}

export function AppShell({
    children,
    title,
    subtitle,
    navItems,
    items,
    topNavActions,
    actions,
}: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const resolvedItems = navItems || items || NAV_ITEMS;
    const resolvedActions = topNavActions || actions;

    return (
        <div className="min-h-screen bg-[#020817] text-slate-100 flex relative overflow-x-hidden">
            <Sidebar
                items={resolvedItems}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
                <TopNav
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={() => setSidebarOpen((prev) => !prev)}
                    actions={resolvedActions}
                />
                <main className="flex-1 px-3 py-5 sm:px-6 sm:py-8 md:px-10 md:py-10 max-w-[1680px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
