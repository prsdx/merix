"use client";

import React from "react";

/**
 * LiquidBackground — ambient atmospheric orbs.
 * v10: Updated from violet/indigo to teal-cyan/emerald
 * to match new palette (editorial authority direction).
 */
export function LiquidBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Primary teal orb — top-right */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: "radial-gradient(circle, #00D4AA 0%, transparent 70%)" }}
      />
      {/* Secondary emerald orb — bottom-left */}
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
        style={{ background: "radial-gradient(circle, #22C55E 0%, transparent 70%)" }}
      />
      {/* Iris accent orb — center-left */}
      <div
        className="absolute top-1/2 -left-48 w-[350px] h-[350px] rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: "radial-gradient(circle, #818CF8 0%, transparent 70%)" }}
      />
      {/* Subtle grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,230,225,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,230,225,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
