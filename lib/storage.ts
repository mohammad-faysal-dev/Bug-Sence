import { AnalysisRecord } from "./types";

const STORAGE_KEY = "bugsense_history";

export function getHistory(): AnalysisRecord[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const records = JSON.parse(stored) as AnalysisRecord[];
        // Automatically purge any leftover hardcoded demo seed records
        const realRecords = records.filter((r) => !r.id.startsWith("seed-"));
        if (realRecords.length !== records.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(realRecords));
        }
        return realRecords;
    } catch {
        return [];
    }
}

export function saveAnalysis(record: AnalysisRecord): void {
    if (typeof window === "undefined") return;
    try {
        const existing = getHistory();
        // Avoid duplicate ID and keep latest 50 records
        const filtered = existing.filter((item) => item.id !== record.id);
        const updated = [record, ...filtered].slice(0, 50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("bugsense_history_updated"));
    } catch {
        console.error("Failed to save analysis to localStorage");
    }
}

export function deleteAnalysis(id: string): void {
    if (typeof window === "undefined") return;
    try {
        const existing = getHistory();
        const updated = existing.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("bugsense_history_updated"));
    } catch {
        console.error("Failed to delete analysis from localStorage");
    }
}

export function clearHistory(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        window.dispatchEvent(new Event("bugsense_history_updated"));
    } catch {
        console.error("Failed to clear history from localStorage");
    }
}
