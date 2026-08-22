import React from "react";
import { ShieldCheck } from "lucide-react";

interface DPDPBadgeProps {
  label?: string;
  variant?: "pill" | "subtle" | "banner";
  className?: string;
}

export function DPDPBadge({
  label = "DPDP 2023 Compliant",
  variant = "pill",
  className = "",
}: DPDPBadgeProps) {
  if (variant === "subtle") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-emerald-400/90 font-medium ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>{label}</span>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 backdrop-blur-md ${className}`}>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>India DPDP Act (2023) Protected:</strong> All candidate resumes are parsed with PII scrubbing, explicit consent logging, and automatic 90-day retention enforcement.
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      <span>{label}</span>
    </span>
  );
}
