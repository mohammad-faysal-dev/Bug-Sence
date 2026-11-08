import { NextRequest, NextResponse } from "next/server";
import { AnalysisRequest, BugAnalysis } from "@/lib/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildSystemPrompt(): string {
  return `You are BugSense AI — an elite principal engineer and automated debugging engine.
Your mission is to parse error messages, compiler outputs, runtime exceptions, and stack traces across any programming language.
You isolate the exact root cause, provide deep technical explanation, clear step-by-step resolution instructions, and write production-ready corrected code.

You MUST respond strictly with a valid JSON object (no markdown wrapping, no extra keys, valid JSON only) with this exact schema:
{
  "errorSummary": "Concise 1-sentence diagnostic summary of the error",
  "possibleCause": "The definitive root cause of the fault",
  "explanation": "Detailed technical explanation of why this happens (2-4 clear sentences)",
  "suggestedSolution": "Numbered step-by-step instructions for permanently fixing the issue",
  "codeExample": "Copy-pasteable production-ready corrected code fix with comments explaining the changes",
  "severity": "low" | "medium" | "high" | "critical"
}

Severity Guidelines:
- low: Cosmetic or minor non-breaking issue
- medium: Functional issue or warning that impairs logic but doesn't crash the entire system
- high: Serious exception or runtime crash halting execution
- critical: Memory corruption, deadlock, data loss risk, or security vulnerability`;
}

function buildUserMessage(request: AnalysisRequest): string {
  const parts = [
    `Programming Language: ${request.language}`,
    `Error Message / Stack Trace:\n${request.errorMessage.trim()}`,
  ];

  if (request.codeSnippet?.trim()) {
    parts.push(`Code Context:\n\`\`\`${request.language}\n${request.codeSnippet.trim()}\n\`\`\``);
  }

  parts.push("Analyze this error thoroughly and return the structured JSON diagnostic report.");
  return parts.join("\n\n");
}

export async function POST(request: NextRequest) {
  let body: AnalysisRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request payload." },
      { status: 400 }
    );
  }

  if (!body.errorMessage?.trim()) {
    return NextResponse.json(
      { error: "Please enter an error message or stack trace to diagnose." },
      { status: 400 }
    );
  }

  if (!body.language) {
    return NextResponse.json(
      { error: "Programming language selection is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey === "gsk_your_groq_api_key_here") {
    return NextResponse.json(
      { error: "Groq API Key is not configured. Please set GROQ_API_KEY in .env.local." },
      { status: 500 }
    );
  }

  // Model selection: primary model is openai/gpt-oss-120b, with fallback to openai/gpt-oss-20b
  const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
  let lastError = "Unable to connect to Groq AI engine.";

  for (const model of models) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            { role: "user", content: buildUserMessage(body) },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          (errorData as { error?: { message?: string } })?.error?.message ||
          `HTTP ${response.status}`;
        lastError = `Groq API (${model}): ${message}`;
        // Try fallback model if model_not_found or rate limited
        continue;
      }

      interface GroqChatCompletion {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      }

      const data = (await response.json()) as GroqChatCompletion;
      const rawContent = data?.choices?.[0]?.message?.content;

      if (!rawContent) {
        lastError = "Empty response received from Groq AI engine.";
        continue;
      }

      // Clean potential markdown fencing
      const cleanJson = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed: BugAnalysis;
      try {
        parsed = JSON.parse(cleanJson) as BugAnalysis;
      } catch {
        lastError = "AI engine returned invalid JSON format.";
        continue;
      }

      // Validate essential diagnostic keys
      if (!parsed.errorSummary || !parsed.possibleCause || !parsed.suggestedSolution) {
        lastError = "Incomplete diagnostic report returned from AI engine.";
        continue;
      }

      // Normalize severity
      const validSeverities = ["low", "medium", "high", "critical"] as const;
      const parsedSeverity = (parsed.severity || "medium").toLowerCase();
      const severity = (
        validSeverities.includes(parsedSeverity as (typeof validSeverities)[number])
          ? parsedSeverity
          : "medium"
      ) as BugAnalysis["severity"];

      const result: BugAnalysis = {
        errorSummary: parsed.errorSummary,
        possibleCause: parsed.possibleCause,
        explanation: parsed.explanation || parsed.possibleCause,
        suggestedSolution: parsed.suggestedSolution,
        codeExample: parsed.codeExample || "",
        severity,
      };

      return NextResponse.json({ data: result });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Network error contacting Groq.";
    }
  }

  return NextResponse.json(
    { error: `AI Diagnostic Failed: ${lastError}` },
    { status: 500 }
  );
}
