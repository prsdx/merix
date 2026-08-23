"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { ScoreRing } from "@/components/score-ring";

const HERO_APPLICANTS = [
  {
    id: "cand-1",
    rank: 1,
    initials: "AS",
    name: "Aditya Sharma",
    institution: "IIT Bombay",
    degree: "B.Tech Computer Science (2022)",
    experience: "3.5 Years",
    score: 94,
    verd: "Strong",
    verdClass: "verd-strong",
    reqScore: 68,
    prefScore: 18,
    expScore: 10,
    evidence:
      "Architected distributed async microservices with FastAPI and PostgreSQL pgvector, processing 5M+ vector queries daily at sub-50ms latency in containerized clusters.",
    matchedSkills: ["Python 3.11+", "FastAPI AsyncIO", "PostgreSQL", "pgvector", "Docker", "Redis"],
    missingSkills: ["Kubernetes Ops"],
  },
  {
    id: "cand-2",
    rank: 2,
    initials: "PN",
    name: "Priya Nair",
    institution: "NIT Surathkal",
    degree: "B.Tech Information Tech (2023)",
    experience: "2 Years",
    score: 72,
    verd: "Mixed",
    verdClass: "verd-mixed",
    reqScore: 52,
    prefScore: 12,
    expScore: 8,
    evidence:
      "Built backend data pipelines using FastAPI and PostgreSQL, implementing vector similarity search for recommendation systems on AWS container services.",
    matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    missingSkills: ["pgvector Tuning", "Redis Cache Tier"],
  },
  {
    id: "cand-3",
    rank: 3,
    initials: "RV",
    name: "Rohan Verma",
    institution: "BITS Pilani",
    degree: "B.E. Electrical & Electronics",
    experience: "1 Year",
    score: 41,
    verd: "Weak",
    verdClass: "verd-weak",
    reqScore: 28,
    prefScore: 5,
    expScore: 8,
    evidence:
      "Developed basic REST APIs using Flask and SQLite for university research portal. Familiar with standard Python scripting and Git version control.",
    matchedSkills: ["Python", "Git"],
    missingSkills: ["FastAPI", "PostgreSQL", "pgvector", "Docker", "Redis"],
  },
];

export function HeroSection() {
  const [selectedApplicant, setSelectedApplicant] = useState(HERO_APPLICANTS[0]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-14 lg:pt-12 lg:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Thesis & Direct CTAs */}
        <div className="lg:col-span-5 space-y-6 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-[var(--brand-soft)] text-[var(--brand-primary)] border border-[var(--brand-border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-evidence)] animate-pulse" />
            <span>Candidate Screening Instrument</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] leading-[1.08] tracking-tight text-[var(--text-primary)]">
            Stop skimming resumes.
            <br />
            <span className="gradient-text">
              See the evidence behind every shortlist.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
            Merix screens 100 candidate resumes in 8 minutes against your exact 70/20/10 rubric.
            AI surfaces verbatim quotes from each PDF — you make every advance call with total confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="btn-gradient flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs text-white cursor-pointer"
            >
              <span>Start Batch Screening Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-elevated)] border border-[var(--border-hairline)] transition-colors cursor-pointer"
            >
              <span>How It Works</span>
            </a>
          </div>

          <div className="pt-2 flex items-start gap-2.5 text-xs text-[var(--text-muted)] font-mono">
            <Check className="w-4 h-4 text-[var(--accent-evidence)] shrink-0 mt-0.5" />
            <span>
              <strong>Merix never auto-rejects.</strong> Every applicant reaches you with the evidence to decide.
            </span>
          </div>
        </div>

        {/* Right Column: EMBEDDED REAL PRODUCT UI (Truffle-Style Live Candidate Stage) */}
        <div className="lg:col-span-7">
          <div className="merix-card card-glow overflow-hidden animate-float">
            <div className="px-5 py-3.5 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-evidence)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Senior Backend Engineer</span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">• 24 Ingested</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[var(--accent-evidence)] bg-[var(--accent-evidence-soft)] px-2 py-0.5 rounded border border-[var(--accent-evidence-border)]">
                  3 Sample Candidates
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)]">
              {/* Candidate Rail (Left 5 cols) */}
              <div className="sm:col-span-5 p-3 space-y-2 bg-[var(--bg-surface)]">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">
                  Ranked by Overall Fit:
                </div>
                {HERO_APPLICANTS.map((cand) => {
                  const isSelected = selectedApplicant.id === cand.id;
                  return (
                    <button
                      key={cand.id}
                      onClick={() => setSelectedApplicant(cand)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-[var(--brand-soft)] border-[var(--brand-border)] shadow-xs ring-1 ring-[var(--brand-border)]"
                          : "bg-[var(--bg-subtle)] border-transparent hover:border-[var(--border-hairline)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] text-[var(--bg-canvas)] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {cand.initials}
                        </div>
                        <div className="min-w-0 truncate">
                          <div className="font-bold text-xs text-[var(--text-primary)] truncate">{cand.name}</div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">{cand.institution}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-1.5">
                        <span className={cand.verdClass}>{cand.verd}</span>
                        <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{cand.score}</span>
                      </div>
                    </button>
                  );
                })}

                <div className="p-2 text-center text-[10px] font-mono text-[var(--text-muted)] border-t border-[var(--border-hairline)] pt-2">
                  +21 more applicants in this drive
                </div>
              </div>

              {/* Candidate Inspection Dossier (Right 7 cols) */}
              <div className="sm:col-span-7 p-5 space-y-4 bg-[var(--bg-surface)]">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
                  <div>
                    <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                      <span>{selectedApplicant.name}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">({selectedApplicant.experience} YOE)</span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5">
                      {selectedApplicant.degree} • {selectedApplicant.institution}
                    </div>
                  </div>
                  <ScoreRing score={selectedApplicant.score} size={54} strokeWidth={5} />
                </div>

                {/* 70/20/10 Score Gauge */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[var(--text-secondary)]">Required Technical (70% wt)</span>
                    <span className="font-bold text-[var(--brand-primary)]">{selectedApplicant.reqScore}/70</span>
                  </div>
                  <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--brand-primary)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(selectedApplicant.reqScore / 70) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Verbatim Monospace Citation Quote */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Verbatim Resume Quote (Monospace Evidence):
                  </div>
                  <div className="forensic-citation">&ldquo;{selectedApplicant.evidence}&rdquo;</div>
                </div>

                {/* Skills Grid */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplicant.matchedSkills.map((sk) => (
                    <span key={sk} className="tag-evidence">✓ {sk}</span>
                  ))}
                  {selectedApplicant.missingSkills.map((sk) => (
                    <span key={sk} className="tag-gap">✕ {sk}</span>
                  ))}
                </div>

                {/* Recruiter Advance Toolbar */}
                <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">Recruiter Decision:</span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-evidence-soft)] text-[var(--accent-evidence)] border border-[var(--accent-evidence-border)] hover:bg-[var(--accent-evidence)] hover:text-white transition-colors cursor-pointer">✓ Advance</button>
                    <button className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-gap-soft)] text-[var(--accent-gap)] border border-[var(--accent-gap-border)] transition-colors cursor-pointer">Hold</button>
                    <button className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-danger-soft)] text-[var(--accent-danger)] border border-[var(--accent-danger-border)] transition-colors cursor-pointer">Purge</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Ticker (Just below Hero - Truffle style) */}
      <div className="mt-12 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-primary)]">
            <CountUp to={142} suffix=" Resumes" />
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)]">Screened across campus drives today</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--brand-primary)]">
            <CountUp to={116} suffix=" Shortlisted" />
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)]">With 100% verbatim proof citations</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--accent-evidence)]">
            &lt; <CountUp to={8} suffix=" Minutes" />
          </div>
          <div className="text-[11px] font-mono text-[var(--text-muted)]">Average 100-resume batch turnaround</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-primary)]">0 Auto-Rejects</div>
          <div className="text-[11px] font-mono text-[var(--text-muted)]">Every applicant reaches human review</div>
        </div>
      </div>
    </section>
  );
}
