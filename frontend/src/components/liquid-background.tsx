"use client";

import React from "react";

/**
 * LiquidBackground - ambient aurora orbs supporting both Light and Dark themes.
 */
export function LiquidBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Primary teal orb - top-right, slow drift */}
      <div
        className="orb-drift-b absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.16] dark:opacity-[0.18] blur-[130px]"
        style={{ background: "radial-gradient(circle, var(--accent-evidence) 0%, transparent 70%)" }}
      />
      {/* Cobalt brand orb - bottom-left, counter drift */}
      <div
        className="orb-drift-a absolute -bottom-40 -left-40 w-[620px] h-[620px] rounded-full opacity-[0.14] dark:opacity-[0.16] blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)" }}
      />
      {/* Sky accent orb - center-left */}
      <div
        className="orb-drift-a absolute top-1/2 -left-56 w-[480px] h-[480px] rounded-full opacity-[0.10] dark:opacity-[0.11] blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--brand-primary-hover) 0%, transparent 70%)" }}
      />
      {/* Depth orb - bottom-right (balances composition) */}
      <div
        className="orb-drift-a absolute top-[55%] -right-52 w-[420px] h-[420px] rounded-full opacity-[0.08] dark:opacity-[0.10] blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--brand-primary-hover) 0%, transparent 70%)" }}
      />
      {/* Subtle grid texture overlay, fading out below the fold */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
