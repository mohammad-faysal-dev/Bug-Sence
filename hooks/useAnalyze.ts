"use client";

import { useState } from "react";
import { AnalysisRequest, BugAnalysis, ApiResponse } from "@/lib/types";
import { getSettings } from "@/lib/settings";

interface UseAnalyzeReturn {
    analyze: (request: AnalysisRequest) => Promise<BugAnalysis | null>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

export function useAnalyze(): UseAnalyzeReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = async (request: AnalysisRequest): Promise<BugAnalysis | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const settings = getSettings();
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (settings.customApiKey?.trim()) {
                headers["x-groq-api-key"] = settings.customApiKey.trim();
            }
            if (settings.selectedModel) {
                headers["x-groq-model"] = settings.selectedModel;
            }
            if (settings.useOfflineEngine) {
                headers["x-use-offline"] = "true";
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers,
                body: JSON.stringify(request),
            });

            const json = (await response.json()) as ApiResponse<BugAnalysis>;

            if (!response.ok || json.error) {
                setError(json.error || "Analysis failed. Please try again.");
                return null;
            }

            if (!json.data) {
                setError("No analysis data received.");
                return null;
            }

            return json.data;
        } catch {
            setError("Network error. Please check your connection and try again.");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return { analyze, isLoading, error, clearError };
}
