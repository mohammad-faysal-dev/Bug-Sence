import { BugAnalysis, ProgrammingLanguage } from "./types";

export interface DemoSample {
    id: string;
    label: string;
    language: ProgrammingLanguage;
    errorMessage: string;
    codeSnippet: string;
    result: BugAnalysis;
}

export const DEMO_SAMPLES: DemoSample[] = [
    {
        id: "js-typeerror",
        label: "JS TypeError",
        language: "javascript",
        errorMessage: "TypeError: Cannot read properties of undefined (reading 'map')",
        codeSnippet: `function renderUserList(users) {\n  return users.map(user => user.name);\n}`,
        result: {
            errorSummary: "TypeError: Attempting to invoke Array.prototype.map() on an undefined or null variable.",
            possibleCause: "The 'users' variable was passed as undefined, commonly due to asynchronous data loading before the promise resolves or an API payload with missing keys.",
            explanation: "In JavaScript, accessing a method like .map() on undefined throws a runtime TypeError. This frequently occurs in UI components where initial state is undefined before a network response arrives.",
            suggestedSolution: "1. Apply optional chaining (users?.map(...)) or provide a default fallback empty array (users = []).\n2. Add defensive guard checks (Array.isArray(users)) before invoking collection methods.\n3. Verify calling code properly awaits asynchronous operations before passing parameters.",
            codeExample: `// Production-ready defensive fix\nfunction renderUserList(users = []) {\n  if (!Array.isArray(users)) return [];\n  return users.map((user) => user?.name ?? "Anonymous User");\n}`,
            severity: "high",
        },
    },
    {
        id: "python-keyerror",
        label: "Python KeyError",
        language: "python",
        errorMessage: "KeyError: 'auth_token' in handle_authentication",
        codeSnippet: `def get_auth_header(request_data):\n    token = request_data['auth_token']\n    return f"Bearer {token}"`,
        result: {
            errorSummary: "KeyError: Dictionary lookup failed because the key 'auth_token' does not exist.",
            possibleCause: "The incoming 'request_data' dictionary does not have an 'auth_token' key, likely due to an unauthenticated client request or malformed JSON payload.",
            explanation: "Python dictionary subscript syntax dict[key] raises a KeyError if the specified key is absent. Using .get() or validating request headers prior to access avoids abrupt application crashes.",
            suggestedSolution: "1. Use request_data.get('auth_token') with an explicit validation check.\n2. Raise an appropriate HTTP 401 Unauthorized or 400 Bad Request if the token is mandatory.\n3. Validate incoming payload schemas using Pydantic or Marshmallow.",
            codeExample: `def get_auth_header(request_data: dict) -> str:\n    token = request_data.get('auth_token')\n    if not token:\n        raise ValueError("Missing 'auth_token' in request payload")\n    return f"Bearer {token}"`,
            severity: "critical",
        },
    },
    {
        id: "react-hook-error",
        label: "React Hook Error",
        language: "typescript",
        errorMessage: "Error: Rendered more hooks than during the previous render",
        codeSnippet: `function UserProfile({ isPremium }) {\n  if (!isPremium) return null;\n  const [data, setData] = useState(null);\n  return <div>{data}</div>;\n}`,
        result: {
            errorSummary: "React Rules of Hooks Violation: A hook is called conditionally after an early return.",
            possibleCause: "The 'useState' hook is declared after a conditional 'return null', altering the total number of hooks executed across subsequent renders.",
            explanation: "React relies on the strict call order of hooks to link state with the component instance. Returning early before all hooks are called desynchronizes React's internal hook fiber list and triggers a fatal runtime error.",
            suggestedSolution: "1. Move all hook invocations (useState, useEffect, useMemo) to the top of the component function.\n2. Place conditional returns and guards exclusively AFTER all hook declarations.\n3. Use ESLint with eslint-plugin-react-hooks to catch hook violations at build time.",
            codeExample: `function UserProfile({ isPremium }: { isPremium: boolean }) {\n  // Always declare hooks unconditionally at the top level\n  const [data, setData] = useState<string | null>(null);\n\n  // Conditional rendering occurs AFTER all hooks\n  if (!isPremium) {\n    return null;\n  }\n\n  return <div>{data}</div>;\n}`,
            severity: "high",
        },
    },
    {
        id: "go-nil-pointer",
        label: "Go Nil Pointer",
        language: "go",
        errorMessage: "panic: runtime error: invalid memory address or nil pointer dereference",
        codeSnippet: `type Client struct {\n    Session *Session\n}\n\nfunc (c *Client) Fetch() {\n    c.Session.Connect()\n}`,
        result: {
            errorSummary: "Go Runtime Panic: Nil pointer dereference when accessing field or method on an uninitialized struct pointer.",
            possibleCause: "The 'Session' pointer field inside 'Client' is nil at runtime when Fetch() is called, attempting to access memory address 0x0.",
            explanation: "In Go, calling a method or accessing fields on a nil pointer triggers an unrecoverable runtime panic unless explicitly guarded or recovered with a panic handler.",
            suggestedSolution: "1. Check if the pointer receiver or nested pointer is nil before dereferencing.\n2. Ensure factory constructors initialize pointer fields (e.g. NewClient()).\n3. Return an explicit error rather than allowing the application to panic.",
            codeExample: `type Client struct {\n    Session *Session\n}\n\nfunc (c *Client) Fetch() error {\n    if c == nil || c.Session == nil {\n        return fmt.Errorf("client or session is not initialized")\n    }\n    return c.Session.Connect()\n}`,
            severity: "critical",
        },
    },
];

/**
 * Checks whether an incoming analysis request matches one of our demo samples.
 * Supports exact matches and fuzzy keyword matching.
 */
export function findDemoSample(errorMessage: string): BugAnalysis | null {
    const cleanError = errorMessage.trim().toLowerCase();

    // 1. Exact or signature match
    for (const sample of DEMO_SAMPLES) {
        if (cleanError === sample.errorMessage.toLowerCase()) {
            return sample.result;
        }
    }

    // 2. Keyword/semantic match
    if (cleanError.includes("cannot read properties of undefined") && cleanError.includes("map")) {
        return DEMO_SAMPLES[0].result;
    }
    if (cleanError.includes("cannot read properties of undefined")) {
        return DEMO_SAMPLES[0].result;
    }
    if (cleanError.includes("keyerror") && (cleanError.includes("auth_token") || cleanError.includes("user_profile_id"))) {
        return DEMO_SAMPLES[1].result;
    }
    if (cleanError.includes("rendered more hooks") || cleanError.includes("rules of hooks")) {
        return DEMO_SAMPLES[2].result;
    }
    if (cleanError.includes("nil pointer dereference") || cleanError.includes("invalid memory address")) {
        return DEMO_SAMPLES[3].result;
    }

    return null;
}
