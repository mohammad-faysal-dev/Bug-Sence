import { AppSettings } from "./types";

const SETTINGS_KEY = "bugsense_app_settings";

export const DEFAULT_SETTINGS: AppSettings = {
  customApiKey: "",
  selectedModel: "llama-3.3-70b-versatile",
  useOfflineEngine: false,
  autoFormatCode: true,
};

export const AVAILABLE_MODELS = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B Versatile",
    provider: "Groq (Recommended)",
    description: "State-of-the-art coding and diagnostic intelligence with high context length.",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B Instant",
    provider: "Groq (Ultra-Fast)",
    description: "Sub-second response time for rapid triage and simple fixes.",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B (32k Context)",
    provider: "Groq (High Context)",
    description: "Great for massive stack traces, log dumps, and large files.",
  },
  {
    id: "offline-heuristic",
    name: "Offline Intelligent Engine",
    provider: "Client-Side Heuristic",
    description: "Instant analysis without external API dependencies or token limits.",
  },
];

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("bugsense_settings_updated"));
  } catch (err) {
    console.error("Failed to persist BugSense settings", err);
  }
}
