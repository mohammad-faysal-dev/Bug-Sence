"use client";

import { useState } from "react";
import { AnalysisRequest, BugAnalysis, ApiResponse } from "@/lib/types";

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
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
