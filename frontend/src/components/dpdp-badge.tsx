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
 * Threads through every screen touching candidate data.
 *
 * Variants:
 *  pill   — small inline pill (navbar, card corners)
 *  subtle — text-only inline label
 *  banner — full-width notice bar (upload page, consent gate)
 *  row    — compact horizontal badge for table rows
 *  stamp  — square authority stamp for detail views
 */
export function DPDPBadge({
  label = "DPDP 2023 Compliant",
  variant = "pill",
  className = "",
}: DPDPBadgeProps) {
  if (variant === "subtle") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-[#22C55E]/90 font-medium font-mono ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
        <span>{label}</span>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-xs text-[#E8E6E1]/80 backdrop-blur-md ${className}`}
        style={{
          background: "rgba(34,197,94,0.05)",
          borderColor: "rgba(34,197,94,0.2)",
        }}
      >
        <div className="flex items-center gap-2 mt-0.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
        </div>
        <span>
          <strong className="text-[#22C55E] font-semibold">India DPDP Act (2023) Protected.</strong>{" "}
          All candidate resumes are processed with PII scrubbing, explicit consent logging, and automatic retention enforcement. Candidate data is never sent to external LLM providers without anonymisation.
        </span>
      </div>
    );
  }

  if (variant === "row") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${className}`}
        style={{
          background: "rgba(34,197,94,0.08)",
          color: "#22C55E",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <Lock className="w-2.5 h-2.5" />
        <span>DPDP</span>
      </span>
    );
  }

  if (variant === "stamp") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-center ${className}`}
        style={{
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.25)",
        }}
      >
        <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
        <div>
          <div className="text-[10px] font-mono font-semibold text-[#22C55E] uppercase tracking-wider">
            DPDP 2023
          </div>
          <div className="text-[9px] text-[#22C55E]/60 mt-0.5">Protected</div>
        </div>
      </div>
    );
  }

  // Default: pill
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${className}`}
      style={{
        background: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.22)",
        color: "#22C55E",
        boxShadow: "0 0 12px rgba(34,197,94,0.12)",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
      <ShieldCheck className="w-3.5 h-3.5" />
      <span className="font-mono">{label}</span>
    </span>
  );
}
