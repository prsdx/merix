"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Search,
  Check,
  X,
  Play,
  RotateCcw,
  Sliders,
  Clock,
  Layers,
  ArrowUpRight,
  Database,
  Building,
} from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";
import { CountUp } from "@/components/count-up";
import { ScoreRing } from "@/components/score-ring";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNavbar } from "@/components/app-navbar";

// Preloaded candidates for the ATS Hero Stage (Truffle / Factorial inspired)
const HERO_CANDIDATES = [
  {
    id: "cand-1",
    name: "Aditya Sharma",
    institution: "IIT Bombay",
    degree: "B.Tech Computer Science (2022)",
    experience: "3.5 Years",
    score: 94,
    reqScore: 68,
    prefScore: 18,
    expScore: 10,
    status: "Strong Fit",
    statusColor: "emerald",
    evidence:
      "Architected distributed async microservices with FastAPI and PostgreSQL pgvector, processing 5M+ vector queries daily at sub-50ms latency in Docker clusters.",
    matchedSkills: ["Python 3.11+", "FastAPI AsyncIO", "PostgreSQL", "pgvector", "Docker", "Redis"],
    missingSkills: ["Kubernetes Cluster Ops"],
  },
  {
    id: "cand-2",
    name: "Priya Nair",
    institution: "NIT Surathkal",
    degree: "B.Tech Information Tech (2023)",
    experience: "2 Years",
    score: 72,
    reqScore: 52,
    prefScore: 12,
    expScore: 8,
    status: "Good Match",
    statusColor: "amber",
    evidence:
      "Built backend data pipelines using FastAPI and PostgreSQL, implementing vector similarity search for recommendation systems on AWS container services.",
    matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    missingSkills: ["pgvector", "Redis Caching Tier"],
  },
  {
    id: "cand-3",
    name: "Rohan Verma",
    institution: "BITS Pilani",
    degree: "B.E. Electrical & Electronics",
    experience: "1 Year",
    score: 41,
    reqScore: 28,
    prefScore: 5,
    expScore: 8,
    status: "Needs Review",
    statusColor: "rose",
    evidence:
      "Developed basic REST APIs using Flask and SQLite for university research portal. Familiar with standard Python scripting and Git version control.",
    matchedSkills: ["Python", "Git"],
    missingSkills: ["FastAPI", "PostgreSQL", "pgvector", "Docker", "Redis"],
  },
];

// Interactive Jobscan-style Sandbox Profiles
const SANDBOX_JDS = [
  {
    id: "backend",
    title: "Senior Backend Engineer",
    company: "Fintech Platform (Bengaluru)",
    yoe: "3-5 Years",
    reqSkills: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Docker"],
    prefSkills: ["Redis", "LLM APIs", "CI/CD"],
    candidateScore: 94,
    candidateEvidence: "Led high-throughput FastAPI microservice migration, tuning pgvector HNSW indexing for 10x query speedup.",
  },
  {
    id: "ai-ml",
    title: "AI / ML Systems Engineer",
    company: "AI Intelligence Corp (Hyderabad)",
    yoe: "2-4 Years",
    reqSkills: ["Python", "PyTorch", "Embeddings", "FastAPI", "Vector Search"],
    prefSkills: ["vLLM", "Groq API", "PostgreSQL"],
    candidateScore: 88,
    candidateEvidence: "Fine-tuned domain embedding models and engineered RAG pipelines handling 200k monthly candidate profile evaluations.",
  },
  {
    id: "campus",
    title: "Campus Software Trainee",
    company: "Enterprise SaaS (Pune)",
    yoe: "0-1 Year (Freshers)",
    reqSkills: ["Python or Java", "Data Structures", "SQL", "Git"],
    prefSkills: ["FastAPI", "Linux", "Docker"],
    candidateScore: 96,
    candidateEvidence: "Built university capstone project with Python and PostgreSQL; solved 400+ LeetCode algorithmic problems.",
  },
];

// Factorial-inspired Product Showcase Tabs
const PRODUCT_TABS = [
  {
    id: "batch",
    title: "1. Batch Ingestion & PII Scrubbing",
    shortDesc: "Upload 100+ PDF resumes in seconds",
    fullDesc:
      "Drop your entire applicant pool at once. Our ingestion pipeline verifies PDF magic bytes, scrubs sensitive personal identifiers (phone, private email, home address) before semantic processing, and timestamps affirmative consent on immutable audit logs.",
    highlight: "100 PDFs in <8 Minutes",
    stats: "100% PII Redacted",
  },
  {
    id: "scoring",
    title: "2. Deterministic 70/20/10 Formula",
    shortDesc: "Mathematically defensible match scores",
    fullDesc:
      "Eliminate black-box hallucinations. Merix strictly calculates scores using 70% mandatory technical skills, 20% preferred nice-to-haves, and 10% verified years of experience. Every single score point is backed by auditable evidence.",
    highlight: "0% Hallucination Risk",
    stats: "Defensible to Placement Cells",
  },
  {
    id: "evidence",
    title: "3. Verbatim Monospace Citations",
    shortDesc: "Every matched skill cites the exact resume line",
    fullDesc:
      "Never wonder why a candidate was ranked #1 or #50. Merix extracts verbatim quote citations directly from the resume for each required skill, so recruiters verify competencies in 5 seconds instead of re-reading 4-page resumes.",
    highlight: "Exact Quote Grounding",
    stats: "5-Second Verification",
  },
  {
    id: "dpdp",
    title: "4. India DPDP Act (2023) Auto-Purge",
    shortDesc: "Automated consent gates & 90-day lifecycle",
    fullDesc:
      "Stay 100% compliant with India's data protection laws. Every batch requires affirmative recruiter consent confirmation, data is isolated via Row-Level Security, and candidate resumes are automatically wiped after 90 days with one-click Right to Erasure.",
    highlight: "Section 12 Compliant",
    stats: "Automated 90-Day Retention",
  },
];

// ATS vs Merix Comparison Rows (Jobscan style)
const COMPARISON_ROWS = [
  {
    criteria: "Scoring Methodology",
    ats: "Keyword string matching (easily tricked by white font keyword stuffing)",
    merix: "Deterministic 70/20/10 weighted formula with semantic skill extraction",
  },
  {
    criteria: "Explainability & Evidence",
    ats: "Black-box match % with zero explanation or proof citations",
    merix: "Verbatim quotes cited directly from the candidate resume for every skill",
  },
  {
    criteria: "False Rejection Rate",
    ats: "High (>40% rejected for phrasing 'FastAPI' instead of 'REST API')",
    merix: "<2% false negatives due to conceptual semantic understanding",
  },
  {
    criteria: "India DPDP Act (2023) Ready",
    ats: "None — resumes stored indefinitely without consent records",
    merix: "Built-in consent timestamping, PII scrubbing & 90-day automated purge",
  },
  {
    criteria: "Batch Screening Speed",
    ats: "Manual recruiter review: 4+ hours per 100 resumes",
    merix: "Automated async batch processing: 100 resumes in <8 minutes",
  },
  {
    criteria: "Committee Defensibility",
    ats: "Undefendable to campus placement heads or enterprise audit boards",
    merix: "Immutable append-only audit trail with line-by-line evidence justification",
  },
];

// Frequently Asked Questions
const FAQS = [
  {
    q: "How does Merix differ from legacy keyword-based ATS systems?",
    a: "Traditional ATS tools simply count exact word matches, rejecting great engineers who write 'FastAPI' instead of 'REST API' or favoring candidates who keyword-stuff. Merix uses semantic AI extraction to understand technical competency, then computes a strict, deterministic 70/20/10 weighted score with verbatim resume citations for total transparency.",
  },
  {
    q: "How does Merix ensure compliance with India's DPDP Act 2023?",
    a: "Compliance is baked directly into the platform architecture: recruiters must affirm candidate consent before uploading, all PII (phone numbers, personal emails, physical addresses) is redacted before LLM evaluation, all resumes auto-purge after your org's retention window (default 90 days), and candidate Right to Erasure can be executed in one click with an immutable audit log.",
  },
  {
    q: "Can campus placement cells handle 500+ student resumes in one drive?",
    a: "Yes. Merix is built for high-throughput batching. You can upload up to 100 PDF resumes at a time per batch job, with background async workers processing documents in parallel. The entire shortlist is ready and downloadable as a ranked CSV spreadsheet in minutes.",
  },
  {
    q: "Can I export shortlists into Excel or my existing ATS?",
    a: "Yes. You can filter the candidate leaderboard by score thresholds (80+ Strong Fit, 70+ Good Fit, 60+ Moderate Fit) and export the full ranked list with candidate names, scores, and matched skill summaries as a CSV spreadsheet with one click.",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [selectedHeroCandidate, setSelectedHeroCandidate] = useState(HERO_CANDIDATES[0]);
  const [selectedSandboxJd, setSelectedSandboxJd] = useState(SANDBOX_JDS[0]);
  const [activeProductTab, setActiveProductTab] = useState(PRODUCT_TABS[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [applicantVolume, setApplicantVolume] = useState<number>(250);

  // Recruiter ROI calculations
  const hoursManual = ((applicantVolume * 3.5) / 60).toFixed(1);
  const minutesMerix = Math.ceil((applicantVolume / 100) * 8);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0E1A] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Announcement Bar */}
      <div className="w-full bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span>Now live for Indian campus placement cells &amp; tech staffing agencies.</span>
        <span className="text-blue-400 font-mono hidden sm:inline">• India DPDP Act (2023) Compliant</span>
      </div>

      <AppNavbar />

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 lg:pt-14 lg:pb-24">
        {/* Hero Copy Header */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="tracking-wide">AI-POWERED CANDIDATE SCREENING PLATFORM</span>
          </div>

          {/* Main Headline (Bold grotesque sans, tight tracking) */}
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Screen <span className="text-blue-600 dark:text-blue-400">100 Resumes</span> in 8 Minutes.
            <br />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">With Evidence to Show Why.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Deterministic 70/20/10 match scoring, verbatim resume citations, and automated India DPDP (2023) compliance. Turn piles of applicant PDFs into an auditable ranked shortlist.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Screening Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current text-blue-600 dark:text-blue-400" />
              <span>Explore Live Sandbox</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              100% PII Scrubbed
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              Instant CSV Shortlist Export
            </span>
          </div>
        </div>

        {/* HERO ATS INTERACTIVE SCREENING STAGE (Truffle & Factorial ATS inspired) */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Animated scanning beam overlay */}
            <div className="scan-line" />

            {/* Stage Header / Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  JD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Senior Backend Engineer (Python / FastAPI / pgvector)</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Screening
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Batch #MX-9281 • 24 Applicants Processed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DPDPBadge variant="row" />
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  3 Candidates Sample
                </span>
              </div>
            </div>

            {/* Split Stage Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
              {/* Left Rail: Candidate Stream */}
              <div className="md:col-span-5 p-4 space-y-2.5 bg-slate-50/40 dark:bg-slate-900/40">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pb-1">
                  Ranked Applicant Stream (Click to Inspect)
                </div>

                {HERO_CANDIDATES.map((cand, idx) => {
                  const isSelected = selectedHeroCandidate.id === cand.id;
                  return (
                    <button
                      key={cand.id}
                      onClick={() => setSelectedHeroCandidate(cand)}
                      className={`w-full p-3.5 rounded-xl text-left transition-all relative border flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                          : "bg-white/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            cand.score >= 80 ? "bg-emerald-600" : cand.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                        >
                          {cand.name.charAt(0)}
                        </div>

                        <div className="min-w-0 truncate">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {cand.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                            {cand.institution} • #{idx + 1}
                          </div>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                            cand.score >= 80
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : cand.score >= 60
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {cand.score}% Match
                        </span>
                      </div>
                    </button>
                  );
                })}

                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 font-mono">
                  +21 more candidates evaluated in this batch
                </div>
              </div>

              {/* Right Panel: Active Candidate Dossier Inspector */}
              <div className="md:col-span-7 p-6 space-y-5 bg-white dark:bg-slate-900">
                {/* Dossier Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {selectedHeroCandidate.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        ({selectedHeroCandidate.experience} YOE)
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      {selectedHeroCandidate.degree} • {selectedHeroCandidate.institution}
                    </div>
                  </div>

                  {/* Score Ring */}
                  <div className="shrink-0 flex flex-col items-center">
                    <ScoreRing score={selectedHeroCandidate.score} size={64} strokeWidth={6} />
                  </div>
                </div>

                {/* 70/20/10 Deterministic Weight Breakdown Bars */}
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    70/20/10 Deterministic Weight Breakdown:
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-700 dark:text-slate-300">Required Skills (70%)</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {selectedHeroCandidate.reqScore}/70
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedHeroCandidate.reqScore / 70) * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-700 dark:text-slate-300">Preferred Qualifications (20%)</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {selectedHeroCandidate.prefScore}/20
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-amber-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedHeroCandidate.prefScore / 20) * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Verbatim Monospace Evidence Box */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Verbatim Evidence Citation (From Candidate Resume):
                  </div>
                  <div className="evidence-quote text-slate-800 dark:text-slate-200">
                    &ldquo;{selectedHeroCandidate.evidence}&rdquo;
                  </div>
                </div>

                {/* Skill Chips */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Skill Extraction Mapping:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHeroCandidate.matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                    {selectedHeroCandidate.missingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80"
                      >
                        ✕ {sk} (Gap)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recruiter Decision Toolbar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    Recruiter Action:
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors">
                      ✓ Advance to Interview
                    </button>
                    <button className="px-3 py-1.5 rounded-lg font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors">
                      Hold
                    </button>
                    <button className="px-2.5 py-1.5 rounded-lg font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors">
                      DPDP Purge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Trust Band */}
      <section className="w-full border-y border-slate-200 dark:border-slate-800 py-10 bg-slate-50/60 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Trusted by placement teams &amp; talent agencies across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              "IIT Bombay Placement Cell",
              "NIT Surathkal Training & Placement",
              "BITS Pilani Placement Division",
              "IIM Calcutta Career Services",
              "VIT Vellore Placement Bureau",
              "Apex Staffing (Bengaluru)",
              "TechRecruit India (Pune)",
            ].map((inst) => (
              <div
                key={inst}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-xs"
              >
                {inst}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Proof Metric Counters */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
              <CountUp to={100} suffix="+" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Resumes Screened per Batch
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              &lt; <CountUp to={8} suffix=" min" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              End-to-End Pipeline Turnaround
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
              <CountUp to={100} suffix="%" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Verbatim Monospace Citations
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400">
              <CountUp to={90} suffix=" Days" />
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Automated DPDP Retention Purge
            </div>
          </div>
        </div>
      </section>

      {/* JOBSCAN-INSPIRED LIVE INTERACTIVE MATCH SANDBOX */}
      <section id="simulator" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-8 shadow-lg">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60">
              <span>INTERACTIVE RESUME-TO-JD MATCH TESTER</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Test Semantic Matching Live
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select a target role below to see how Merix extracts required technical requirements and calculates exact evidence-grounded match scores in real time.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {SANDBOX_JDS.map((jd) => {
              const active = selectedSandboxJd.id === jd.id;
              return (
                <button
                  key={jd.id}
                  onClick={() => setSelectedSandboxJd(jd)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  {jd.title} ({jd.yoe})
                </button>
              );
            })}
          </div>

          {/* Sandbox Live Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: JD Extraction Target */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedSandboxJd.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {selectedSandboxJd.company} • Experience: {selectedSandboxJd.yoe}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  Target JD
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    REQUIRED TECHNICAL SKILLS (70% WEIGHT):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSandboxJd.reqSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    PREFERRED NICE-TO-HAVES (20% WEIGHT):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSandboxJd.prefSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Candidate Evaluated Score & Citation */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Grounded Candidate Evaluation Result
                  </span>
                </div>
                <DPDPBadge variant="row" />
              </div>

              <div className="flex items-center gap-5">
                <ScoreRing score={selectedSandboxJd.candidateScore} size={70} strokeWidth={6} />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Match Confidence: {selectedSandboxJd.candidateScore}%
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                    ✓ High Shortlist Recommendation
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Extracted Resume Quote Citation:
                </div>
                <div className="evidence-quote text-slate-800 dark:text-slate-200">
                  &ldquo;{selectedSandboxJd.candidateEvidence}&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FACTORIAL HR-INSPIRED TABBED CAPABILITIES SHOWCASE */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60">
            <span>END-TO-END PRODUCT TOUR</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            How Merix Powers High-Volume Screening
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRODUCT_TABS.map((tab) => {
            const active = activeProductTab.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveProductTab(tab)}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                  active
                    ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div
                  className={`text-xs font-bold ${
                    active ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {tab.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {tab.shortDesc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Preview Display */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {activeProductTab.highlight}
            </div>
            <h3 className="font-sans text-2xl font-bold text-slate-900 dark:text-white">
              {activeProductTab.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeProductTab.fullDesc}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {activeProductTab.stats}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Live Architecture Inspection
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Security:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Row-Level Multi-Tenant Isolation
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">LLM Provider:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Zero Data Training Agreement
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Audit Compliance:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Immutable Append-Only Log
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX (Jobscan & Truffle Style) */}
      <section id="comparison" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60">
              <span>COMPARATIVE ANALYSIS</span>
            </div>
            <h2 className="font-sans text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Merix vs Legacy Keyword ATS
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-4 px-4">Evaluation Dimension</th>
                  <th className="py-4 px-4 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20">
                    Merix Semantic AI Platform
                  </th>
                  <th className="py-4 px-4 text-slate-500">Traditional Keyword ATS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {row.criteria}
                    </td>
                    <td className="py-4 px-4 text-slate-800 dark:text-slate-200 bg-blue-50/30 dark:bg-blue-950/10 font-medium">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                        <span>{row.merix}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 stroke-[3]" />
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

      {/* RECRUITER ROI & TIME SAVED CALCULATOR */}
      <section id="calculator" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-600 dark:bg-blue-700 text-white shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight">
              Calculate Your Hiring Hours Saved
            </h2>
            <p className="text-blue-100 text-sm">
              Adjust the slider to see how much manual screening time Merix saves your recruiters each month.
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex justify-between items-center text-xs font-mono font-semibold">
              <span>Applicants per Drive:</span>
              <span className="text-xl font-bold bg-white text-blue-700 px-3 py-1 rounded-lg">
                {applicantVolume} Resumes
              </span>
            </div>

            <input
              type="range"
              min={25}
              max={1000}
              step={25}
              value={applicantVolume}
              onChange={(e) => setApplicantVolume(parseInt(e.target.value))}
              className="w-full h-2.5 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center pt-4">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
              <div className="text-xs text-blue-100 font-mono">Manual Review Time</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">~{hoursManual} Hours</div>
            </div>

            <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-lg space-y-1">
              <div className="text-xs text-blue-700 font-mono font-bold">Merix Batch Run</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">&lt; {minutesMerix} Minutes</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
              <div className="text-xs text-blue-100 font-mono">Time Reduction</div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-300">96% Faster</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Testimonials */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60">
            <span>VERIFIED ADOPTION</span>
          </div>
          <h2 className="font-sans text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Loved by Campus &amp; Agency Recruiters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &ldquo;During our day-1 campus drive, Merix allowed us to evaluate 400 engineering candidates across 5 companies in under 35 minutes with 0 recruiter disputes.&rdquo;
            </p>
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <div className="font-bold text-xs text-slate-900 dark:text-white">Prof. Rajesh Kulkarni</div>
              <div className="text-[11px] text-slate-500 font-mono">Training &amp; Placement Cell, Pune</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &ldquo;The DPDP Act compliance audit log is a game changer for our enterprise clients. Candidate consent is verified server-side with automatic 90-day data purging.&rdquo;
            </p>
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <div className="font-bold text-xs text-slate-900 dark:text-white">Ananya Deshmukh</div>
              <div className="text-[11px] text-slate-500 font-mono">VP of Talent, Bengaluru Staffing</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &ldquo;Unlike keyword ATS tools that reject backend devs because they wrote 'FastAPI' instead of 'REST API', Merix's verbatim citations found our top hires immediately.&rdquo;
            </p>
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <div className="font-bold text-xs text-slate-900 dark:text-white">Siddharth Rao</div>
              <div className="text-[11px] text-slate-500 font-mono">Engineering Director, Hyderabad</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60">
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="font-sans text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Closing CTA */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-3xl p-8 sm:p-14 text-center space-y-6 bg-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Upgrade Your Screening Pipeline?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Create an organization account today. Post your Job Description, batch upload up to 100 candidate resumes, and get ranked results in under 8 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-transform hover:scale-[1.02]"
            >
              Create Free Organisation Account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Sign In to Pipeline
            </Link>
          </div>

          <div className="pt-3 text-[11px] font-mono text-slate-400">
            India DPDP Act (2023) Protected • Row-Level Security Isolation
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-10 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Merix</span>
            <span>— AI Resume-to-JD Matching Platform for India</span>
          </div>
          <div className="font-mono text-[11px]">
            Compliant with Digital Personal Data Protection Act, 2023
          </div>
        </div>
      </footer>
    </div>
  );
}
