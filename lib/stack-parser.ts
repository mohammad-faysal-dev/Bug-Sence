import { ParsedStackTrace, StackFrame, FrameType, ProgrammingLanguage } from "./types";

export const SAMPLE_TRACES: { id: string; label: string; language: ProgrammingLanguage; trace: string }[] = [
  {
    id: "node-typeerror",
    label: "Node.js / Express Unhandled TypeError",
    language: "javascript",
    trace: `TypeError: Cannot read properties of undefined (reading 'id')
    at getUserProfile (/app/src/controllers/userController.js:42:28)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at next (/app/node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (/app/node_modules/express/lib/router/route.js:114:3)
    at /app/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12)
    at next (/app/node_modules/express/lib/router/index.js:280:10)
    at authMiddleware (/app/src/middleware/auth.js:18:9)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`,
  },
  {
    id: "react-minified",
    label: "Next.js / React Client Hydration Mismatch",
    language: "typescript",
    trace: `Error: Hydration failed because the initial UI does not match what was rendered on the server.
    at throwOnHydrationMismatch (webpack-internal:///(app-pages-browser)/./node_modules/react-dom/cjs/react-dom.development.js:12507:9)
    at tryToClaimNextHydratableInstance (webpack-internal:///(app-pages-browser)/./node_modules/react-dom/cjs/react-dom.development.js:12520:7)
    at updateHostComponent$1 (webpack-internal:///(app-pages-browser)/./node_modules/react-dom/cjs/react-dom.development.js:19777:5)
    at DynamicTimestamp (/app/components/features/DynamicTimestamp.tsx:14:11)
    at renderWithHooks (webpack-internal:///(app-pages-browser)/./node_modules/react-dom/cjs/react-dom.development.js:15486:18)
    at mountIndeterminateComponent (webpack-internal:///(app-pages-browser)/./node_modules/react-dom/cjs/react-dom.development.js:20103:13)`,
  },
  {
    id: "python-traceback",
    label: "Python Django ZeroDivisionError",
    language: "python",
    trace: `Traceback (most recent call last):
  File "/usr/local/lib/python3.11/site-packages/django/core/handlers/base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
  File "/app/services/billing/calculator.py", line 85, in calculate_average_invoice
    avg = total_sum / invoice_count
ZeroDivisionError: division by zero`,
  },
  {
    id: "go-panic",
    label: "Go Runtime Nil Pointer Dereference",
    language: "go",
    trace: `panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x18 pc=0x10b7a84]

goroutine 1 [running]:
main.(*ClusterManager).SyncNodes(0x0)
	/app/services/cluster/manager.go:68 +0x34
main.handleRebalance()
	/app/services/cluster/rebalance.go:24 +0x8a
main.main()
	/app/cmd/server/main.go:19 +0x4c`,
  },
];

function classifyFrameType(file: string): FrameType {
  const f = file.toLowerCase();
  if (
    f.includes("node_modules") ||
    f.includes("site-packages") ||
    f.includes("vendor/") ||
    f.includes("webpack-internal") ||
    f.includes("dist/") ||
    f.includes(".min.js")
  ) {
    return "vendor";
  }
  if (
    f.startsWith("node:") ||
    f.includes("internal/") ||
    f.includes("v8/") ||
    f.includes("runtime/") ||
    f.includes("python3.") ||
    f.includes("<anonymous>")
  ) {
    return "internal";
  }
  return "user";
}

export function parseStackTrace(rawText: string): ParsedStackTrace {
  const lines = rawText.trim().split("\n");
  if (!lines.length) {
    return {
      errorName: "Unknown Error",
      errorMessage: "",
      frames: [],
      detectedLanguage: "javascript",
    };
  }

  let errorName = "Error";
  let errorMessage = "";
  const frames: StackFrame[] = [];
  let detectedLang: ProgrammingLanguage = "javascript";

  // Check language hints
  if (rawText.includes("Traceback (most recent call last):") || rawText.includes(".py\", line")) {
    detectedLang = "python";
  } else if (rawText.includes("panic:") || rawText.includes("goroutine ") || rawText.includes(".go:")) {
    detectedLang = "go";
  } else if (rawText.includes(".java:") || rawText.includes("Exception in thread")) {
    detectedLang = "java";
  } else if (rawText.includes(".tsx") || rawText.includes(".ts")) {
    detectedLang = "typescript";
  }

  // Parse Python Traceback
  if (detectedLang === "python") {
    const lastLine = lines[lines.length - 1];
    if (lastLine.includes(":")) {
      const parts = lastLine.split(":");
      errorName = parts[0].trim();
      errorMessage = parts.slice(1).join(":").trim();
    } else {
      errorName = "Python Exception";
      errorMessage = lastLine;
    }

    const pyFileRegex = /File\s+"([^"]+)",\s+line\s+(\d+)(?:,\s+in\s+([^\n\r]+))?/;
    lines.forEach((line, idx) => {
      const match = line.match(pyFileRegex);
      if (match) {
        const file = match[1];
        const lineNum = parseInt(match[2], 10);
        const method = match[3] || "<module>";
        const type = classifyFrameType(file);
        frames.push({
          id: `frame-${idx}`,
          raw: line.trim(),
          method,
          file,
          line: lineNum,
          type,
        });
      }
    });
  }
  // Parse Go Panic
  else if (detectedLang === "go") {
    const firstLine = lines[0];
    errorName = "Runtime Panic";
    errorMessage = firstLine.replace(/^panic:\s*/, "").trim();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes("(") && line.includes(")") && i + 1 < lines.length && lines[i + 1].trim().includes(".go:")) {
        const method = line.split("(")[0].trim();
        const filePart = lines[i + 1].trim();
        const fileMatch = filePart.match(/^([^\s:]+):(\d+)/);
        if (fileMatch) {
          const file = fileMatch[1];
          const lineNum = parseInt(fileMatch[2], 10);
          frames.push({
            id: `frame-${i}`,
            raw: `${line} (${filePart})`,
            method,
            file,
            line: lineNum,
            type: classifyFrameType(file),
          });
        }
      }
    }
  }
  // Standard V8 / Node.js / Browser stack trace
  else {
    const firstColon = lines[0].indexOf(":");
    if (firstColon !== -1) {
      errorName = lines[0].substring(0, firstColon).trim();
      errorMessage = lines[0].substring(firstColon + 1).trim();
    } else {
      errorName = "Error";
      errorMessage = lines[0].trim();
    }

    const nodeFrameRegex = /^\s*at\s+(?:([^\s(]+)\s+\()?(?:webpack-internal:\/\/\/)?([^:)]+)(?::(\d+):(\d+))?\)?$/;
    lines.forEach((line, idx) => {
      if (!line.trim().startsWith("at ")) return;
      const clean = line.trim();
      const match = clean.match(nodeFrameRegex);
      if (match) {
        const method = match[1] || "(anonymous)";
        const file = match[2] || "unknown";
        const lineNum = match[3] ? parseInt(match[3], 10) : undefined;
        const colNum = match[4] ? parseInt(match[4], 10) : undefined;
        const type = classifyFrameType(file);
        frames.push({
          id: `frame-${idx}`,
          raw: clean,
          method,
          file,
          line: lineNum,
          column: colNum,
          type,
        });
      } else {
        frames.push({
          id: `frame-${idx}`,
          raw: clean,
          method: "call",
          file: clean.replace(/^at\s+/, ""),
          type: classifyFrameType(clean),
        });
      }
    });
  }

  // Find culprit: in JS, typically the highest user-code frame from top down
  // In Python, typically the lowest user-code frame (innermost)
  let culpritFrame: StackFrame | undefined;
  if (detectedLang === "python") {
    for (let i = frames.length - 1; i >= 0; i--) {
      if (frames[i].type === "user") {
        culpritFrame = frames[i];
        frames[i].isCulprit = true;
        break;
      }
    }
  } else {
    for (let i = 0; i < frames.length; i++) {
      if (frames[i].type === "user") {
        culpritFrame = frames[i];
        frames[i].isCulprit = true;
        break;
      }
    }
  }

  // Fallback culprit if no user code found
  if (!culpritFrame && frames.length > 0) {
    frames[0].isCulprit = true;
    culpritFrame = frames[0];
  }

  return {
    errorName: errorName || "Error",
    errorMessage: errorMessage || lines[0] || "Unknown exception",
    frames,
    detectedLanguage: detectedLang,
    culpritFrame,
  };
}
