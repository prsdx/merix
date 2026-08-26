"use client";

import React from "react";
import { FileSpreadsheet, Timer, ShieldCheck } from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";
import { Stagger, StaggerItem, SpotlightCard } from "./motion";

export function BentoGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <Stagger className="space-y-4 text-center max-w-2xl mx-auto" gap={0.12}>
        <StaggerItem>
          <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
            Capabilities · 02
          </div>
        </StaggerItem>
        <StaggerItem>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
            Everything a defensible shortlist needs.
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Not a pile of features — a single instrument where scoring, evidence, and compliance
            live in one auditable surface.
          </p>
        </StaggerItem>
      </Stagger>

      <Stagger className="grid grid-cols-1 md:grid-cols-6 gap-4" gap={0.1}>
        {/* A — Explainability showcase (tall) */}
        <StaggerItem className="md:col-span-2 md:row-span-2 h-full">
          <SpotlightCard className="p-6 flex flex-col justify-between h-full min-h-[380px] md:min-h-full">
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent-evidence)]">
                Deterministic Explainability
              </div>
              <h3 className="font-display text-2xl text-[var(--text-primary)] leading-snug">
                Every score cites the exact sentence that earned it.
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                No opaque percentages. Merix quotes the candidate&apos;s own resume — verbatim,
                monospace, audit-ready.
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <div className="forensic-citation">
                &ldquo;Tuned pgvector HNSW index parameters (m=16, ef_construction=64) on 1536-dim
                embeddings, reducing nearest-neighbor lookup time from 420ms to 38ms.&rdquo;
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="tag-evidence">✓ +24/24 pts</span>
                <span className="tag-evidence">✓ pgvector Tuning</span>
                <span className="tag-gap">✕ Kubernetes Ops</span>
              </div>
            </div>
          </SpotlightCard>
        </StaggerItem>

        {/* B — Speed */}
        <StaggerItem className="md:col-span-2 h-full">
          <SpotlightCard className="p-6 space-y-3 h-full">
            <Timer className="w-5 h-5 text-[var(--accent-evidence)]" />
            <div className="text-4xl font-mono font-bold text-[var(--text-primary)] tracking-tight">
              &lt;8<span className="text-lg text-[var(--text-muted)]"> min</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              A full 100-resume campus batch is designed to finish before your coffee does —
              parallel async workers, zero queue babysitting.
            </p>
          </SpotlightCard>
        </StaggerItem>

        {/* C — DPDP compliance */}
        <StaggerItem className="md:col-span-2 h-full">
          <SpotlightCard className="p-6 space-y-3 h-full">
            <DPDPBadge variant="stamp" />
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              DPDP Act 2023, engineered in
            </h3>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
              <li>• Cryptographic consent logging before ingestion</li>
              <li>• 90-day configurable auto-purge of resumes &amp; embeddings</li>
              <li>• One-click right-to-erasure on immutable audit logs</li>
            </ul>
          </SpotlightCard>
        </StaggerItem>

        {/* D — CSV export */}
        <StaggerItem className="md:col-span-2 h-full">
          <SpotlightCard className="p-6 space-y-3 h-full">
            <FileSpreadsheet className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              Committee-ready exports
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Ranked leaderboards export to clean CSV — scores, verdicts, and citations attached.
              No screenshots, no lost context.
            </p>
          </SpotlightCard>
        </StaggerItem>

        {/* E — Security + human-in-loop (wide) */}
        <StaggerItem className="md:col-span-4 h-full">
          <SpotlightCard className="p-6 space-y-4 h-full">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--accent-evidence)]" />
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Multi-tenant isolation. Human judgment always final.
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              <p>
                Row-level Postgres security guarantees no candidate data, rubric, or shortlist ever
                leaks between organizations on shared infrastructure.
              </p>
              <p>
                Merix never rejects silently — every applicant arrives with their complete dossier:
                score breakdown, matched/missing skills, and the verbatim proof behind them.
              </p>
            </div>
          </SpotlightCard>
        </StaggerItem>
      </Stagger>
    </section>
  );
}