"use client";

import Link from "next/link";
import { Stagger, StaggerItem, Reveal } from "./motion";

const TESTIMONIALS = [
  {
    metric: "318 hours",
    metricClass: "text-[var(--brand-primary)]",
    headline: "Saved across 4 campus placement drives",
    quote:
      "Merix processed 400 engineering applicants in 35 minutes with zero committee disputes on candidate ranking.",
    author: "Prof. Rajesh Kulkarni • T&P Cell, Pune",
  },
  {
    metric: "4.8× faster",
    metricClass: "text-[var(--accent-evidence)]",
    headline: "Shortlisting turnaround for tech staffing",
    quote:
      "Instead of re-reading 4-page resumes, our recruiters verify the verbatim monospace quote and schedule the same day.",
    author: "Ananya Deshmukh • VP of Talent, Bengaluru",
  },
  {
    metric: "100% audit proof",
    metricClass: "text-[var(--text-primary)]",
    headline: "Defensibility under DPDP Act 2023",
    quote:
      "Every consent timestamp and 90-day auto-purge is logged. Enterprise clients approved our vendor security immediately.",
    author: "Siddharth Rao • Engineering Director, Hyderabad",
  },
];

export function TestimonialsCta() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" gap={0.12}>
        {TESTIMONIALS.map((t) => (
          <StaggerItem key={t.author} className="h-full">
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-4 flex flex-col justify-between h-full transition-all duration-300 hover:border-[var(--border-subtle)] hover:-translate-y-1 hover:shadow-[var(--card-shadow-hover)]">
              <div className="space-y-2">
                <div className={`text-2xl font-mono font-bold ${t.metricClass}`}>{t.metric}</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{t.headline}</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="pt-3 border-t border-[var(--border-hairline)] text-xs font-mono text-[var(--text-muted)]">
                {t.author}
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

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
          <Link
            href="/signup"
            className="px-6 py-3.5 rounded-xl font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] transition-transform hover:scale-[1.02] cursor-pointer"
          >
            Create Free Organisation Account
          </Link>
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
