import React from "react";
import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lift + stronger border on hover */
  hover?: boolean;
  /** Extra padding utility, e.g. "p-6" (default none) */
  padded?: boolean;
}

export function Card({ hover = false, padded = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "merix-card",
        hover && "merix-card-hover",
        padded && "p-6",
        className
      )}
      {...props}
    />
  );
}

/** Small icon tile used inside cards / empty states / feature grids. */
export function IconTile({
  children,
  tone = "brand",
  className,
}: {
  children: React.ReactNode;
  tone?: "brand" | "evidence" | "gap" | "neutral";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand:
      "bg-[var(--brand-soft)] border-[var(--brand-border)] text-[var(--brand-primary)]",
    evidence:
      "bg-[var(--accent-evidence-soft)] border-[var(--accent-evidence-border)] text-[var(--accent-evidence)]",
    gap: "bg-[var(--accent-gap-soft)] border-[var(--accent-gap-border)] text-[var(--accent-gap)]",
    neutral:
      "bg-[var(--bg-subtle)] border-[var(--border-hairline)] text-[var(--text-secondary)]",
  };
  return (
    <div
      className={cn(
        "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0",
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
