import { NextRequest, NextResponse } from "next/server";
import { runSecurityAudit } from "@/lib/security-scanner";
import { SecurityAuditResult, ProgrammingLanguage } from "@/lib/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildSecurityAuditPrompt(): string {
  return `You are a Principal Security Architect and Application Security Auditor.
Review the provided code for OWASP Top 10 vulnerabilities, security flaws, CWE issues, and logic errors.
You MUST respond strictly with valid JSON without markdown wrapping with this schema:
{
  "score": number (0-100),
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "summary": "1-2 sentence overall risk posture",
  "totalIssues": number,
  "criticalCount": number,
  "highCount": number,
  "mediumCount": number,
  "lowCount": number,
  "findings": [
    {
      "id": "finding-1",
      "title": "Title of vulnerability",
      "severity": "critical" | "high" | "medium" | "low",
      "cwe": "CWE-89",
      "line": 12,
      "description": "Why this is dangerous",
      "remediation": "How to fix it securely",
      "vulnerableSnippet": "bad code line",
      "secureSnippet": "hardened code line"
    }
  ],
  "recommendedFixCode": "Complete hardened version of the code"
}`;
}

export async function POST(request: NextRequest) {
  let body: { code: string; language?: ProgrammingLanguage };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.code?.trim()) {
    return NextResponse.json({ error: "Code snippet is required" }, { status: 400 });
  }

  // Fast static analysis baseline
  const heuristicResult = runSecurityAudit(body.code);

  const clientApiKey = request.headers.get("x-groq-api-key")?.trim();
  const clientModel = request.headers.get("x-groq-model")?.trim();
  const forceOffline = request.headers.get("x-use-offline") === "true";

  if (forceOffline || clientModel === "offline-heuristic") {
    return NextResponse.json({ data: heuristicResult });
  }

  const apiKey = clientApiKey || process.env.GROQ_API_KEY?.trim();

  if (apiKey && apiKey !== "gsk_your_groq_api_key_here") {
    try {
      const model = clientModel && clientModel !== "offline-heuristic" ? clientModel : "llama-3.3-70b-versatile";
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: buildSecurityAuditPrompt() },
            {
              role: "user",
              content: `Language: ${body.language || "javascript"}\n\nCode to audit:\n\`\`\`\n${body.code}\n\`\`\``,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const clean = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
          const parsed = JSON.parse(clean) as SecurityAuditResult;
          if (parsed && typeof parsed.score === "number" && Array.isArray(parsed.findings)) {
            return NextResponse.json({ data: parsed });
          }
        }
      }
    } catch {
      // Fallback to heuristic
    }
  }

  return NextResponse.json({ data: heuristicResult });
}
