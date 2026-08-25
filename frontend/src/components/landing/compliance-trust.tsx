"use client";

import React from "react";
import { ShieldCheck, Clock, Lock, Database } from "lucide-react";
import { Stagger, StaggerItem, SpotlightCard, Marquee, Reveal } from "./motion";

const COMPLIANCE_CARDS = [
  {
    icon: ShieldCheck,
    title: "DPDP Act Section 12",
    body: "Mandatory affirmative recruiter consent declaration recorded with cryptographic audit timestamp before ingestion.",
  },
  {
    icon: Clock,
    title: "90-Day Auto-Purge",
    body: "Configurable organization retention lifecycle automatically wipes candidate PDF resumes and embeddings upon expiry.",
  },
  {
    icon: Lock,
    title: "Right to Erasure",
    body: "One-click irrevocable deletion endpoint for candidates requesting immediate erasure, verified on immutable audit logs.",
  },
  {
    icon: Database,
    title: "Row-Level Security",
    body: "Multi-tenant Postgres isolation guarantees no candidate data, rubric, or shortlist leaks between organizations.",
  },
];

const INSTITUTIONS = [
  "IIT BOMBAY PLACEMENT",
  "NIT SURATHKAL T&P",
  "BITS PILANI",
  "IIM CALCUTTA",
  "APEX STAFFING BENGALURU",
  "TECHRECRUIT PUNE",
];

export function ComplianceTrust() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <Reveal>
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
          Regulatory Compliance
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
          Built for India&apos;s Digital Personal Data Protection Act (2023).
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Automated compliance mechanisms protect your organization, candidate rights, and placement cell audit integrity.
        </p>
      </div>
      </Reveal>

      {/* 4 Serious Compliance Cards */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" gap={0.1}>
        {COMPLIANCE_CARDS.map((card) => (
          <StaggerItem key={card.title} className="h-full">
            <SpotlightCard className="p-5 space-y-3 h-full">
              <card.icon className="w-6 h-6 text-[var(--accent-evidence)]" />
              <h3 className="font-bold text-base text-[var(--text-primary)]">{card.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{card.body}</p>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Institution Wordmark Strip (Factorial Style) */}
      <div className="pt-6 border-t border-[var(--border-hairline)] text-center space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
          Adopted across placement bureaus &amp; staffing pipelines
        </div>
        <Marquee
          duration={30}
          items={INSTITUTIONS.map((name) => (
            <span
              key={name}
              className="flex items-center gap-x-10 text-sm font-mono font-bold text-[var(--text-secondary)] opacity-70 whitespace-nowrap"
            >
              {name}
              <span aria-hidden="true" className="opacity-40">•</span>
            </span>
          ))}
        />
      </div>
    </section>
  );
}
