"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  // Hydration-safe "mounted" check: false during SSR/first render, true after.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-colors border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 shadow-sm ${className}`}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
