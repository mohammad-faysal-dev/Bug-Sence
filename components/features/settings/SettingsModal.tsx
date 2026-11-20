"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  X,
  Key,
  Cpu,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSettings, saveSettings, DEFAULT_SETTINGS, AVAILABLE_MODELS } from "@/lib/settings";
import { AppSettings } from "@/lib/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
      setIsSaved(false);
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setTestStatus("Reset to system defaults.");
  };

  const handleTestKey = async () => {
    if (!settings.customApiKey) {
      setTestStatus("No custom API key provided. Using server environment key or offline mode.");
      return;
    }
    setTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${settings.customApiKey.trim()}` },
      });
      if (res.ok) {
        setTestStatus("✓ Groq API Key validated successfully!");
      } else {
        const err = await res.json().catch(() => ({}));
        setTestStatus(`✕ Validation error: ${(err as { error?: { message?: string } })?.error?.message || "Invalid key"}`);
      }
    } catch {
      setTestStatus("✕ Network error connecting to Groq endpoint.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-950 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Engine &amp; AI Settings
              </h2>
              <p className="text-xs text-slate-400">Configure AI inference model, Groq keys, and offline modes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Custom API Key */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-sky-400" />
                Custom Groq API Key (Optional)
              </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-normal lowercase"
              >
                Get free key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={settings.customApiKey}
                onChange={(e) => setSettings({ ...settings, customApiKey: e.target.value })}
                className="flex-1 px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestKey}
                disabled={testing}
                className="border-sky-500/30 text-sky-300 text-xs px-3"
              >
                {testing ? "Testing..." : "Test Key"}
              </Button>
            </div>
            {testStatus && (
              <p className={`text-xs ${testStatus.startsWith("✓") ? "text-emerald-400" : "text-amber-400"}`}>
                {testStatus}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Stored securely in browser localStorage only. If left blank, server defaults or offline intelligent heuristics are used.
            </p>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Active Diagnostic Engine Model
            </label>
            <div className="space-y-2">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = settings.selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSettings({ ...settings, selectedModel: model.id })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-sky-500/10 border-sky-500/50 shadow-sm shadow-sky-950"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-white flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-slate-700 text-slate-300">
                          {model.provider}
                        </Badge>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-slate-950">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{model.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fallback switch */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Intelligent Heuristic Fallback
              </div>
              <p className="text-[11px] text-slate-400">
                Automatically use offline pattern recognition if network or Groq quota limits are encountered.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.useOfflineEngine}
              onChange={(e) => setSettings({ ...settings, useOfflineEngine: e.target.checked })}
              className="w-4 h-4 rounded accent-sky-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-sky-500/20 bg-slate-900/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="border-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold gap-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isSaved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
