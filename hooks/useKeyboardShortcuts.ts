"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onSubmit?: () => void;
  onClear?: () => void;
  onDismiss?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Ctrl+Enter → submit
      if (isCtrl && e.key === "Enter") {
        e.preventDefault();
        handlers.onSubmit?.();
        return;
      }

      // Ctrl+K → clear
      if (isCtrl && e.key === "k") {
        e.preventDefault();
        handlers.onClear?.();
        return;
      }

      // Escape → dismiss
      if (e.key === "Escape") {
        handlers.onDismiss?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
