"use client";

import Link from "next/link";
import { Reveal, Marquee, Magnetic } from "./motion";

const OUTCOMES = [
  {
    stat: "<8 min",
    statClass: "text-[var(--brand-primary)]",
    title: "Target turnaround for a 100-resume batch",
    body: "Parallel async workers are engineered to rank an entire campus pile in minutes — not days of manual skimming.",
  },
  {
    stat: "100%",
    statClass: "text-[var(--accent-evidence)]",
    title: "Scores backed by verbatim evidence",
    body: "Every point awarded cites the exact resume sentence that earned it, so any ranking can be audited in seconds.",
  },
  {
    stat: "70/20/10",
    statClass: "text-[var(--text-primary)]",
    title: "Your rubric, applied deterministically",
    body: "JDs parse into required, preferred, and experience weights — the same rubric every time, no silent re-weighting.",
  },
  {
    stat: "0",
    statClass: "text-[var(--accent-gap)]",
    title: "Auto-rejects, by design",
    body: "Every applicant reaches human review with their complete dossier. Merix informs the decision; you make it.",
  },
  {
    stat: "DPDP",
    statClass: "text-[var(--accent-evidence)]",
    title: "Compliance engineered in from day one",
    body: "Consent logging, configurable retention windows, and one-click candidate erasure on an immutable audit trail.",
  },
  {
    stat: "CSV",
    statClass: "text-[var(--text-primary)]",
    title: "Shortlists your committee can actually use",
    body: "Ranked exports carry scores, verdicts, and citations attached — no screenshots, no lost context.",
  },
];

export function TestimonialsCta() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      {/* Designed-outcome cards (illustrative — no customer quotes yet) */}
      <Reveal y={24}>
        <p className="text-center text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] pb-6">
          What early users can expect — designed outcomes, not case studies yet
        </p>
        <Marquee
          duration={52}
          items={OUTCOMES.map((t) => (
            <div
              key={t.title}
              className="w-[330px] sm:w-[380px] p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-3 flex flex-col hover:border-[var(--border-subtle)] transition-colors"
            >
              <div className={`text-xl font-mono font-bold ${t.statClass}`}>{t.stat}</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{t.title}</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                {t.body}
              </p>
            </div>
          ))}
        />
      </Reveal>

      {/* Final High-Conversion Trust CTA */}
      <Reveal y={32}>
      <div
        className="p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl text-[var(--bg-canvas)]"
        style={{
          background:
            "linear-gradient(135deg, var(--text-primary) 45%, var(--brand-primary) 145%)",
        }}
      >
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--bg-canvas)]">
            Screen your next 100 resumes in minutes.
          </h2>
          <p className="text-sm sm:text-base text-[var(--bg-canvas)] opacity-80 leading-relaxed font-sans">
            Merix never rejects silently — every candidate reaches you with the evidence to decide.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Magnetic strength={0.25}>
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] transition-transform cursor-pointer block"
            >
              Create Free Organisation Account
            </Link>
          </Magnetic>
          <Link
            href="/login"
            className="px-5 py-3.5 rounded-xl font-semibold text-sm text-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)]/10 transition-colors cursor-pointer"
          >
            Sign In to Pipeline
          </Link>
        </div>

        <div className="text-xs font-mono opacity-60 pt-2">
          India DPDP Act (2023) Protected • Row-Level Multi-Tenant Isolation
        </div>
      </div>
      </Reveal>
    </section>
  );
}
