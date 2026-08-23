"use client";

import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

interface DPDPBadgeProps {
  label?: string;
  variant?: "pill" | "subtle" | "banner" | "row" | "stamp";
  className?: string;
}

/**
 * DPDPBadge — DPDP Act 2023 compliance visual signal.
 * Precision styled with Forensic Ledger design tokens.
 */
export function DPDPBadge({
  label = "DPDP Act (2023) Compliant",
  variant = "pill",
  className = "",
}: DPDPBadgeProps) {
  if (variant === "subtle") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-[var(--accent-evidence)] font-medium font-mono ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>{label}</span>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs text-[var(--text-secondary)] bg-[var(--accent-evidence-soft)] border-[var(--accent-evidence-border)] ${className}`}
      >
        <div className="flex items-center gap-2 mt-0.5 shrink-0 text-[var(--accent-evidence)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-evidence)] animate-pulse" />
          <ShieldCheck className="w-4 h-4" />
        </div>
        <span>
          <strong className="text-[var(--accent-evidence)] font-bold">
            India DPDP Act (2023) Certified.
          </strong>{" "}
          All candidate resumes are processed with PII redaction, affirmative recruiter consent logging, and automatic 90-day retention enforcement.
        </span>
      </div>
    );
  }

  if (variant === "row") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--accent-evidence-soft)] text-[var(--accent-evidence)] border border-[var(--accent-evidence-border)] ${className}`}
      >
        <Lock className="w-2.5 h-2.5" />
        <span>DPDP</span>
      </span>
    );
  }

  if (variant === "stamp") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-center bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence-border)] ${className}`}
      >
        <ShieldCheck className="w-5 h-5 text-[var(--accent-evidence)]" />
        <div>
          <div className="text-[10px] font-mono font-bold text-[var(--accent-evidence)] uppercase tracking-wider">
            DPDP 2023
          </div>
          <div className="text-[9px] text-[var(--accent-evidence)] opacity-80 mt-0.5 font-mono">
            Protected
          </div>
        </div>
      </div>
    );
  }

  // Default: pill
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence-border)] text-[var(--accent-evidence)] font-mono ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-evidence)] animate-pulse" />
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
}
