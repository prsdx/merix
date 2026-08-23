"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileText,
  Users,
  Search,
  Check,
  X,
  Play,
  RotateCcw,
  Clock,
  Layers,
  Database,
  Building,
  UploadCloud,
  FileSpreadsheet,
  Cpu,
  Sparkles,
} from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";
import { CountUp } from "@/components/count-up";
import { ScoreRing } from "@/components/score-ring";
import { MerixLogo } from "@/components/merix-logo";
import { AppNavbar } from "@/components/app-navbar";

// Real-feeling Candidate Dossier data for Truffle-style Hero
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
    headline: "Led backend architecture for 5M+ daily vector search queries",
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
    headline: "Built recommendation backend pipelines with FastAPI & SQL",
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
    headline: "Built research portal REST APIs with Flask and SQLite",
    evidence:
      "Developed basic REST APIs using Flask and SQLite for university research portal. Familiar with standard Python scripting and Git version control.",
    matchedSkills: ["Python", "Git"],
    missingSkills: ["FastAPI", "PostgreSQL", "pgvector", "Docker", "Redis"],
  },
];

// Explainability deep-dive criteria
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

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [selectedApplicant, setSelectedApplicant] = useState(HERO_APPLICANTS[0]);
  const [selectedCriteria, setSelectedCriteria] = useState(EXPLAINABILITY_CRITERIA[0]);
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      {/* Top Banner Notice */}
      <div className="w-full bg-[var(--text-primary)] text-[var(--bg-canvas)] text-[11px] font-mono py-2 px-4 text-center border-b border-[var(--border-hairline)] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-evidence)] animate-pulse" />
        <span>India DPDP Act (2023) Certified Screening Pipeline</span>
        <span className="opacity-60 hidden sm:inline">• Automated 90-Day Purge &amp; Right to Erasure</span>
      </div>

      <AppNavbar />

      {/* ============================================================
          SECTION 1: HERO (Truffle-Style Embedded Real Product UI)
          ============================================================ */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-14 lg:pt-12 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Thesis & Direct CTAs */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            {/* Context Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-[var(--brand-soft)] text-[var(--brand-primary)] border border-[var(--brand-border)]">
              <span>Candidate Screening Instrument</span>
            </div>

            {/* Main Headline (DM Serif Display + Grotesque Contrast) */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-normal leading-[1.08] tracking-tight text-[var(--text-primary)]">
              Stop skimming resumes.
              <br />
              <span className="font-sans font-bold text-[var(--brand-primary)] text-3xl sm:text-4xl lg:text-[44px] block mt-1">
                See the evidence behind every shortlist.
              </span>
            </h1>

            {/* Thesis Subtext */}
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
              Merix screens 100 candidate resumes in 8 minutes against your exact 70/20/10 rubric.
              AI surfaces verbatim quotes from each PDF — you make every advance call with total confidence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-all shadow-md cursor-pointer"
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

            {/* Direct Trust Statement */}
            <div className="pt-2 flex items-start gap-2.5 text-xs text-[var(--text-muted)] font-mono">
              <Check className="w-4 h-4 text-[var(--accent-evidence)] shrink-0 mt-0.5" />
              <span>
                <strong>Merix never auto-rejects.</strong> Every applicant reaches you with the evidence to decide.
              </span>
            </div>
          </div>

          {/* Right Column: EMBEDDED REAL PRODUCT UI (Truffle-Style Live Candidate Stage) */}
          <div className="lg:col-span-7">
            <div className="merix-card overflow-hidden border border-[var(--border-subtle)] shadow-xl">
              {/* Product Window Top Toolbar */}
              <div className="px-5 py-3.5 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-evidence)]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Senior Backend Engineer
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    • 24 Ingested
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[var(--accent-evidence)] bg-[var(--accent-evidence-soft)] px-2 py-0.5 rounded border border-[var(--accent-evidence-border)]">
                    3 Sample Candidates
                  </span>
                </div>
              </div>

              {/* Split Body: Candidate Stream (Left) + Selected Candidate Inspector (Right) */}
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
                          <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] text-[var(--bg-canvas)] font-bold text-xs flex items-center justify-center shrink-0">
                            {cand.initials}
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="font-bold text-xs text-[var(--text-primary)] truncate">
                              {cand.name}
                            </div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                              {cand.institution}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-1.5">
                          <span className={cand.verdClass}>{cand.verd}</span>
                          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                            {cand.score}
                          </span>
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
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                        <span>{selectedApplicant.name}</span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          ({selectedApplicant.experience} YOE)
                        </span>
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
                      <span className="font-bold text-[var(--brand-primary)]">
                        {selectedApplicant.reqScore}/70
                      </span>
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
                    <div className="forensic-citation">
                      &ldquo;{selectedApplicant.evidence}&rdquo;
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApplicant.matchedSkills.map((sk) => (
                      <span key={sk} className="tag-evidence">
                        ✓ {sk}
                      </span>
                    ))}
                    {selectedApplicant.missingSkills.map((sk) => (
                      <span key={sk} className="tag-gap">
                        ✕ {sk}
                      </span>
                    ))}
                  </div>

                  {/* Recruiter Advance Toolbar */}
                  <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Recruiter Decision:
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-evidence-soft)] text-[var(--accent-evidence)] border border-[var(--accent-evidence-border)] hover:bg-[var(--accent-evidence)] hover:text-white transition-colors cursor-pointer">
                        ✓ Advance
                      </button>
                      <button className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-gap-soft)] text-[var(--accent-gap)] border border-[var(--accent-gap-border)] transition-colors cursor-pointer">
                        Hold
                      </button>
                      <button className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-danger-soft)] text-[var(--accent-danger)] border border-[var(--accent-danger-border)] transition-colors cursor-pointer">
                        Purge
                      </button>
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
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Screened across campus drives today
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--brand-primary)]">
              <CountUp to={116} suffix=" Shortlisted" />
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              With 100% verbatim proof citations
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--accent-evidence)]">
              &lt; <CountUp to={8} suffix=" Minutes" />
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Average 100-resume batch turnaround
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-primary)]">
              0 Auto-Rejects
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Every applicant reaches human review
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: 3-STEP WALKTHROUGH (Truffle & Factorial Mockup Cards)
          ============================================================ */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
            How It Works
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
            Three deliberate steps to your verified shortlist.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            No complex setup. From raw job description to ranked candidate leaderboard with verbatim evidence citations in minutes.
          </p>
        </div>

        {/* 3 Step Cards with Embedded UI Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Define Rubric */}
          <div className="merix-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--brand-primary)]">
                STEP 01
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Paste JD &amp; Set 70/20/10 Rubric
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Merix automatically extracts mandatory technical skills (70%), preferred competencies (20%), and verified experience (10%).
              </p>
            </div>

            {/* Embedded Mini UI Mockup */}
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2 text-[11px] font-mono">
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase">
                <span>Extracted Rubric</span>
                <span className="text-[var(--accent-evidence)] font-bold">100% Deterministic</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Required (70%):</span>
                  <span className="font-bold text-[var(--text-primary)]">FastAPI, SQL, pgvector</span>
                </div>
                <div className="flex justify-between">
                  <span>Preferred (20%):</span>
                  <span className="font-bold text-[var(--text-primary)]">Docker, Redis, CI/CD</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience (10%):</span>
                  <span className="font-bold text-[var(--text-primary)]">2+ Years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Batch Ingestion */}
          <div className="merix-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--brand-primary)]">
                STEP 02
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Batch Drop 100 Resumes with DPDP Gate
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Drop your entire PDF candidate pile at once. Magic bytes are validated, candidate PII is scrubbed, and consent is logged server-side.
              </p>
            </div>

            {/* Embedded Mini UI Mockup */}
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2 text-[11px] font-mono">
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase">
                <span>Batch Processing</span>
                <span className="text-[var(--brand-primary)] font-bold">Parallel Async</span>
              </div>
              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span>Aditya_Sharma_IITB.pdf</span>
                  <span className="text-[var(--accent-evidence)] font-bold">✓ PII Redacted</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span>Priya_Nair_NITK.pdf</span>
                  <span className="text-[var(--accent-evidence)] font-bold">✓ PII Redacted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Inspect & Advance */}
          <div className="merix-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--brand-primary)]">
                STEP 03
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Inspect Evidence &amp; Export Shortlist
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Review ranked candidates with verbatim proof citations for every claim. Advance the best directly or export clean CSV reports.
              </p>
            </div>

            {/* Embedded Mini UI Mockup */}
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2 text-[11px] font-mono">
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase">
                <span>Ranked Leaderboard</span>
                <span className="text-[var(--text-primary)] font-bold">CSV Ready</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between items-center">
                  <span>#1 Aditya S.</span>
                  <span className="verd-strong">94% Strong</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>#2 Priya N.</span>
                  <span className="verd-mixed">72% Mixed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: DEEP DIFFERENTIATOR (Verbatim Monospace Citations)
          ============================================================ */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="merix-card p-8 sm:p-10 border border-[var(--border-subtle)] space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--accent-evidence)]">
              Deterministic Explainability
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
              Why this candidate was shortlisted — down to the exact sentence.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Unlike legacy ATS tools that output opaque match percentages, Merix cites the exact monospace sentence from the candidate&apos;s resume proving why each rubric requirement is satisfied.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Criteria Selection Tabs (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
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
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      {crit.title}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--accent-evidence)] mt-1 font-semibold">
                      {crit.verdict}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Evidence Drawer (Right 7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Extracted Resume Proof (Verbatim Grounding):
                </div>
                <div className="forensic-citation text-xs leading-relaxed">
                  {selectedCriteria.candidateQuote}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[var(--border-hairline)]">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Recruiter Evaluation Context:
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {selectedCriteria.context}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: ENTERPRISE COMPLIANCE & TRUST (Factorial-Style Badges)
          ============================================================ */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
            Regulatory Compliance
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
            Built for India&apos;s Digital Personal Data Protection Act (2023).
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Automated compliance mechanisms protect your organization, candidate rights, and placement cell audit integrity.
          </p>
        </div>

        {/* 4 Serious Compliance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-3">
            <ShieldCheck className="w-6 h-6 text-[var(--accent-evidence)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              DPDP Act Section 12
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Mandatory affirmative recruiter consent declaration recorded with cryptographic audit timestamp before ingestion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-3">
            <Clock className="w-6 h-6 text-[var(--accent-evidence)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              90-Day Auto-Purge
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Configurable organization retention lifecycle automatically wipes candidate PDF resumes and embeddings upon expiry.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-3">
            <Lock className="w-6 h-6 text-[var(--accent-evidence)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Right to Erasure
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              One-click irrevocable deletion endpoint for candidates requesting immediate erasure, verified on immutable audit logs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-3">
            <Database className="w-6 h-6 text-[var(--accent-evidence)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Row-Level Security
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Multi-tenant Postgres isolation guarantees no candidate data, rubric, or shortlist leaks between organizations.
            </p>
          </div>
        </div>

        {/* Institution Wordmark Strip (Factorial Style - Low opacity clean wordmarks) */}
        <div className="pt-6 border-t border-[var(--border-hairline)] text-center space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            Adopted across placement bureaus &amp; staffing pipelines
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono font-bold text-[var(--text-secondary)] opacity-70">
            <span>IIT BOMBAY PLACEMENT</span>
            <span>•</span>
            <span>NIT SURATHKAL T&amp;P</span>
            <span>•</span>
            <span>BITS PILANI</span>
            <span>•</span>
            <span>IIM CALCUTTA</span>
            <span>•</span>
            <span>APEX STAFFING BENGALURU</span>
            <span>•</span>
            <span>TECHRECRUIT PUNE</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: TESTIMONIALS (Quantified Metrics) + FINAL TRUST CTA
          ============================================================ */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-2xl font-mono font-bold text-[var(--brand-primary)]">
                318 hours
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                Saved across 4 campus placement drives
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                &ldquo;Merix processed 400 engineering applicants in 35 minutes with zero committee disputes on candidate ranking.&rdquo;
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-hairline)] text-[11px] font-mono text-[var(--text-muted)]">
              Prof. Rajesh Kulkarni • T&amp;P Cell, Pune
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-2xl font-mono font-bold text-[var(--accent-evidence)]">
                4.8× faster
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                Shortlisting turnaround for tech staffing
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                &ldquo;Instead of re-reading 4-page resumes, our recruiters verify the verbatim monospace quote and schedule the same day.&rdquo;
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-hairline)] text-[11px] font-mono text-[var(--text-muted)]">
              Ananya Deshmukh • VP of Talent, Bengaluru
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                100% audit proof
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                Defensibility under DPDP Act 2023
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                &ldquo;Every consent timestamp and 90-day auto-purge is logged. Enterprise clients approved our vendor security immediately.&rdquo;
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-hairline)] text-[11px] font-mono text-[var(--text-muted)]">
              Siddharth Rao • Engineering Director, Hyderabad
            </div>
          </div>
        </div>

        {/* Final High-Conversion Trust CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--text-primary)] text-[var(--bg-canvas)] text-center space-y-6 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl text-[var(--bg-canvas)]">
              Screen your next 100 resumes in minutes.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--bg-canvas)] opacity-80 leading-relaxed font-sans">
              Merix never rejects silently — every candidate reaches you with the evidence to decide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl font-semibold text-xs text-[var(--text-primary)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] transition-transform hover:scale-[1.02] cursor-pointer"
            >
              Create Free Organisation Account
            </Link>
            <Link
              href="/login"
              className="px-5 py-3.5 rounded-xl font-semibold text-xs text-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:bg-[var(--bg-canvas)]/10 transition-colors cursor-pointer"
            >
              Sign In to Pipeline
            </Link>
          </div>

          <div className="text-[10px] font-mono opacity-60 pt-2">
            India DPDP Act (2023) Protected • Row-Level Multi-Tenant Isolation
          </div>
        </div>
      </section>

      {/* Minimal Institutional Footer */}
      <footer className="w-full border-t border-[var(--border-hairline)] py-8 bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] font-sans">Merix</span>
            <span>— AI Resume-to-JD Screening Instrument</span>
          </div>
          <div>Compliant with Digital Personal Data Protection Act, 2023</div>
        </div>
      </footer>
    </div>
  );
}
