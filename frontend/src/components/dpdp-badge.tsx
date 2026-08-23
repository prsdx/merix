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
 * Responsive across Light and Dark themes.
 */
export function DPDPBadge({
  label = "DPDP 2023 Compliant",
  variant = "pill",
  className = "",
}: DPDPBadgeProps) {
  if (variant === "subtle") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium font-mono ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{label}</span>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs text-slate-700 dark:text-slate-200 backdrop-blur-md bg-emerald-500/5 border-emerald-500/20 ${className}`}
      >
        <div className="flex items-center gap-2 mt-0.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
            India DPDP Act (2023) Protected.
          </strong>{" "}
          All candidate resumes are processed with PII scrubbing, explicit consent logging, and automatic retention enforcement. Candidate data is never sent to external LLM providers without anonymisation.
        </span>
      </div>
    );
  }

  if (variant === "row") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <Lock className="w-2.5 h-2.5" />
        <span>DPDP</span>
      </span>
    );
  }

  if (variant === "stamp") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-center bg-emerald-500/5 border border-emerald-500/25 ${className}`}
      >
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <div>
          <div className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            DPDP 2023
          </div>
          <div className="text-[9px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">Protected</div>
        </div>
      </div>
    );
  }

  // Default: pill
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <ShieldCheck className="w-3.5 h-3.5" />
      <span className="font-mono">{label}</span>
    </span>
  );
}
