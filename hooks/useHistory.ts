"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalysisRecord } from "@/lib/types";
import { getHistory, saveAnalysis, deleteAnalysis, clearHistory } from "@/lib/storage";

interface UseHistoryReturn {
    history: AnalysisRecord[];
    addRecord: (record: AnalysisRecord) => void;
    removeRecord: (id: string) => void;
    clearAll: () => void;
    isLoaded: boolean;
}

export function useHistory(): UseHistoryReturn {
    const [history, setHistory] = useState<AnalysisRecord[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const refresh = useCallback(() => {
        setHistory(getHistory());
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refresh();

        const handleUpdate = () => {
            refresh();
        };

        window.addEventListener("storage", handleUpdate);
        window.addEventListener("bugsense_history_updated", handleUpdate);

        return () => {
            window.removeEventListener("storage", handleUpdate);
            window.removeEventListener("bugsense_history_updated", handleUpdate);
        };
    }, [refresh]);

    const addRecord = useCallback((record: AnalysisRecord) => {
        saveAnalysis(record);
        setHistory((prev) => [record, ...prev.filter((r) => r.id !== record.id)].slice(0, 50));
    }, []);

    const removeRecord = useCallback((id: string) => {
        deleteAnalysis(id);
        setHistory((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        clearHistory();
        setHistory([]);
    }, []);

    return { history, addRecord, removeRecord, clearAll, isLoaded };
}
