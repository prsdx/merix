import React from "react";
import { cn } from "@/lib/cn";

/** Landing-page section heading: mono eyebrow + display title + optional sub. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "text-center mx-auto max-w-2xl" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)] bg-[var(--brand-soft)] border border-[var(--brand-border)] rounded-md px-2.5 py-1">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

/** Authenticated-screen header strip: title + description on the left, actions right. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-hairline)]",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[var(--text-muted)] font-mono">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
