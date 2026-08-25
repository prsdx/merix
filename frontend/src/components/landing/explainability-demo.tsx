"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "./motion";

const EXPLAINABILITY_CRITERIA = [
  {
    id: "fastapi",
    title: "1. Async FastAPI Microservices (70% Required Weight)",
    candidateQuote:
      "“Engineered asynchronous REST APIs in FastAPI with Pydantic v2 validation, achieving 99.98% uptime across 12 production microservices.”",
    context:
      "Satisfies the core requirement for high-concurrency async Python services. Merix verified 3+ years of production FastAPI usage.",
    verdict: "Verified Match (+28/28 pts)",
  },
  {
    id: "pgvector",
    title: "2. pgvector Indexing & Vector Search (70% Required Weight)",
    candidateQuote:
      "“Tuned pgvector HNSW index parameters (m=16, ef_construction=64) on 1536-dim embeddings, reducing nearest-neighbor lookup time from 420ms to 38ms.”",
    context:
      "Exceeds standard SQL experience by proving specific mathematical indexing and latency optimization in pgvector.",
    verdict: "Verified Match (+24/24 pts)",
  },
  {
    id: "redis",
    title: "3. Redis Distributed Caching (20% Preferred Weight)",
    candidateQuote:
      "“Implemented Redis cache-aside layer with TTL invalidation, offloading 75% of read traffic from primary PostgreSQL database.”",
    context:
      "Earns full preferred qualification points by demonstrating concrete cache invalidation architecture.",
    verdict: "Verified Match (+18/20 pts)",
  },
];

export function ExplainabilityDemo() {
  const [selectedCriteria, setSelectedCriteria] = useState(EXPLAINABILITY_CRITERIA[0]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="merix-card p-8 sm:p-10 border border-[var(--border-subtle)] space-y-8">
        <Reveal>
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent-evidence)]">
            Deterministic Explainability
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
            Why this candidate was shortlisted — down to the exact sentence.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            Unlike legacy ATS tools that output opaque match percentages, Merix cites the exact monospace sentence from the candidate&apos;s resume proving why each rubric requirement is satisfied.
          </p>
        </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Criteria Selection Tabs (Left 5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Click a matched criterion to inspect quote:
            </div>
            {EXPLAINABILITY_CRITERIA.map((crit) => {
              const active = selectedCriteria.id === crit.id;
              return (
                <button
                  key={crit.id}
                  onClick={() => setSelectedCriteria(crit)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                    active
                      ? "bg-[var(--brand-soft)] border-[var(--brand-border)] ring-1 ring-[var(--brand-border)]"
                      : "bg-[var(--bg-subtle)] border-transparent hover:border-[var(--border-hairline)]"
                  }`}
                >
                  <div className="font-bold text-sm text-[var(--text-primary)]">{crit.title}</div>
                  <div className="text-xs font-mono text-[var(--accent-evidence)] mt-1 font-semibold">
                    {crit.verdict}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Evidence Drawer (Right 7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedCriteria.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="space-y-4"
            >
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Extracted Resume Proof (Verbatim Grounding):
              </div>
              <div className="forensic-citation text-sm leading-relaxed">
                {selectedCriteria.candidateQuote}
              </div>
            </div>
            <div className="space-y-1 pt-2 border-t border-[var(--border-hairline)]">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Recruiter Evaluation Context:
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedCriteria.context}</p>
            </div>
            </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
