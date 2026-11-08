import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
}

export const LANGUAGE_LABELS: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    csharp: "C#",
    php: "PHP",
    ruby: "Ruby",
    go: "Go",
    rust: "Rust",
    swift: "Swift",
    kotlin: "Kotlin",
    other: "Other",
};

export const SEVERITY_CONFIG = {
    low: { label: "Low", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    high: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};
