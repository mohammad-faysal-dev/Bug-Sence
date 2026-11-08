"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface AppShellProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    navItems: NavItem[];
    topNavActions?: React.ReactNode;
}

export function AppShell({
    children,
    title,
    subtitle,
    navItems,
    topNavActions,
}: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020817] text-slate-100 flex relative overflow-x-hidden">
            <Sidebar
                items={navItems}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
                <TopNav
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={() => setSidebarOpen((prev) => !prev)}
                    actions={topNavActions}
                />
                <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 max-w-[1680px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
