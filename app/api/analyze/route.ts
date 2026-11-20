import { NextRequest, NextResponse } from "next/server";
import { AnalysisRequest, BugAnalysis } from "@/lib/types";
import { findDemoSample } from "@/lib/demo-data";

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

function generateHeuristicDiagnostic(request: AnalysisRequest): BugAnalysis {
  const demoMatch = findDemoSample(request.errorMessage);
  if (demoMatch) return demoMatch;

  const err = request.errorMessage.toLowerCase();
  const lang = request.language;
  const snippet = request.codeSnippet || "";

  if (err.includes("cannot read properties of undefined") || err.includes("nullpointerexception") || err.includes("nil pointer")) {
    return {
      errorSummary: `Null / Undefined Pointer Exception in ${lang.toUpperCase()}`,
      possibleCause: "An attempt was made to access a property, method, or index on a variable that evaluates to null or undefined at runtime.",
      explanation: `In ${lang}, evaluating attributes on an uninitialized reference causes execution to halt abruptly. This commonly occurs during asynchronous state updates, unhandled API responses, or missing parameter defaults.`,
      suggestedSolution: "1. Introduce defensive optional chaining (e.g. data?.property) or default value fallbacks.\n2. Verify that asynchronous fetches resolve successfully before invoking member functions.\n3. Add assertion checks or TypeScript strictNullChecks in build configuration.",
      codeExample: `// Defensive resolution with safe chaining and default values\nconst safeAccess = (data) => {\n  if (!data) return null;\n  return data?.targetField ?? "Default Value";\n};`,
      severity: "high",
    };
  }

  if (err.includes("syntaxerror") || err.includes("unexpected token") || err.includes("parse error")) {
    return {
      errorSummary: `Syntax Parsing Failure in ${lang.toUpperCase()}`,
      possibleCause: "The code contains invalid syntax, missing closing brackets, unmatched quotation marks, or an unsupported language feature.",
      explanation: "The compiler or interpreter encountered a token that violates grammar rules. This prevents AST parsing and stops compilation before runtime execution.",
      suggestedSolution: "1. Inspect matching pairs of braces {}, parentheses (), and quotation marks.\n2. Ensure target language/transpiler version supports newly introduced syntax.\n3. Run an automated linter or syntax validator (e.g., eslint, prettier, or compiler check).",
      codeExample: snippet ? `// Verified balanced syntax\ntry {\n  // Ensure all brackets and quotes match\n} catch (err) {\n  console.error("Syntax error handled", err);\n}` : "// Correct syntax with proper closing brackets\nfunction example() {\n  return true;\n}",
      severity: "high",
    };
  }

  if (err.includes("cors") || err.includes("access-control-allow-origin")) {
    return {
      errorSummary: "Cross-Origin Resource Sharing (CORS) Policy Block",
      possibleCause: "The API endpoint does not include the requesting origin in its 'Access-Control-Allow-Origin' HTTP response header.",
      explanation: "Web browsers enforce the Same-Origin Policy (SOP). Cross-origin fetch or XMLHttpRequest calls fail if the server's preflight (OPTIONS) or actual response lacks appropriate CORS headers.",
      suggestedSolution: "1. Configure server-side CORS middleware to permit the client origin (e.g. cors({ origin: 'http://localhost:3000' })).\n2. For local testing, route requests through a reverse proxy or Next.js API route rewrite.\n3. Ensure necessary request headers (Authorization, Content-Type) are explicitly allowed.",
      codeExample: `// Express.js CORS configuration example\nconst cors = require('cors');\napp.use(cors({\n  origin: ['http://localhost:3000', 'https://yourdomain.com'],\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true\n}));`,
      severity: "medium",
    };
  }

  if (err.includes("keyerror") || err.includes("indexerror") || err.includes("out of bounds") || err.includes("rangeerror")) {
    return {
      errorSummary: `Key / Index Out of Bounds in ${lang.toUpperCase()}`,
      possibleCause: "Accessing a key or array index that does not exist in the collection.",
      explanation: "Attempting to retrieve an element beyond the allocated length of an array or querying an unmapped dictionary key causes boundary check exceptions.",
      suggestedSolution: "1. Check collection length or use safe lookup methods like dict.get(key, default) or array.at(index).\n2. Validate incoming payloads before subscript access.\n3. Guard loops against off-by-one errors (e.g. index <= length instead of index < length).",
      codeExample: `// Safe boundary check\nfunction getSafeItem(items, index) {\n  if (!Array.isArray(items) || index < 0 || index >= items.length) {\n    return null;\n  }\n  return items[index];\n}`,
      severity: "medium",
    };
  }

  // Generic intelligent diagnostic
  return {
    errorSummary: `Runtime Exception Encountered in ${lang.toUpperCase()}: ${request.errorMessage.slice(0, 80)}`,
    possibleCause: "The execution context encountered an unhandled exception or contract violation during runtime processing.",
    explanation: `The application failed when executing code corresponding to: "${request.errorMessage.slice(0, 100)}". This typically signifies unexpected input types, missing resources, or unhandled asynchronous exceptions.`,
    suggestedSolution: "1. Wrap the offending block in a structured try...catch / panic recovery handler.\n2. Log intermediate variable states before the crash to verify runtime types.\n3. Add defensive input validation before invoking external services or operations.",
    codeExample: snippet ? `// Hardened implementation\ntry {\n  // Guarded execution block\n} catch (error) {\n  console.error("Safely caught runtime error:", error);\n}` : `// Defensive error boundary\ntry {\n  // Operation\n} catch (err) {\n  // Fallback\n}`,
    severity: "medium",
  };
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

  // Check headers for client-provided settings
  const clientApiKey = request.headers.get("x-groq-api-key")?.trim();
  const clientModel = request.headers.get("x-groq-model")?.trim();
  const forceOffline = request.headers.get("x-use-offline") === "true";

  if (forceOffline || clientModel === "offline-heuristic") {
    const heuristicResult = generateHeuristicDiagnostic(body);
    return NextResponse.json({ data: heuristicResult });
  }

  const apiKey = clientApiKey || process.env.GROQ_API_KEY?.trim();

  // Models to try in priority order:
  const models = clientModel && clientModel !== "offline-heuristic"
    ? [clientModel, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    : ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];

  if (apiKey && apiKey !== "gsk_your_groq_api_key_here") {
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

        if (response.ok) {
          interface GroqChatCompletion {
            choices?: Array<{ message?: { content?: string } }>;
          }
          const data = (await response.json()) as GroqChatCompletion;
          const rawContent = data?.choices?.[0]?.message?.content;
          if (rawContent) {
            const cleanJson = rawContent
              .replace(/^```json\s*/i, "")
              .replace(/^```\s*/i, "")
              .replace(/\s*```$/i, "")
              .trim();

            const parsed = JSON.parse(cleanJson) as BugAnalysis;
            if (parsed.errorSummary && parsed.possibleCause && parsed.suggestedSolution) {
              const validSeverities = ["low", "medium", "high", "critical"] as const;
              const parsedSeverity = (parsed.severity || "medium").toLowerCase();
              const severity = (
                validSeverities.includes(parsedSeverity as (typeof validSeverities)[number])
                  ? parsedSeverity
                  : "medium"
              ) as BugAnalysis["severity"];

              return NextResponse.json({
                data: {
                  errorSummary: parsed.errorSummary,
                  possibleCause: parsed.possibleCause,
                  explanation: parsed.explanation || parsed.possibleCause,
                  suggestedSolution: parsed.suggestedSolution,
                  codeExample: parsed.codeExample || "",
                  severity,
                },
              });
            }
          }
        }
      } catch {
        // Continue to fallback
      }
    }
  }

  // Graceful fallback to heuristic diagnostic engine
  const fallbackResult = generateHeuristicDiagnostic(body);
  return NextResponse.json({ data: fallbackResult });
}
