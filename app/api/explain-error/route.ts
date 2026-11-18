import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT =
  "You are a quick error classifier. Given a raw error message, return JSON: { briefExplanation: string (1 sentence), detectedLanguage: string (programming language name), confidence: 'high'|'medium'|'low' }. No markdown, pure JSON.";

interface ExplainErrorResponse {
  briefExplanation: string;
  detectedLanguage: string;
  confidence: "high" | "medium" | "low";
}

function detectLanguageFallback(errorText: string): ExplainErrorResponse {
  const text = errorText.toLowerCase();

  // Language pattern detection
  if (
    text.includes("nullpointerexception") ||
    text.includes("java.lang") ||
    text.includes("java.io") ||
    text.includes("java.util") ||
    text.includes("classnotfoundexception") ||
    text.includes("arrayindexoutofboundsexception")
  ) {
    return {
      briefExplanation:
        "A Java runtime exception occurred, likely due to a null reference or missing class.",
      detectedLanguage: "Java",
      confidence: "high",
    };
  }

  if (
    text.includes("panic:") ||
    text.includes("goroutine") ||
    text.includes("runtime error: invalid memory address or nil pointer") ||
    (text.includes("go/") && text.includes(".go:"))
  ) {
    return {
      briefExplanation:
        "A Go runtime panic occurred, possibly due to a nil pointer dereference or out-of-bounds access.",
      detectedLanguage: "Go",
      confidence: "high",
    };
  }

  if (
    text.includes("syntaxerror") ||
    text.includes("referenceerror") ||
    text.includes("rangeerror") ||
    text.includes("cannot read propert") ||
    text.includes("is not a function") ||
    text.includes("is not defined") ||
    text.includes(".js:") ||
    text.includes(".jsx:") ||
    text.includes(".tsx:")
  ) {
    return {
      briefExplanation:
        "A JavaScript/TypeScript runtime error occurred, often due to accessing undefined values or incorrect types.",
      detectedLanguage: "JavaScript",
      confidence: text.includes(".tsx:") || text.includes(".ts:") ? "high" : "medium",
    };
  }

  if (
    text.includes("traceback (most recent call last)") ||
    text.includes("keyerror") ||
    text.includes("importerror") ||
    text.includes("modulenotfounderror") ||
    text.includes("indentationerror") ||
    text.includes("attributeerror") ||
    text.includes(".py:")
  ) {
    return {
      briefExplanation:
        "A Python exception occurred, likely due to a missing key, bad import, or attribute access on None.",
      detectedLanguage: "Python",
      confidence: "high",
    };
  }

  if (
    text.includes("thread") ||
    text.includes("fatal error:") ||
    text.includes("segmentation fault") ||
    text.includes("core dumped") ||
    text.includes("undefined reference to") ||
    text.includes(".cpp:") ||
    text.includes(".c:")
  ) {
    return {
      briefExplanation:
        "A C/C++ fatal error occurred, possibly due to a segmentation fault, undefined reference, or memory issue.",
      detectedLanguage: "C/C++",
      confidence: "medium",
    };
  }

  if (
    text.includes("system.") ||
    text.includes("cannot implicitly convert") ||
    text.includes("cs0") ||
    text.includes(".cs:")
  ) {
    return {
      briefExplanation:
        "A C# compilation or runtime error occurred, often related to type mismatch or missing namespace.",
      detectedLanguage: "C#",
      confidence: "medium",
    };
  }

  if (text.includes("typeerror") || text.includes("valueerror") || text.includes("oserror")) {
    // Could be Python or JS; lean Python if valueerror/oserror, JS if typeerror without traceback
    const isPythonLikely =
      text.includes("valueerror") || text.includes("oserror") || text.includes("typeerror: ") && !text.includes("cannot");
    return {
      briefExplanation:
        "A runtime error occurred, likely a type mismatch or invalid value passed to a function.",
      detectedLanguage: isPythonLikely ? "Python" : "JavaScript",
      confidence: "low",
    };
  }

  if (
    text.includes("thread '") ||
    text.includes("called `option::unwrap()`") ||
    text.includes("called `result::unwrap()`") ||
    text.includes(".rs:")
  ) {
    return {
      briefExplanation:
        "A Rust panic occurred, likely due to an unwrap on a None or Err value.",
      detectedLanguage: "Rust",
      confidence: "high",
    };
  }

  if (text.includes("php") || text.includes("fatal error") && text.includes("on line")) {
    return {
      briefExplanation:
        "A PHP fatal error occurred, likely due to an undefined function, variable, or syntax issue.",
      detectedLanguage: "PHP",
      confidence: "medium",
    };
  }

  if (text.includes("ruby") || text.includes("nomethoderror") || text.includes(".rb:")) {
    return {
      briefExplanation:
        "A Ruby error occurred, possibly due to calling a method on nil or an undefined constant.",
      detectedLanguage: "Ruby",
      confidence: "high",
    };
  }

  // Generic fallback
  return {
    briefExplanation:
      "An error was detected. Paste the full stack trace for a more accurate analysis.",
    detectedLanguage: "Unknown",
    confidence: "low",
  };
}

interface GroqChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  let body: { errorText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }

  if (!body.errorText?.trim()) {
    return NextResponse.json(
      { error: "errorText is required and must not be empty." },
      { status: 400 }
    );
  }

  const errorText = body.errorText.trim();

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey === "gsk_your_groq_api_key_here") {
    // Smart fallback: pattern-based detection
    const fallback = detectLanguageFallback(errorText);
    return NextResponse.json({ data: fallback });
  }

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
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: errorText },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 256,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          (errorData as { error?: { message?: string } })?.error?.message ||
          `HTTP ${response.status}`;
        lastError = `Groq API (${model}): ${message}`;
        continue;
      }

      const data = (await response.json()) as GroqChatCompletion;
      const rawContent = data?.choices?.[0]?.message?.content;

      if (!rawContent) {
        lastError = "Empty response received from Groq AI engine.";
        continue;
      }

      const cleanJson = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed: ExplainErrorResponse;
      try {
        parsed = JSON.parse(cleanJson) as ExplainErrorResponse;
      } catch {
        lastError = "AI engine returned invalid JSON format.";
        continue;
      }

      const validConfidence = ["high", "medium", "low"] as const;
      const confidence = validConfidence.includes(
        parsed.confidence as (typeof validConfidence)[number]
      )
        ? parsed.confidence
        : "low";

      return NextResponse.json({
        data: {
          briefExplanation: parsed.briefExplanation || "Unable to parse explanation.",
          detectedLanguage: parsed.detectedLanguage || "Unknown",
          confidence,
        },
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Network error contacting Groq.";
    }
  }

  // If Groq fails for any reason, return the smart fallback instead of an error
  const fallback = detectLanguageFallback(errorText);
  return NextResponse.json({ data: fallback });
}
