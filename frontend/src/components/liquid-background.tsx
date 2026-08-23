"use client";

import React from "react";

/**
 * LiquidBackground — ambient atmospheric orbs supporting both Light and Dark themes.
 */
export function LiquidBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Primary teal orb — top-right */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.07] dark:opacity-[0.06] blur-[120px] transition-opacity duration-300"
        style={{ background: "radial-gradient(circle, var(--color-data) 0%, transparent 70%)" }}
      />
      {/* Secondary emerald orb — bottom-left */}
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.06] dark:opacity-[0.05] blur-[100px] transition-opacity duration-300"
        style={{ background: "radial-gradient(circle, var(--color-compliance) 0%, transparent 70%)" }}
      />
      {/* Iris accent orb — center-left */}
      <div
        className="absolute top-1/2 -left-48 w-[350px] h-[350px] rounded-full opacity-[0.04] dark:opacity-[0.04] blur-[80px] transition-opacity duration-300"
        style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }}
      />
      {/* Subtle grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] transition-opacity duration-300"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
