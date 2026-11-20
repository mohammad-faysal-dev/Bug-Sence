export interface RegexMatchItem {
  match: string;
  index: number;
  length: number;
  groups?: Record<string, string>;
  captures?: string[];
}

export interface RegexAnalysis {
  isValid: boolean;
  error?: string;
  hasRedosRisk: boolean;
  redosReason?: string;
  matches: RegexMatchItem[];
  tokensExplanation: { token: string; explanation: string }[];
}

export interface RegexPreset {
  id: string;
  name: string;
  pattern: string;
  flags: string;
  testString: string;
  description: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: "email",
    name: "Email Address Validator",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    flags: "gm",
    testString: `valid.user@example.com
alice+newsletter@corp.io
invalid-email@not-working
team@sub.domain.co.uk`,
    description: "Matches standard RFC 5322 email patterns.",
  },
  {
    id: "semver",
    name: "Semantic Versioning (SemVer)",
    pattern: "^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$",
    flags: "gm",
    testString: `v1.0.0
2.14.5
0.9.1-alpha.3
invalid..1.0
3.0.0-beta+20261120`,
    description: "Standard SemVer 2.0.0 regex pattern with pre-release tags.",
  },
  {
    id: "redos-danger",
    name: "Catastrophic Backtracking (ReDoS Hazard)",
    pattern: "^(a+)+$",
    flags: "",
    testString: "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!",
    description: "Demonstrates nested quantifiers causing exponential backtracking on non-matching strings.",
  },
  {
    id: "jwt",
    name: "JSON Web Token (JWT)",
    pattern: "^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*$",
    flags: "gm",
    testString: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
not_a_valid_jwt_token`,
    description: "Validates 3-segment base64url encoded JWT structure.",
  },
  {
    id: "url",
    name: "URL & HTTPS Link Parser",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
    flags: "g",
    testString: `Visit https://bugsence.vercel.app or http://localhost:3000/api/analyze?test=true for developer tools.`,
    description: "Extracts HTTP and HTTPS URLs from prose.",
  },
];

export function analyzeRegex(
  pattern: string,
  flags: string,
  testText: string
): RegexAnalysis {
  if (!pattern) {
    return {
      isValid: true,
      hasRedosRisk: false,
      matches: [],
      tokensExplanation: [],
    };
  }

  // Check ReDoS Risk via heuristics (nested quantifiers e.g. (a+)+, (.*a){2,}, etc.)
  let hasRedosRisk = false;
  let redosReason: string | undefined;

  const redosPatterns = [
    {
      regex: /\([^)]*[*+]\s*\)[*+]/,
      reason: "Nested quantifier detected: `(group+)+` creates $O(2^n)$ exponential backtracking complexity.",
    },
    {
      regex: /\([^)]*\|[^)]*\)[*+]/,
      reason: "Overlapping alternation with quantifier: `(a|a)+` causes branching explosion.",
    },
    {
      regex: /(?:\.[*+]){2,}/,
      reason: "Multiple adjacent greedy wildcards: `.*.*` causes quadratic/polynomial backtracking.",
    },
  ];

  for (const check of redosPatterns) {
    if (check.regex.test(pattern)) {
      hasRedosRisk = true;
      redosReason = check.reason;
      break;
    }
  }

  // Build Tokens Explanation
  const tokensExplanation: { token: string; explanation: string }[] = [];
  if (pattern.startsWith("^")) tokensExplanation.push({ token: "^", explanation: "Asserts position at start of line or string." });
  if (pattern.endsWith("$")) tokensExplanation.push({ token: "$", explanation: "Asserts position at end of line or string." });
  if (pattern.includes("\\d")) tokensExplanation.push({ token: "\\d", explanation: "Matches any ASCII digit [0-9]." });
  if (pattern.includes("\\w")) tokensExplanation.push({ token: "\\w", explanation: "Matches any word character (alphanumeric + underscore)." });
  if (pattern.includes("\\s")) tokensExplanation.push({ token: "\\s", explanation: "Matches any whitespace character (space, tab, newline)." });
  if (pattern.includes("+")) tokensExplanation.push({ token: "+", explanation: "Matches 1 or more times (greedy quantifier)." });
  if (pattern.includes("*")) tokensExplanation.push({ token: "*", explanation: "Matches 0 or more times (greedy quantifier)." });
  if (pattern.includes("?")) tokensExplanation.push({ token: "?", explanation: "Matches 0 or 1 time, or turns preceding quantifier lazy." });
  if (pattern.includes("[") && pattern.includes("]")) tokensExplanation.push({ token: "[...]", explanation: "Defines a character class matching any single character in the set." });
  if (pattern.includes("(") && pattern.includes(")")) tokensExplanation.push({ token: "(...)", explanation: "Capturing group to isolate and extract sub-expressions." });

  // Execute Regex Match safely
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err: unknown) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : "Invalid Regular Expression syntax.",
      hasRedosRisk,
      redosReason,
      matches: [],
      tokensExplanation,
    };
  }

  const matches: RegexMatchItem[] = [];
  try {
    if (flags.includes("g")) {
      let m: RegExpExecArray | null;
      let count = 0;
      while ((m = regex.exec(testText)) !== null && count < 200) {
        matches.push({
          match: m[0],
          index: m.index,
          length: m[0].length,
          groups: m.groups,
          captures: m.slice(1),
        });
        if (m.index === regex.lastIndex) regex.lastIndex++; // Prevent zero-width infinite loops
        count++;
      }
    } else {
      const m = regex.exec(testText);
      if (m) {
        matches.push({
          match: m[0],
          index: m.index,
          length: m[0].length,
          groups: m.groups,
          captures: m.slice(1),
        });
      }
    }
  } catch (err: unknown) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : "Error during regex execution.",
      hasRedosRisk,
      redosReason,
      matches: [],
      tokensExplanation,
    };
  }

  return {
    isValid: true,
    hasRedosRisk,
    redosReason,
    matches,
    tokensExplanation,
  };
}
