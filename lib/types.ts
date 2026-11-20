export type ProgrammingLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "csharp"
  | "php"
  | "ruby"
  | "go"
  | "rust"
  | "swift"
  | "kotlin"
  | "other";

export interface AnalysisRequest {
  errorMessage: string;
  codeSnippet?: string;
  language: ProgrammingLanguage;
}

export interface BugAnalysis {
  errorSummary: string;
  possibleCause: string;
  explanation: string;
  suggestedSolution: string;
  codeExample?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export type IncidentStatus = "open" | "investigating" | "resolved" | "archived";

export interface AnalysisRecord {
  id: string;
  request: AnalysisRequest;
  result: BugAnalysis;
  createdAt: string;
  status?: IncidentStatus;
  tags?: string[];
  notes?: string;
}

export interface TestGenerationRequest {
  language: ProgrammingLanguage;
  errorMessage: string;
  codeSnippet?: string;
  codeExample?: string;
  framework?: string;
}

export interface TestGenerationResult {
  framework: string;
  fileName: string;
  testCode: string;
  instructions: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Security Audit Types
// ----------------------------------------------------
export type VulnerabilitySeverity = "critical" | "high" | "medium" | "low" | "info";

export interface SecurityFinding {
  id: string;
  title: string;
  severity: VulnerabilitySeverity;
  cwe?: string;
  line?: number;
  description: string;
  remediation: string;
  vulnerableSnippet?: string;
  secureSnippet?: string;
}

export interface SecurityAuditResult {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: SecurityFinding[];
  recommendedFixCode?: string;
}

// ----------------------------------------------------
// Stack Trace Demangler Types
// ----------------------------------------------------
export type FrameType = "user" | "vendor" | "internal";

export interface StackFrame {
  id: string;
  raw: string;
  method: string;
  file: string;
  line?: number;
  column?: number;
  type: FrameType;
  isCulprit?: boolean;
}

export interface ParsedStackTrace {
  errorName: string;
  errorMessage: string;
  frames: StackFrame[];
  detectedLanguage: ProgrammingLanguage;
  culpritFrame?: StackFrame;
}

// ----------------------------------------------------
// Code Sandbox Execution Types
// ----------------------------------------------------
export interface ExecutionResult {
  success: boolean;
  logs: string[];
  error?: string;
  durationMs: number;
  returnValue?: string;
}

// ----------------------------------------------------
// App Settings Types
// ----------------------------------------------------
export interface AppSettings {
  customApiKey: string;
  selectedModel: string;
  useOfflineEngine: boolean;
  autoFormatCode: boolean;
}
