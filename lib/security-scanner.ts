import { SecurityAuditResult, SecurityFinding, VulnerabilitySeverity, ProgrammingLanguage } from "./types";

export interface SecuritySample {
  id: string;
  label: string;
  language: ProgrammingLanguage;
  code: string;
  description: string;
}

export const SECURITY_SAMPLES: SecuritySample[] = [
  {
    id: "sqli-xss-jwt",
    label: "Node.js API: SQL Injection, XSS & Hardcoded Secret",
    language: "javascript",
    description: "Contains multiple critical OWASP flaws: raw string SQL query, unsafe innerHTML rendering, and plaintext secret key.",
    code: `const express = require('express');
const db = require('./database');
const app = express();

const JWT_SECRET = "sk_prod_994827410298491823749812"; // CWE-798: Hardcoded credential

app.get('/api/users', async (req, res) => {
  const username = req.query.username;
  // CWE-89: SQL Injection via unsanitized string interpolation
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  const results = await db.query(query);
  
  // CWE-79: Cross-Site Scripting (XSS) via unescaped reflection
  const welcomeHtml = "<div class='user-card'>Welcome " + username + "</div>";
  
  res.send(welcomeHtml);
});`,
  },
  {
    id: "path-traversal-exec",
    label: "Express File Server: Path Traversal & Command Injection",
    language: "javascript",
    description: "Accepts unvalidated file path and runs shell command with user input.",
    code: `const fs = require('fs');
const { exec } = require('child_process');

app.get('/download', (req, res) => {
  const filePath = req.query.file;
  // CWE-22: Path traversal vulnerability (e.g. ../../../etc/passwd)
  const data = fs.readFileSync('/var/data/' + filePath);
  res.send(data);
});

app.post('/ping', (req, res) => {
  const host = req.body.host;
  // CWE-78: OS Command Injection
  exec("ping -c 1 " + host, (err, stdout) => {
    res.send(stdout);
  });
});`,
  },
  {
    id: "python-sqli-eval",
    label: "Python Flask: Unsafe eval() & SQL Injection",
    language: "python",
    description: "Raw string formatting in SQL query and unsafe eval() execution.",
    code: `from flask import Flask, request
import sqlite3

app = Flask(__name__)
DB_PASSWORD = "super_secret_admin_password_2026"

@app.route('/calculate', methods=['POST'])
def calc():
    expression = request.json.get('formula')
    # CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code
    result = eval(expression)
    return {"result": result}

@app.route('/user', methods=['GET'])
def get_user():
    user_id = request.args.get('id')
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    # CWE-89: SQL Injection
    cursor.execute(f"SELECT username, email FROM accounts WHERE id = {user_id}")
    return {"user": cursor.fetchone()}`,
  },
];

interface SecurityRule {
  id: string;
  title: string;
  severity: VulnerabilitySeverity;
  cwe: string;
  regex: RegExp;
  description: string;
  remediation: string;
  generateSecureSnippet?: (match: string) => string;
}

const SECURITY_RULES: SecurityRule[] = [
  {
    id: "hardcoded-secret",
    title: "Hardcoded Credential or API Secret",
    severity: "critical",
    cwe: "CWE-798",
    regex: /(?:jwt_secret|api_key|secret_key|private_key|db_password|password|token)\s*=\s*["'][a-zA-Z0-9_\-.~]{12,}["']/i,
    description: "Sensitive secret or authentication key is hardcoded directly in source code, risking credential leakage.",
    remediation: "Extract secrets into environment variables (e.g., process.env.API_KEY) and configure secret rotation.",
  },
  {
    id: "sql-injection-concat",
    title: "SQL Injection via String Concatenation / Interpolation",
    severity: "critical",
    cwe: "CWE-89",
    regex: /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\s+.*(?:\+\s*[a-zA-Z0-9_.]+|\$\{[a-zA-Z0-9_.]+\}|f["'].*\{[a-zA-Z0-9_.]+\}.*["'])/i,
    description: "SQL query constructed dynamically via string concatenation allows malicious input to alter query structure.",
    remediation: "Use parameterized queries, prepared statements (e.g., db.query('SELECT * WHERE id = $1', [id])), or an ORM.",
  },
  {
    id: "command-injection",
    title: "OS Command Injection Risk",
    severity: "critical",
    cwe: "CWE-78",
    regex: /(?:exec|spawn|popen|system)\s*\(\s*(?:["'].*\+\s*[a-zA-Z0-9_.]+|f["'].*\{.*\}|`[^`]*\$\{.*?\}[^`]*`)/i,
    description: "Executing system shell commands with concatenated user input allows arbitrary command execution on the host.",
    remediation: "Avoid spawning shell processes with user input; pass arguments as an array with execFile or sanitize strictly.",
  },
  {
    id: "unsafe-eval",
    title: "Arbitrary Code Execution via eval() or Function Constructor",
    severity: "critical",
    cwe: "CWE-95",
    regex: /\b(?:eval|new\s+Function)\s*\(/,
    description: "Dynamic evaluation of code via eval() or new Function() opens the runtime to arbitrary code execution.",
    remediation: "Refactor to use structured JSON parsing (JSON.parse), math AST parsers, or safe lookup tables.",
  },
  {
    id: "xss-innerhtml",
    title: "Cross-Site Scripting (XSS) via Unescaped DOM Manipulation",
    severity: "high",
    cwe: "CWE-79",
    regex: /(?:\.innerHTML\s*=|dangerouslySetInnerHTML\s*=|res\.send\s*\(\s*["']<.*?\+\s*[a-zA-Z0-9_.]+)/i,
    description: "Inserting unescaped user-controlled HTML directly into the DOM or HTTP response allows script execution.",
    remediation: "Use textContent, React's standard JSX escaping, or sanitize HTML with DOMPurify / sanitize-html.",
  },
  {
    id: "path-traversal",
    title: "Path Traversal / Arbitrary File Access",
    severity: "high",
    cwe: "CWE-22",
    regex: /(?:fs\.(?:readFile|readFileSync|createReadStream|unlink|open)|open\s*\()\s*.*(?:\+\s*(?:req|param|query|input)|f["'].*\{.*(?:path|file|name)\}.*["'])/i,
    description: "File operations using untrusted path variables can allow attackers to read sensitive files via '../' sequences.",
    remediation: "Validate paths with path.resolve(), verify the path starts within an allowed base directory, or use a whitelist.",
  },
  {
    id: "redos-backtracking",
    title: "Catastrophic Backtracking / ReDoS Vulnerability",
    severity: "medium",
    cwe: "CWE-1333",
    regex: /\/(?:(?:\([^)]+\)\+)+|(?:\.[*+]\?*){2,}|(?:[a-zA-Z0-9]+\+)+)\//,
    description: "Regular expression with nested quantifiers can suffer catastrophic backtracking, freezing the CPU thread.",
    remediation: "Simplify regex quantifiers, use atomic grouping / possessive quantifiers, or test with safe regex validators.",
  },
  {
    id: "insecure-randomness",
    title: "Insecure Randomness for Security Tokens",
    severity: "medium",
    cwe: "CWE-338",
    regex: /Math\.random\(\)/,
    description: "Math.random() is cryptographically pseudo-random and predictable; it should never be used for tokens or session IDs.",
    remediation: "Use crypto.randomUUID() or crypto.getRandomValues() / crypto.randomBytes() for security-sensitive tokens.",
  },
  {
    id: "unhandled-promise",
    title: "Missing Catch Handler or Unhandled Async Error",
    severity: "low",
    cwe: "CWE-703",
    regex: /\.then\s*\([^)]+\)(?!\s*\.catch)/,
    description: "Promise chain without an explicit .catch() block can cause unhandled promise rejections and crash Node.js.",
    remediation: "Attach a .catch(err => ...) handler or refactor using async/await wrapped in a try/catch block.",
  },
];

export function runSecurityAudit(code: string): SecurityAuditResult {
  const lines = code.split("\n");
  const findings: SecurityFinding[] = [];

  SECURITY_RULES.forEach((rule) => {
    lines.forEach((lineText, idx) => {
      if (rule.regex.test(lineText)) {
        findings.push({
          id: `${rule.id}-${idx + 1}`,
          title: rule.title,
          severity: rule.severity,
          cwe: rule.cwe,
          line: idx + 1,
          description: rule.description,
          remediation: rule.remediation,
          vulnerableSnippet: lineText.trim(),
        });
      }
    });
  });

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low" || f.severity === "info").length;

  // Compute penalty
  let score = 100;
  score -= criticalCount * 30;
  score -= highCount * 15;
  score -= mediumCount * 8;
  score -= lowCount * 3;
  if (score < 0) score = 0;

  let grade: SecurityAuditResult["grade"] = "A+";
  if (score < 50) grade = "F";
  else if (score < 65) grade = "D";
  else if (score < 75) grade = "C";
  else if (score < 88) grade = "B";
  else if (score < 96) grade = "A";
  else grade = "A+";

  const summary = findings.length === 0
    ? "No critical or high-risk OWASP vulnerabilities detected in this code snippet."
    : `Detected ${findings.length} security concern(s) requiring remediation before production deployment.`;

  return {
    score,
    grade,
    summary,
    totalIssues: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    findings,
  };
}
