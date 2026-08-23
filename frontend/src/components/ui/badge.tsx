import React from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "strong"
  | "mixed"
  | "weak"
  | "evidence"
  | "gap"
  | "danger"
  | "neutral";

/**
 * Monospace pill badge. Reuses the canonical globals.css pill styles
 * (.verd-strong/.verd-mixed/.verd-weak, .tag-evidence/.tag-gap/.tag-neutral)
 * and extends them with the remaining tones.
 */
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  const canonical: Record<BadgeTone, string> = {
    strong: "verd-strong",
    mixed: "verd-mixed",
    weak: "verd-weak",
    evidence: "tag-evidence",
    gap: "tag-gap",
    danger:
      "font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--accent-danger-soft)] text-[var(--accent-danger)] border border-[var(--accent-danger-border)]",
    neutral: "tag-neutral",
  };
  return (
    <span className={cn("inline-flex items-center gap-1", canonical[tone], className)}>
      {children}
    </span>
  );
}

/** Maps a numeric score to the verdict badge tone used across the app. */
export function scoreToTone(score: number): BadgeTone {
  if (score >= 75) return "strong";
  if (score >= 50) return "mixed";
  return "weak";
}
