"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck2,
  Lock,
  Layers,
  Sparkles,
  Users,
  Timer,
  CheckCircle2,
  XCircle,
  BarChart3,
  Search,
  Command,
  Clock,
  Trash2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Building2,
  Scale,
  Play,
  RotateCcw,
} from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";

// Interactive Simulation Candidate Data
const SIM_CANDIDATES = [
  {
    id: "cand-1",
    name: "Aditya Sharma",
    role: "Senior Backend Lead",
    institution: "IIT Bombay",
    experience: "4.5 YOE",
    skills: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Redis", "Docker", "AsyncIO"],
    evidence: "Architected distributed async ingestion microservices with FastAPI and PostgreSQL pgvector, processing 5M+ vector queries daily at sub-50ms latency.",
    missingGaps: ["Kubernetes Cluster Ops"],
  },
  {
    id: "cand-2",
    name: "Priya Nair",
    role: "AI & ML Systems Engineer",
    institution: "NIT Surathkal",
    experience: "3.2 YOE",
    skills: ["Python", "PyTorch", "pgvector", "LLM Tooling", "Docker", "FastAPI"],
    evidence: "Fine-tuned transformer models and deployed semantic search pipelines utilizing Gemini embeddings and pgvector storage across containerized clusters.",
    missingGaps: ["Redis Caching Tier"],
  },
  {
    id: "cand-3",
    name: "Rohan Verma",
    role: "Junior Software Developer",
    institution: "BITS Pilani",
    experience: "1.5 YOE",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    evidence: "Built REST APIs using Django and PostgreSQL. Participated in migration of monolithic services to Docker containers.",
    missingGaps: ["FastAPI AsyncIO", "pgvector / Vector Search", "Redis"],
  },
];

const JOB_SKILLS = [
  { id: "python", name: "Python / FastAPI", weight: 35, required: true },
  { id: "pgvector", name: "PostgreSQL / pgvector", weight: 35, required: true },
  { id: "redis", name: "Redis Caching", weight: 15, required: false },
  { id: "docker", name: "Docker Containerization", weight: 15, required: false },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Interactive Match Sandbox State
  const [selectedCandidate, setSelectedCandidate] = useState(SIM_CANDIDATES[0]);
  const [activeTab, setActiveTab] = useState<"explainability" | "batch" | "dpdp">("explainability");
  const [resumeSliderValue, setResumeSliderValue] = useState(250);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dynamic Score Calculation for Simulator
  const calculateSimScore = () => {
    let score = 0;
    const candSkillsLower = selectedCandidate.skills.map((s) => s.toLowerCase());

    if (candSkillsLower.some((s) => s.includes("python") || s.includes("fastapi"))) score += 35;
    if (candSkillsLower.some((s) => s.includes("pgvector") || s.includes("postgresql"))) score += 35;
    if (candSkillsLower.some((s) => s.includes("redis"))) score += 15;
    if (candSkillsLower.some((s) => s.includes("docker"))) score += 15;

    return score;
  };

  const currentScore = calculateSimScore();
  const hoursSaved = ((resumeSliderValue * 3.5) / 60).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-violet-600/40 selection:text-violet-100">
      {/* Top Navigation */}
      <header className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-between px-6 py-3.5 rounded-2xl bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Merix</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#simulator" className="hover:text-white transition-colors">
              Interactive Simulator
            </a>
            <a href="#pillars" className="hover:text-white transition-colors">
              Explainable Architecture
            </a>
            <a href="#calculator" className="hover:text-white transition-colors">
              ROI Calculator
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              DPDP Compliance FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <DPDPBadge variant="pill" className="hidden sm:inline-flex" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 transition-all active:scale-95"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 transition-all active:scale-95"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 md:px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-medium mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>India DPDP Act (2023) Grounded Resume Matching</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.08] mb-6"
        >
          Screen 100 Resumes in 10 Minutes. Grounded in Verbatim Evidence.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10"
        >
          Merix empowers Indian campus placement cells and enterprise recruiters with explainable 0–100 match scoring, verbatim skill evidence, and automated 90-day DPDP compliance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href={isAuthenticated ? "/jobs/new" : "/signup"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Post a Job & Batch Screen</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#simulator"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl"
          >
            <Play className="w-3.5 h-3.5 fill-current text-violet-400" />
            <span>Try Live Match Simulator</span>
          </a>
        </motion.div>
      </section>

      {/* Interactive Live Match Sandbox (ReactBits / Tactile Widget) */}
      <section id="simulator" className="py-12 px-4 md:px-6 max-w-6xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  Interactive AI Match Sandbox (Live Deterministic Engine)
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Select candidate dossiers to observe instantaneous evidence extraction, score breakdown, and gap detection.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
              {SIM_CANDIDATES.map((cand) => (
                <button
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCandidate.id === cand.id
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {cand.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Candidate Sandbox Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Candidate Dossier */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedCandidate.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      {selectedCandidate.role} • {selectedCandidate.experience} • {selectedCandidate.institution}
                    </p>
                  </div>
                  <DPDPBadge variant="subtle" />
                </div>

                <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-zinc-200 leading-relaxed">
                  <strong className="text-violet-300 font-medium block mb-1">
                    Verbatim Resume Grounding Evidence:
                  </strong>
                  &quot;{selectedCandidate.evidence}&quot;
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold block mb-2">
                    Detected Candidate Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.04] border border-white/10 text-zinc-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedCandidate.missingGaps.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-rose-300">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      Identified Gaps: <strong>{selectedCandidate.missingGaps.join(", ")}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Scoring Meter */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Calculated Match Score
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">70% Req / 30% Pref</span>
                </div>

                <div className="py-4 text-center">
                  <div
                    className={`text-5xl font-bold font-mono ${
                      currentScore >= 80
                        ? "text-emerald-400"
                        : currentScore >= 60
                        ? "text-amber-300"
                        : "text-zinc-400"
                    }`}
                  >
                    {currentScore}
                    <span className="text-sm text-zinc-500 font-sans"> / 100</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium mt-1 block">
                    {currentScore >= 80 ? "Strong Placement Fit" : currentScore >= 60 ? "Moderate Fit" : "Skill Gap Deficit"}
                  </span>
                </div>

                <div className="space-y-2">
                  {JOB_SKILLS.map((js) => {
                    const matched = selectedCandidate.skills.some((cs) =>
                      cs.toLowerCase().includes(js.id) || (js.id === "python" && cs.toLowerCase().includes("python"))
                    );

                    return (
                      <div
                        key={js.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5"
                      >
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          {matched ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>{js.name}</span>
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">+{js.weight} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span>DPDP Retention: 90 Days</span>
                <Link
                  href="/signup"
                  className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                >
                  <span>Test with Real Resumes →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Trust Band */}
      <section className="py-12 border-y border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-6">
            Trusted by Placement Cells & Tech Hiring Teams Across India
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all font-semibold text-sm text-zinc-300">
            <span>IIT Placement Hubs</span>
            <span>NIT Career Consortia</span>
            <span>Bengaluru Tech Labs</span>
            <span>Apex Staffing India</span>
            <span>Nexus Talent Placement</span>
          </div>
        </div>
      </section>

      {/* Interactive 3-Pillar Deep Dive */}
      <section id="pillars" className="py-24 px-4 md:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Architected for Pure Explainability & Compliance
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Every decision point is auditable, deterministic, and protected by Indian data privacy laws.
          </p>
        </div>

        {/* Interactive Tab Selector */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10">
            <button
              onClick={() => setActiveTab("explainability")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "explainability"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>1. Explainable Matching</span>
            </button>

            <button
              onClick={() => setActiveTab("batch")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "batch"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. High-Throughput Batching</span>
            </button>

            <button
              onClick={() => setActiveTab("dpdp")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "dpdp"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>3. India DPDP Compliance</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <AnimatePresence mode="wait">
            {activeTab === "explainability" && (
              <motion.div
                key="explainability"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    No Black-Box Scores. Verbatim Quotes for Every Fit.
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Legacy ATS tools reject resumes with arbitrary opacity. Merix maps required and preferred skills directly to exact sentences in the candidate&apos;s PDF text, generating a mathematically auditable score.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>70% Required / 20% Preferred / 10% Experience formula</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Missing skill gaps explicitly flagged for placement coordinators</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-black/60 border border-white/10 p-5 font-mono text-xs text-zinc-300 space-y-3 shadow-inner">
                  <div className="text-zinc-500 pb-2 border-b border-white/10">// Explainability Dossier Extraction</div>
                  <div className="text-emerald-400 font-semibold">✓ &quot;FastAPI AsyncIO Production Mastery&quot;</div>
                  <div className="text-zinc-400 pl-4 border-l-2 border-emerald-500/40 text-[11px]">
                    &quot;Developed high-concurrency event ingestion pipelines using FastAPI and Asyncpg on PostgreSQL.&quot;
                  </div>
                  <div className="text-rose-400 font-semibold pt-2">✗ Gap: &quot;Kubernetes Cluster Management&quot;</div>
                  <div className="text-zinc-500 pl-4 border-l-2 border-rose-500/40 text-[11px]">
                    No evidence of multi-node K8s management found in candidate work history.
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "batch" && (
              <motion.div
                key="batch"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    High-Throughput Batch Processing Engine
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Upload 100+ resumes in a single drag-and-drop action. Our asynchronous worker queue extracts requirements, generates Gemini vector embeddings, and ranks candidates with zero UI blocking.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Partial failure isolation: bad files don&apos;t fail the batch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Instant one-click shortlist CSV export with full ranking</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-black/60 border border-white/10 p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10">
                    <span className="font-mono text-zinc-400">Async Batch Pipeline</span>
                    <span className="font-mono text-emerald-400">Status: Running</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full w-[90%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                    <span>90 / 100 Resumes Evaluated</span>
                    <span>90%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "dpdp" && (
              <motion.div
                key="dpdp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Complete India DPDP Act (2023) Protection
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Designed specifically for Indian institutions. Mandatory consent stamping, PII scrubbing before LLM evaluation, automatic 90-day retention cleanup, and one-click Data Principal erasure.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>PostgreSQL Row-Level Security (RLS) tenant isolation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Append-only immutable audit trail for legal compliance</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-black/60 border border-white/10 p-5 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10 font-mono text-emerald-400">
                    <span>DPDP Trust Vault Active</span>
                    <span className="text-[10px] text-zinc-500">RLS Isolated</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between text-zinc-300">
                    <span>Consent Stamping</span>
                    <strong className="text-emerald-300 font-mono">Server-Side Signed</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between text-zinc-300">
                    <span>Retention Limit</span>
                    <strong className="text-zinc-200 font-mono">90 Days (Configurable)</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between text-zinc-300">
                    <span>Right to Erasure</span>
                    <strong className="text-rose-300 font-mono">1-Click Cascade Delete</strong>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Interactive ROI Calculator for Placement Drives */}
      <section id="calculator" className="py-16 px-4 md:px-6 max-w-5xl mx-auto w-full">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/15 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Campus Placement Drive ROI Calculator
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Calculate time and compliance risk reduction across your placement cycles.
            </p>
          </div>

          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-300">
              <span>Batch Size: <strong className="text-violet-300 text-base">{resumeSliderValue}</strong> Resumes</span>
              <span className="text-zinc-500">Scale: 50 – 2000</span>
            </div>

            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={resumeSliderValue}
              onChange={(e) => setResumeSliderValue(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-3xl font-bold font-mono text-white mb-1">{hoursSaved} hrs</div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Manual Screening Saved
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-3xl font-bold font-mono text-emerald-400 mb-1">&lt;30 sec</div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Merix Batch Latency
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="text-3xl font-bold font-mono text-violet-300 mb-1">100%</div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                DPDP Consent Compliance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="py-16 px-4 md:px-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-400">
            Everything you need to know about Merix, explainability, and DPDP compliance.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does Merix guarantee explainability for every match score?",
              a: "Unlike black-box ATS algorithms, Merix breaks down each Job Description into required skills (70%), preferred qualifications (20%), and experience criteria (10%). For every matched skill, it extracts the verbatim sentence from the candidate's PDF and generates a grounded explanation.",
            },
            {
              q: "What makes Merix compliant with the India DPDP Act 2023?",
              a: "Merix enforces a mandatory legal consent gate on batch upload, records server-side timestamps, scrubs personal identifiable information (PII) before vector analysis, automatically deletes data after your organization's retention limit (default 90 days), and provides a one-click Data Principal Erasure action.",
            },
            {
              q: "What happens if a resume fails parsing or is corrupted?",
              a: "Merix features partial failure isolation. If a corrupt file or password-protected PDF is encountered, it is quarantined with a specific error message while the rest of the batch processes seamlessly.",
            },
            {
              q: "Can I export candidate rankings to Excel or an external ATS?",
              a: "Yes. Every shortlisted batch provides instant CSV export containing candidate names, 0–100 scores, matched skills, missing gaps, and the AI rationale.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 md:p-5 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-violet-300 transition-colors"
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 text-center max-w-4xl mx-auto w-full">
        <div className="glass-panel p-10 md:p-14 rounded-3xl border border-white/15 shadow-[0_0_50px_rgba(124,58,237,0.2)]">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Accelerate your placement shortlists today.
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Create an organization account and post your first job description in less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <span>Sign In to Existing Org</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-zinc-300">Merix</span>
            <span>— AI Resume-to-JD Matching Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-zinc-500">Built for Indian Campus Placement & Staffing</span>
            <DPDPBadge variant="subtle" />
          </div>
        </div>
      </footer>
    </div>
  );
}
