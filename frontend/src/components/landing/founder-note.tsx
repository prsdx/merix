"use client";

import React from "react";
import { Reveal } from "./motion";

/**
 * FounderNote — the zero-customers trust move: a short, personal "why we're
 * building this" in our own voice. Honest about stage, confident about intent.
 */
export function FounderNote() {
  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Reveal>
        <div className="space-y-5">
          <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
            Why we&apos;re building this
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)] leading-tight">
            Screening shouldn&apos;t be a black box.
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <p>
              We started Merix after watching campus placement cells and staffing teams
              drown in PDFs — hundreds of resumes per drive, gut-feel shortlists, and
              keyword filters that reject good candidates silently and can&apos;t explain
              why.
            </p>
            <p>
              Our bet: every hiring decision should arrive with its evidence attached —
              the exact resume words that earned each point of the score, with a human
              making the final call. That&apos;s what Merix is built to do.
            </p>
            <p className="text-[var(--text-primary)] font-medium">
              It&apos;s early, it&apos;s honest about what it is, and it&apos;s being built
              with a small group of teams doing high-volume screening right now. If
              that&apos;s you, we&apos;d love to build it with you.
            </p>
          </div>
          <div className="text-xs font-mono text-[var(--text-muted)]">— Team Merix</div>
        </div>
      </Reveal>
    </section>
  );
}
