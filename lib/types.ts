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

export interface AnalysisRecord {
  id: string;
  request: AnalysisRequest;
  result: BugAnalysis;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
