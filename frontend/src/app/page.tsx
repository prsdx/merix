"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";
import { CountUp } from "@/components/count-up";
import { ScoreRing } from "@/components/score-ring";
import { ThemeToggle } from "@/components/theme-toggle";

const SIM_CANDIDATES = [
  {
    id: "cand-1",
    name: "Aditya Sharma",
    role: "Senior Backend Engineer",
    institution: "IIT Bombay",
    score: 94,
    skills: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Redis", "Docker"],
    evidence:
      "Architected distributed async ingestion services with FastAPI and PostgreSQL pgvector, processing 5M+ vector queries daily at sub-50ms latency.",
    missingGaps: ["Kubernetes Cluster Ops"],
    reqWeight: 96,
    prefWeight: 90,
    expWeight: 95,
  },
  {
    id: "cand-2",
    name: "Priya Nair",
    role: "AI / ML Systems Engineer",
    institution: "NIT Surathkal",
    score: 72,
    skills: ["Python", "PyTorch", "FastAPI", "Docker", "pgvector"],
    evidence:
      "Deployed semantic search pipelines utilizing Gemini embeddings and pgvector storage across containerized clusters.",
    missingGaps: ["Redis Caching Tier", "Distributed Queues"],
    reqWeight: 75,
    prefWeight: 70,
    expWeight: 68,
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Match Scoring Logic",
    merix: "Deterministic 70/20/10 weighted formula with LLM semantic extraction",
    ats: "Opaque keyword frequency count (easily gamed by keyword stuffing)",
  },
  {
    feature: "Explainability & Evidence",
    merix: "Verbatim quotes cited directly from candidate resume for each skill",
    ats: "Zero evidence — black box match percentage with no rationale",
  },
  {
    feature: "India DPDP Act (2023) Compliance",
    merix: "Built-in: Consent timestamping, PII scrubbing, 90-day retention & erasure audit trail",
    ats: "No Indian compliance — candidate PII retained indefinitely without consent",
  },
  {
    feature: "Batch Screening Speed",
    merix: "100 resumes parsed and ranked against JD in under 10 minutes",
    ats: "Manual line-by-line screening taking 4+ hours per job opening",
  },
  {
    feature: "Audit Trail & Committee Defensibility",
    merix: "Append-only immutable audit logs for every evaluation, match, and deletion",
    ats: "No auditability — hiring decisions undefendable to placement committees",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "During our phase-1 placement drive, Merix allowed us to shortlist 450 engineering candidates across 6 companies in under 45 minutes with zero recruiter dispute on why candidates were ranked.",
    author: "Prof. Rajesh Kulkarni",
    role: "Head of Training & Placement",
    org: "Tier-1 Technical Institute, Pune",
  },
  {
    quote:
      "The DPDP compliance gate gives our enterprise clients complete confidence. We have candidate consent logged on immutable audit logs with automated 90-day data purging.",
    author: "Ananya Deshmukh",
    role: "VP of Talent Acquisition",
    org: "Apex Staffing Solutions, Bengaluru",
  },
  {
    quote:
      "Unlike standard ATS keyword matching that rejects developers because they wrote 'FastAPI' instead of 'REST API', Merix's semantic grounding found our top 3 backend hires immediately.",
    author: "Siddharth Rao",
    role: "Engineering Director",
    org: "Fintech Platform, Hyderabad",
  },
];

const FAQS = [
  {
    q: "How does Merix ensure compliance with India's DPDP Act 2023?",
    a: "Merix embeds compliance into every workflow: resume upload requires explicit consent confirmation stamped server-side, PII (phone numbers, personal emails, physical addresses) is scrubbed before LLM evaluation, all candidate data is automatically purged after 90 days (configurable per org), and candidates have a guaranteed Right to Erasure with auditable deletion.",
  },
  {
    q: "How is the 0–100 match score calculated?",
    a: "The match score is calculated deterministically: 70% weight for required technical skills, 20% weight for preferred nice-to-have skills, and 10% weight for verified years of experience. Every single matched skill cites verbatim evidence from the candidate's resume.",
  },
  {
    q: "What file formats and batch sizes are supported?",
    a: "Merix supports PDF resumes up to 5MB each. You can batch upload up to 100 resumes per job posting at once. Processing runs asynchronously in the background so you can monitor progress in real-time.",
  },
  {
    q: "Can I export shortlists to my existing ATS or Excel?",
    a: "Yes. Once batch matching completes, you can filter by score thresholds (80+, 70+, 60+) and export the full ranked shortlist with candidate names, scores, and matched skill summaries as a CSV spreadsheet with one click.",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState(SIM_CANDIDATES[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl glass-panel backdrop-blur-2xl transition-all">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white dark:text-[#0B0F17] font-display font-bold text-sm shadow-md group-hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
              }}
            >
              M
            </div>
            <span className="font-display text-lg tracking-tight font-semibold text-slate-900 dark:text-slate-100">
              Merix
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <DPDPBadge variant="pill" className="hidden sm:inline-flex" />
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                }}
              >
                Go to Pipeline
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-sm hover:opacity-95"
                  style={{
                    background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-teal-800 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>India DPDP Act (2023) Compliant AI</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
              Screen <span className="italic text-teal-700 dark:text-teal-400">100 Resumes</span> in 10 Minutes.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Deterministic 70/20/10 match scoring with verbatim citations, automated consent records, and instant ranked shortlists for Indian campus placement cells and staffing agencies.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                }}
              >
                <span>Start Screening Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <span>Sign In to Pipeline</span>
              </Link>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                100% PII Scrubbing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Instant CSV Export
              </span>
            </div>
          </div>

          {/* Hero Right Column: Interactive Simulator Card */}
          <div className="lg:col-span-6">
            <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl border border-slate-200/80 dark:border-white/10">
              {/* Simulator Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Live Match Simulator
                  </div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Target: Senior Backend Engineer (Python / FastAPI / pgvector)
                  </div>
                </div>
                <DPDPBadge variant="row" />
              </div>

              {/* Candidate Tabs */}
              <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                {SIM_CANDIDATES.map((cand) => {
                  const isSelected = selectedCandidate.id === cand.id;
                  return (
                    <button
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {cand.name} ({cand.institution})
                    </button>
                  );
                })}
              </div>

              {/* Score & Candidate Overview */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <ScoreRing score={selectedCandidate.score} size={74} strokeWidth={6} />
                <div className="space-y-1">
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {selectedCandidate.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCandidate.role} • {selectedCandidate.institution}
                  </div>
                  <div className="text-xs font-mono text-teal-700 dark:text-teal-400 font-medium">
                    {selectedCandidate.score >= 80 ? "✓ Strong Fit for Shortlist" : "⚠ Needs Manual Review"}
                  </div>
                </div>
              </div>

              {/* 70/20/10 Score Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between font-mono text-slate-600 dark:text-slate-400">
                  <span>Required Skills (70% weight)</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedCandidate.reqWeight}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-teal-600 dark:bg-teal-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedCandidate.reqWeight}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                <div className="flex justify-between font-mono text-slate-600 dark:text-slate-400 pt-1">
                  <span>Preferred Skills (20% weight)</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedCandidate.prefWeight}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedCandidate.prefWeight}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Verbatim Monospace Evidence */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Verbatim Monospace Evidence Citation:
                </div>
                <div className="evidence-quote text-slate-700 dark:text-slate-300">
                  &ldquo;{selectedCandidate.evidence}&rdquo;
                </div>
              </div>

              {/* Skill Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCandidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300"
                  >
                    ✓ {skill}
                  </span>
                ))}
                {selectedCandidate.missingGaps.map((gap) => (
                  <span
                    key={gap}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-orange-500/10 border border-orange-500/20 text-orange-800 dark:text-orange-300"
                  >
                    ✕ {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Trust Band */}
      <section className="w-full border-y border-slate-200 dark:border-white/10 py-12 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Adopted by placement cells, tech staffing agencies, and enterprise talent teams across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {["IIT Bombay", "NIT Surathkal", "BITS Pilani", "IIM Calcutta", "VIT Vellore", "Anna University"].map((inst) => (
              <div
                key={inst}
                className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 shadow-xs"
              >
                {inst}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Proof Metric Cards */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel rounded-2xl p-6 text-center space-y-2">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-teal-700 dark:text-teal-400">
              <CountUp to={100} suffix="+" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Resumes Screened per Batch
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-center space-y-2">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-indigo-700 dark:text-indigo-400">
              &lt; <CountUp to={10} suffix=" min" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Average Pipeline Turnaround
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-center space-y-2">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-400">
              <CountUp to={100} suffix="%" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Verbatim Monospace Citations
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-center space-y-2">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-700 dark:text-amber-400">
              <CountUp to={90} suffix=" Days" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Automated DPDP Retention Purge
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Architectural Pillars */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Enterprise Architectural Foundation
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 dark:text-slate-100">
            Why Hiring Teams Trust Merix Over Legacy ATS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="glass-panel rounded-2xl p-7 space-y-4 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Deterministic 70/20/10 Matching
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No hallucinated scores. Every evaluation strictly assigns 70% weight to mandatory skills, 20% to preferred skills, and 10% to experience with verified citations.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-teal-700 dark:text-teal-400">
              ✓ Defensible to placement committees
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel rounded-2xl p-7 space-y-4 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                High-Throughput Async Batching
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drop 100+ PDF resumes at once. Our async background worker processes documents concurrently with live polling status without UI lockups or timeouts.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-indigo-700 dark:text-indigo-400">
              ✓ 100 resumes in &lt;10 minutes
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel rounded-2xl p-7 space-y-4 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                India DPDP Act (2023) Built-In
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Affirmative consent timestamping, PII redaction before LLM calls, automated 90-day retention policies, and one-click Right to Erasure deletion.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-emerald-700 dark:text-emerald-400">
              ✓ Immutable audit logs for compliance
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Comparative Analysis
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100">
              Merix vs Legacy Keyword ATS
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-mono uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4 text-teal-700 dark:text-teal-400 font-bold">Merix AI Platform</th>
                  <th className="py-3 px-4 text-slate-500 dark:text-slate-400">Traditional Keyword ATS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>{row.merix}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold shrink-0">✕</span>
                        <span>{row.ats}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Validated Results
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100">
            Trusted by Talent Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-white/10 flex flex-col justify-between"
            >
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-0.5">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.author}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div>
                <div className="text-xs font-mono text-teal-700 dark:text-teal-400">{t.org}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            Clarity & FAQs
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Closing CTA */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div
          className="rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
          }}
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl text-white font-normal tracking-tight">
              Ready to Upgrade Your Hiring Pipeline?
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Create an organization account today. Upload your job descriptions, evaluate up to 100 resumes in minutes, and stay 100% compliant with India&apos;s DPDP Act.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md hover:scale-[1.02] transition-transform"
            >
              Create Free Organization Account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              Sign In to Pipeline
            </Link>
          </div>

          <div className="pt-2 text-xs text-white/80 font-mono">
            India DPDP Act (2023) Protected • Enterprise SLA & On-Prem Options Available
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-white/10 py-10 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-slate-800 dark:text-slate-200">Merix</span>
            <span>— AI Resume-to-JD Matching Platform for India</span>
          </div>
          <div className="font-mono">
            Compliant with Digital Personal Data Protection Act, 2023
          </div>
        </div>
      </footer>
    </div>
  );
}
