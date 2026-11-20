import { ExecutionResult } from "./types";

export interface SandboxSample {
  id: string;
  title: string;
  buggyCode: string;
  fixedCode: string;
  description: string;
}

export const SANDBOX_SAMPLES: SandboxSample[] = [
  {
    id: "array-map-undefined",
    title: "Array.prototype.map on Undefined",
    description: "Calling .map() on an uninitialized variable crashes the script with TypeError.",
    buggyCode: `// Simulating uninitialized API state
let userData;

console.log("Fetching user profiles...");
// Bug: userData is undefined!
const names = userData.map(u => u.name);
console.log("Processed names:", names);`,
    fixedCode: `// Defensive initialization with default array
let userData = [
  { id: 1, name: "Alice", role: "DevOps" },
  { id: 2, name: "Bob", role: "Frontend" }
];

console.log("Fetching user profiles...");
// Defensive chaining & fallback
const names = (userData || []).map(u => u?.name ?? "Anonymous");
console.log("Processed names:", names);`,
  },
  {
    id: "json-parse-crash",
    title: "Unsafe JSON.parse Crash",
    description: "Parsing invalid JSON string crashes without try/catch guard.",
    buggyCode: `const rawPayload = "{ name: 'Dev', age: }"; // Malformed JSON

console.log("Parsing payload...");
const data = JSON.parse(rawPayload);
console.log("Parsed result:", data);`,
    fixedCode: `const rawPayload = "{ name: 'Dev', age: }"; // Malformed JSON

console.log("Parsing payload defensively...");
function safeJsonParse(str, fallback = {}) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn("Recovered from JSON syntax error:", err.message);
    return fallback;
  }
}

const data = safeJsonParse(rawPayload, { name: "Guest", valid: false });
console.log("Safely handled data:", data);`,
  },
  {
    id: "async-promise-race",
    title: "Missing Await in Async Pipeline",
    description: "Returning promise without awaiting causes Promise object to be printed rather than resolved value.",
    buggyCode: `async function fetchMetrics() {
  return new Promise(resolve => setTimeout(() => resolve({ cpu: "14%", ram: "4.2GB" }), 100));
}

function displayDashboard() {
  const stats = fetchMetrics(); // Bug: forgot 'await'!
  console.log("Dashboard Metrics:", stats);
  console.log("CPU Load:", stats.cpu); // undefined
}

displayDashboard();`,
    fixedCode: `async function fetchMetrics() {
  return new Promise(resolve => setTimeout(() => resolve({ cpu: "14%", ram: "4.2GB" }), 100));
}

async function displayDashboard() {
  const stats = await fetchMetrics(); // Correct: properly awaited
  console.log("Dashboard Metrics:", stats);
  console.log("CPU Load:", stats.cpu); // "14%"
}

displayDashboard();`,
  },
];

export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const logs: string[] = [];
  const start = performance.now();

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  const stringifyArg = (arg: unknown): string => {
    if (arg === null) return "null";
    if (arg === undefined) return "undefined";
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  console.log = (...args: unknown[]) => {
    logs.push(args.map(stringifyArg).join(" "));
    originalLog(...args);
  };
  console.warn = (...args: unknown[]) => {
    logs.push("[WARN] " + args.map(stringifyArg).join(" "));
    originalWarn(...args);
  };
  console.error = (...args: unknown[]) => {
    logs.push("[ERROR] " + args.map(stringifyArg).join(" "));
    originalError(...args);
  };
  console.info = (...args: unknown[]) => {
    logs.push("[INFO] " + args.map(stringifyArg).join(" "));
    originalInfo(...args);
  };

  let returnValue: string | undefined;
  let success = true;
  let errorMessage: string | undefined;

  try {
    // Strip simple TS type annotations if present
    const cleanCode = code
      .replace(/:\s*(?:string|number|boolean|any|void|Record<[^>]+>|Array<[^>]+>|string\[\]|number\[\])/g, "")
      .replace(/as\s+[a-zA-Z0-9_<>[\]]+/g, "");

    // Execute within async function wrapper
    const runner = new Function(
      `return (async () => {
        ${cleanCode}
      })();`
    );

    const result = await runner();
    if (result !== undefined) {
      returnValue = stringifyArg(result);
    }
  } catch (err: unknown) {
    success = false;
    errorMessage = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.info = originalInfo;
  }

  const durationMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    success,
    logs,
    error: errorMessage,
    durationMs,
    returnValue,
  };
}
