"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { HistoryList } from "@/components/features/history/HistoryList";
import { HistoryDetail } from "@/components/features/history/HistoryDetail";
import { useHistory } from "@/hooks/useHistory";
import { AnalysisRecord } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/nav-items";

export default function HistoryPage() {
    const { history, removeRecord, clearAll, isLoaded } = useHistory();
    const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

    const handleSelect = (record: AnalysisRecord) => {
        setSelectedRecord(record);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleClearAll = () => {
        clearAll();
        setSelectedRecord(null);
    };

    const handleDelete = (id: string) => {
        removeRecord(id);
        if (selectedRecord?.id === id) {
            setSelectedRecord(null);
        }
    };

    return (
        <AppShell
            title="Analysis History Archive"
            subtitle="Search, audit, and inspect your saved AI bug resolutions and code patches"
            navItems={NAV_ITEMS}
            topNavActions={
                <Link
                    href="/analyzer"
                    id="new-analysis-btn"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 hover:brightness-110 transition-all duration-150 cursor-pointer"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Bug Analysis
                </Link>
            }
        >
            <div className="w-full max-w-[1680px] mx-auto pb-12">
                {!selectedRecord ? (
                    <HistoryList
                        history={history}
                        onDelete={handleDelete}
                        onClearAll={handleClearAll}
                        onSelect={handleSelect}
                        isLoaded={isLoaded}
                    />
                ) : (
                    <HistoryDetail
                        record={selectedRecord}
                        onBack={() => setSelectedRecord(null)}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </AppShell>
    );
}
