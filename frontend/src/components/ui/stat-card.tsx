import React from "react";
import { Card, IconTile } from "./card";

/** Metric tile: icon tile + big value + mono label, used on dashboard/landing. */
export function StatCard({
  icon,
  tone = "brand",
  value,
  label,
  className,
}: {
  icon: React.ReactNode;
  tone?: "brand" | "evidence" | "gap" | "neutral";
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <Card padded hover className={className}>
      <div className="flex items-center gap-4">
        <IconTile tone={tone}>{icon}</IconTile>
        <div>
          <div className="font-display text-2xl text-[var(--text-primary)] leading-none">
            {value}
          </div>
          <div className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </div>
        </div>
      </div>
    </Card>
  );
}
