"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Stagger, StaggerItem, Reveal } from "./motion";

const ROWS = [
  {
    label: "Scoring transparency",
    legacy: "Opaque match percentage — zero reasoning shown",
    merix: "Verbatim resume quote cited for every point awarded",
  },
  {
    label: "100-resume turnaround",
    legacy: "Days of manual skimming and spreadsheet triage",
    merix: "Engineered for minutes, not days — parallel async processing",
  },
  {
    label: "Candidate fate",
    legacy: "Silent keyword filters auto-reject behind the scenes",
    merix: "0 auto-rejects — every dossier reaches human review",
  },
  {
    label: "Data protection",
    legacy: "Manual deletion policies and audit gaps",
    merix: "DPDP-native: consent logs, 90-day auto-purge, erasure endpoint",
  },
  {
    label: "Committee handoff",
    legacy: "Screenshot-and-email shortlists with no context",
    merix: "Clean ranked CSV export with evidence attached",
  },
];

export function ComparisonTable() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <Reveal>
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
            Why Switch · 03
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
            The difference between filtering and knowing.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Legacy ATS tools were built to eliminate candidates. Merix was built to defend every
            decision you make about them.
          </p>
        </div>
      </Reveal>

      {/* Column headers */}
      <Reveal delay={0.1}>
        <div className="hidden md:grid grid-cols-[1fr_1.1fr_1.1fr] gap-3 px-2">
          <div />
          <div className="text-center text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] py-2 rounded-xl border border-dashed border-[var(--border-subtle)]">
            Legacy ATS
          </div>
          <div className="text-center text-sm font-mono font-bold uppercase tracking-wider text-[var(--brand-primary)] py-2 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-soft)]">
            Merix
          </div>
        </div>
      </Reveal>

      <Stagger className="space-y-3" gap={0.09}>
        {ROWS.map((row) => (
          <StaggerItem key={row.label}>
            <div className="md:grid md:grid-cols-[1fr_1.1fr_1.1fr] gap-3 items-stretch">
              <div className="flex items-center font-bold text-sm text-[var(--text-primary)] md:px-2 mb-2 md:mb-0 md:py-4">
                {row.label}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-sm text-[var(--text-muted)] mb-2 md:mb-0">
                <X className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-danger)]" />
                <span>{row.legacy}</span>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--brand-border)] shadow-[var(--card-shadow)] text-sm text-[var(--text-primary)]">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-evidence)]" />
                <span>{row.merix}</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}