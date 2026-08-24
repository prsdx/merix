"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How is Merix different from a keyword-matching ATS?",
    a: "Legacy ATS tools count keyword hits and return an opaque percentage. Merix parses your JD into a deterministic 70/20/10 rubric, then cites the exact verbatim sentence from each resume proving every score — so you can audit any ranking in seconds.",
  },
  {
    q: "How fast is a batch of 100 resumes?",
    a: "A typical 100-resume batch completes in under 8 minutes. Processing runs in parallel with async workers, and every candidate gets a full evidence-backed evaluation — not just a filter result.",
  },
  {
    q: "Does Merix ever auto-reject candidates?",
    a: "Never. Every applicant reaches human review with their full dossier: overall score, rubric breakdown, matched/missing skills, and the verbatim quotes behind them. Merix informs the decision; you make it.",
  },
  {
    q: "How do you comply with the DPDP Act 2023?",
    a: "Consent declarations are recorded with cryptographic timestamps before ingestion, resumes and embeddings auto-purge after a configurable 90-day retention window, and candidates can exercise right-to-erasure via a one-click verified deletion flow.",
  },
  {
    q: "Can I export shortlists for my team?",
    a: "Yes. Ranked leaderboards export to clean CSV reports including scores, verdicts, and evidence citations — ready for placement cells, hiring committees, or client submission.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 scroll-mt-20">
      <div className="space-y-3 text-center">
        <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
          FAQ
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
          Questions recruiters ask before switching.
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const open = openIndex === idx;
          return (
            <div key={faq.q} className="merix-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(open ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <span className="text-base font-bold text-[var(--text-primary)]">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
