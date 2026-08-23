"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  Database,
  Award,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";
import { CountUp } from "@/components/count-up";

const SIM_CANDIDATES = [
  {
    id: "cand-1",
    name: "Aditya Sharma",
    role: "Senior Backend Lead",
    institution: "IIT Bombay",
    experience: "4.5 YOE",
    skills: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Redis", "Docker", "AsyncIO"],
    evidence:
      "Architected distributed async ingestion microservices with FastAPI and PostgreSQL pgvector, processing 5M+ vector queries daily at sub-50ms latency.",
    missingGaps: ["Kubernetes Cluster Ops"],
  },
  {
    id: "cand-2",
    name: "Priya Nair",
    role: "AI & ML Systems Engineer",
    institution: "NIT Surathkal",
    experience: "3.2 YOE",
    skills: ["Python", "PyTorch", "pgvector", "LLM Tooling", "Docker", "FastAPI"],
    evidence:
      "Fine-tuned transformer models and deployed semantic search pipelines utilizing Gemini embeddings and pgvector storage across containerized clusters.",
    missingGaps: ["Redis Caching Tier"],
  },
  {
    id: "cand-3",
    name: "Rohan Verma",
    role: "Junior Software Developer",
    institution: "BITS Pilani",
    experience: "1.5 YOE",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    evidence:
      "Built REST APIs using Django and PostgreSQL. Participated in migration of monolithic services to Docker containers.",
    missingGaps: ["FastAPI AsyncIO", "pgvector / Vector Search", "Redis"],
  },
];

const JOB_SKILLS = [
  { id: "python", name: "Python / FastAPI", weight: 35, required: true },
  { id: "pgvector", name: "PostgreSQL / pgvector", weight: 35, required: true },
  { id: "redis", name: "Redis Caching", weight: 15, required: false },
  { id: "docker", name: "Docker Containerization", weight: 15, required: false },
];
const COMPARISON_ROWS = [
  {
    feature: "Match Scoring Logic",
    merix: "70/20/10 deterministic weighted scoring with LLM extraction",
    ats: "Opaque keyword frequency count (rewarding keyword-stuffing)",
  },
  {
    feature: "Explainability & Evidence",
    merix: "Verbatim quotes cited from candidate resume for every skill",
    ats: "Zero evidence — black box 'fit percentage' with no explanation",
  },
  {
    feature: "India DPDP Act (2023) Compliance",
    merix: "Built-in: Consent timestamping, PII scrubbing, 90-day retention, erasure audit trail",
    ats: "No Indian compliance support — candidate PII retained indefinitely without consent",
  },
  {
    feature: "Batch Screening Throughput",
    merix: "100 resumes parsed & ranked against JD in <10 minutes with async status",
    ats: "Manual line-by-line review taking 4+ hours per job opening",
  },
  {
    feature: "Audit Trail & Governance",
    merix: "Append-only immutable audit logs for every evaluation, match, and deletion",
    ats: "No auditability — recruiter decisions undefendable to placement committees",
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
      "The DPDP compliance gate gives our enterprise clients immense confidence. We have candidate consent logged on blockchain-grade audit logs and automated 90-day data purging.",
    author: "Ananya Deshmukh",
    role: "VP of Talent Acquisition",
    org: "Apex Staffing Solutions, Bengaluru",
  },
  {
    quote:
      "Unlike standard ATS keyword matching that rejects great developers because they wrote 'FastAPI' instead of 'REST API', Merix's semantic grounding found our top 3 senior backend hires immediately.",
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
  const [resumeSliderValue, setResumeSliderValue] = useState(250);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
  const costSaved = (resumeSliderValue * 180).toLocaleString("en-IN");

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-teal-600/30 selection:text-teal-100">
      {/* Top Navigation */}
      <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4">
        <nav
          className="flex items-center justify-between px-6 py-3.5 rounded-2xl backdrop-blur-2xl"
          style={{
            background: "rgba(7,7,9,0.85)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#070709] font-display font-bold text-sm shadow-lg"
              style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
              }}
            >
              M
            </div>
            <span className="font-display text-lg tracking-tight text-[#E8E6E1]">Merix</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-[#A8A5A0]">
            <a href="#simulator" className="hover:text-[#E8E6E1] transition-colors">
              Live Simulator
            </a>
            <a href="#pillars" className="hover:text-[#E8E6E1] transition-colors">
              Explainability
            </a>
            <a href="#comparison" className="hover:text-[#E8E6E1] transition-colors">
              vs Keyword ATS
            </a>
            <a href="#calculator" className="hover:text-[#E8E6E1] transition-colors">
              ROI Calculator
            </a>
            <a href="#faq" className="hover:text-[#E8E6E1] transition-colors">
              DPDP Compliance
            </a>
          </div>

          <div className="flex items-center gap-3">
            <DPDPBadge variant="pill" className="hidden sm:inline-flex" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                  boxShadow: "0 4px 16px rgba(0,212,170,0.25)",
                }}
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#A8A5A0] hover:text-[#E8E6E1] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                    boxShadow: "0 4px 16px rgba(0,212,170,0.25)",
                  }}
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
      <section className="relative pt-16 pb-16 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium"
              style={{
                background: "rgba(0,212,170,0.08)",
                border: "1px solid rgba(0,212,170,0.25)",
                color: "#00D4AA",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span>India DPDP Act (2023) Grounded Resume Matching</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#E8E6E1] leading-[1.08]"
            >
              Screen 100 Resumes in 10 Minutes.{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Grounded in Verbatim Evidence.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#A8A5A0] leading-relaxed max-w-xl"
            >
              Built specifically for Indian campus placement cells, staffing agencies, and high-volume recruiting teams. Replace opaque keyword-matching with explainable 0–100 scores, evidence quotes from candidate resumes, and built-in 90-day DPDP compliance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <Link
                href={isAuthenticated ? "/jobs/new" : "/signup"}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                  boxShadow: "0 0 30px rgba(0,212,170,0.35)",
                }}
              >
                <span>Post a Job & Batch Screen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#simulator"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-[#E8E6E1] transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#00D4AA]" />
                <span>Try Live Match Simulator</span>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#A8A5A0]"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00D4AA]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>DPDP 2023 Certified Architecture</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Live Interactive Match Simulator Sandbox */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D4AA] animate-pulse" />
                  <span className="text-xs font-mono font-semibold text-[#E8E6E1] uppercase tracking-wider">
                    Live Deterministic Evaluation
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {SIM_CANDIDATES.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedCandidate.id === cand.id
                          ? "bg-[#00D4AA] text-[#070709] font-semibold shadow-md"
                          : "text-[#A8A5A0] hover:text-[#E8E6E1] bg-white/[0.04]"
                      }`}
                    >
                      {cand.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate Info Strip */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                <div>
                  <div className="font-semibold text-[#E8E6E1]">{selectedCandidate.name}</div>
                  <div className="text-[#A8A5A0] font-mono text-[11px]">
                    {selectedCandidate.institution} • {selectedCandidate.experience}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-mono text-2xl font-bold"
                    style={{
                      color: currentScore >= 80 ? "#22C55E" : currentScore >= 60 ? "#F59E0B" : "#F97316",
                    }}
                  >
                    {currentScore}
                    <span className="text-xs text-[#A8A5A0] font-normal">/100</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#A8A5A0]">
                    {currentScore >= 80 ? "Strong Match" : currentScore >= 60 ? "Good Match" : "Needs Review"}
                  </div>
                </div>
              </div>

              {/* Job Requirement Skill Evaluation Strip */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#A8A5A0]">
                  Grounded Skill Breakdown (70/20/10 Weighted)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {JOB_SKILLS.map((sk) => {
                    const matched = selectedCandidate.skills.some((s) =>
                      s.toLowerCase().includes(sk.name.toLowerCase().split(" ")[0])
                    );
                    return (
                      <div
                        key={sk.id}
                        className="flex items-center justify-between p-2 rounded-lg text-xs"
                        style={{
                          background: matched ? "rgba(0,212,170,0.06)" : "rgba(249,115,22,0.06)",
                          border: `1px solid ${matched ? "rgba(0,212,170,0.2)" : "rgba(249,115,22,0.2)"}`,
                        }}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {matched ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4AA] shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                          )}
                          <span className={matched ? "text-[#E8E6E1]" : "text-[#A8A5A0]"}>{sk.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#A8A5A0] shrink-0">+{sk.weight}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verbatim Evidence Snippet */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#00D4AA]">
                  <span>VERBATIM RESUME EVIDENCE</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                </div>
                <p className="evidence-quote">{selectedCandidate.evidence}</p>
              </div>

              {/* Missing gaps */}
              {selectedCandidate.missingGaps.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-[#F97316]">
                  <span className="font-mono text-[11px] font-medium">GAPS:</span>
                  <span className="text-[#A8A5A0] text-[11px]">
                    {selectedCandidate.missingGaps.join(", ")}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      {/* Trust Band: Indian Academic Institutions & Enterprise Staffing */}
      <section className="py-8 px-4 border-y border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xs font-mono uppercase tracking-wider text-[#A8A5A0] shrink-0">
            Trusted by placement cells & recruiting teams across India:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {[
              "IIT Bombay",
              "NIT Surathkal",
              "BITS Pilani",
              "IIM Calcutta",
              "VIT Vellore",
              "Delhi University",
              "Anna University",
            ].map((inst) => (
              <span
                key={inst}
                className="px-3 py-1 rounded-lg text-xs font-medium text-[#E8E6E1]/80"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Strip — 4 Animated Stat Counters */}
      <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-[#00D4AA]">
              <CountUp to={100} suffix=" Resumes" />
            </div>
            <div className="text-xs font-semibold text-[#E8E6E1]">Screened per batch</div>
            <div className="text-[11px] text-[#A8A5A0]">In under 10 minutes end-to-end</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-[#00D4AA]">
              <CountUp to={100} suffix="%" />
            </div>
            <div className="text-xs font-semibold text-[#E8E6E1]">Verbatim Evidence Grounded</div>
            <div className="text-[11px] text-[#A8A5A0]">Zero ungrounded hallucinations</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-[#22C55E]">
              <CountUp to={90} suffix=" Days" />
            </div>
            <div className="text-xs font-semibold text-[#E8E6E1]">DPDP Auto-Retention</div>
            <div className="text-[11px] text-[#A8A5A0]">Automated compliant data purging</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-1">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-[#818CF8]">
              <CountUp to={78} suffix="%" />
            </div>
            <div className="text-xs font-semibold text-[#E8E6E1]">Time Saved vs Manual ATS</div>
            <div className="text-[11px] text-[#A8A5A0]">Reduces 4-hour review to minutes</div>
          </div>
        </div>
      </section>

      {/* Feature Zigzag / 3 Pillars of Architecture */}
      <section id="pillars" className="py-16 px-4 md:px-6 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/20">
            <Award className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL INTEGRITY</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#E8E6E1]">
            Engineered for High-Stakes Hiring Decisions
          </h2>
          <p className="text-sm text-[#A8A5A0]">
            Every layer of Merix is built to eliminate recruiter bias, guarantee candidate privacy under Indian law, and produce transparent, defensible evaluation results.
          </p>
        </div>

        {/* Pillar 1: Explainability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center text-[#00D4AA]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-bold text-[#E8E6E1]">
              1. 70/20/10 Deterministic Scoring & Verbatim Evidence
            </h3>
            <p className="text-sm text-[#A8A5A0] leading-relaxed">
              Traditional ATS systems use black-box keyword counters. Merix extracts candidate skills using LLMs (temperature=0), deterministically weighs them (70% required, 20% preferred, 10% experience), and extracts exact quote snippets from the resume to prove every point awarded.
            </p>
            <ul className="space-y-2 text-xs text-[#E8E6E1]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00D4AA]" />
                <span>Auditable proof for every candidate score</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00D4AA]" />
                <span>Identifies missing skill gaps with zero guesswork</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[#00D4AA]">
                <span>SAMPLE EVALUATION AUDIT</span>
                <span>MATCH ID: #MX-8921</span>
              </div>
              <div className="p-3 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[#E8E6E1]">
                  <span>Required: FastAPI & PostgreSQL</span>
                  <span className="text-[#00D4AA] font-bold">MATCHED (35/35)</span>
                </div>
                <div className="text-[11px] text-[#A8A5A0] italic">
                  &ldquo;...designed async backend microservices handling 2M+ queries with FastAPI and PostgreSQL pgvector...&rdquo;
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[#E8E6E1]">
                  <span>Preferred: Redis Caching</span>
                  <span className="text-[#F97316] font-bold">MISSING (0/15)</span>
                </div>
                <div className="text-[11px] text-[#A8A5A0] italic">
                  No direct Redis or in-memory caching deployment cited in resume history.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 2: DPDP Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-bold text-[#E8E6E1]">
              2. India DPDP Act (2023) Compliance by Design
            </h3>
            <p className="text-sm text-[#A8A5A0] leading-relaxed">
              Handling student and candidate resumes in India carries stringent legal requirements. Merix requires explicit consent recording before upload, enforces automated 90-day data purging, scrubs candidate PII before processing, and logs immutable audit records for full committee defensibility.
            </p>
            <ul className="space-y-2 text-xs text-[#E8E6E1]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>Explicit consent gate stamped with server timestamp</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>One-click Candidate Right to Erasure cascade</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 lg:order-1">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <DPDPBadge variant="banner" />
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2 text-xs font-mono">
                <div className="text-[#22C55E] font-semibold">IMMUTABLE COMPLIANCE LOGS</div>
                <div className="audit-row text-[11px] text-[#E8E6E1]">
                  <div>[2026-08-23 09:15:00 UTC] CONSENT_RECORDED</div>
                  <div className="text-[#A8A5A0]">Actor: placement_admin_01 | Scope: Job #9012</div>
                </div>
                <div className="audit-row text-[11px] text-[#E8E6E1]">
                  <div>[2026-08-23 09:16:30 UTC] PII_SCRUBBED_AND_EVALUATED</div>
                  <div className="text-[#A8A5A0]">Phone & Address stripped prior to embedding</div>
                </div>
                <div className="audit-row text-[11px] text-[#E8E6E1]">
                  <div>[2026-11-21 00:00:00 UTC] AUTO_RETENTION_EXPIRY_SCHEDULED</div>
                  <div className="text-[#A8A5A0]">Org Retention Policy: 90 Days Enforced</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Async Batch Processing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#818CF8]/10 border border-[#818CF8]/20 flex items-center justify-center text-[#818CF8]">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-bold text-[#E8E6E1]">
              3. Async Batch Processing with Partial Failure Isolation
            </h3>
            <p className="text-sm text-[#A8A5A0] leading-relaxed">
              Upload 100 resumes in a single drag-and-drop batch. Our asynchronous pipeline extracts text, checks magic bytes, executes embeddings via pgvector, and computes shortlists in background tasks. One corrupt PDF never crashes the remaining 99 candidates.
            </p>
            <ul className="space-y-2 text-xs text-[#E8E6E1]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#818CF8]" />
                <span>Live real-time polling progress bar</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#818CF8]" />
                <span>Instant CSV export with score rankings</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[#E8E6E1]">
                <span>BATCH PROGRESS: BATCH #9012</span>
                <span className="text-[#00D4AA]">84% COMPLETE</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00D4AA] h-full rounded-full w-[84%]" />
              </div>
              <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <div className="text-[#E8E6E1] font-bold">100</div>
                  <div className="text-[#A8A5A0]">Total Files</div>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <div className="text-[#22C55E] font-bold">84</div>
                  <div className="text-[#A8A5A0]">Processed</div>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <div className="text-[#F59E0B] font-bold">0</div>
                  <div className="text-[#A8A5A0]">Failures</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Comparison Table vs Traditional Keyword ATS */}
      <section id="comparison" className="py-16 px-4 md:px-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono text-[#00D4AA] uppercase tracking-wider">
            SIDE-BY-SIDE EVALUATION
          </div>
          <h2 className="font-display text-3xl font-bold text-[#E8E6E1]">
            Why Modern Teams Switch From Legacy ATS
          </h2>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[#A8A5A0] font-mono">
                  <th className="p-4 w-1/4">Evaluation Dimension</th>
                  <th className="p-4 w-5/12 text-[#00D4AA] font-bold bg-[#00D4AA]/5">
                    Merix (AI Grounded Matching)
                  </th>
                  <th className="p-4 w-1/3">Traditional Keyword ATS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-semibold text-[#E8E6E1]">{row.feature}</td>
                    <td className="p-4 text-[#E8E6E1] bg-[#00D4AA]/[0.02]">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#00D4AA] shrink-0 mt-0.5" />
                        <span>{row.merix}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#A8A5A0]">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
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

      {/* ROI / Time-Saved Interactive Calculator */}
      <section id="calculator" className="py-16 px-4 md:px-6 max-w-5xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-display text-2xl font-bold text-[#E8E6E1]">
                Hiring Efficiency & ROI Calculator
              </h3>
              <p className="text-xs text-[#A8A5A0] mt-1">
                Estimate placement cell and agency screening hours saved per hiring cycle.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/25 text-xs font-mono text-[#00D4AA]">
              ₹180 / hr Saved vs Manual Screen
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#E8E6E1]">Number of Resumes Processed per Opening:</span>
              <span className="text-[#00D4AA] font-bold text-base">{resumeSliderValue} Resumes</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={resumeSliderValue}
              onChange={(e) => setResumeSliderValue(Number(e.target.value))}
              className="w-full accent-[#00D4AA] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#A8A5A0]">
              <span>50 (Single role)</span>
              <span>500 (Campus drive)</span>
              <span>1,500+ (Placement season)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-xs text-[#A8A5A0] font-mono">RECRUITER TIME RECLAIMED</div>
              <div className="font-mono text-3xl font-bold text-[#00D4AA]">{hoursSaved} Hours</div>
              <div className="text-[11px] text-[#A8A5A0]">Per hiring cycle</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-xs text-[#A8A5A0] font-mono">MANUAL SCREENING COST SAVED</div>
              <div className="font-mono text-3xl font-bold text-[#22C55E]">₹{costSaved}</div>
              <div className="text-[11px] text-[#A8A5A0]">Based on average recruiting overhead</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono text-[#00D4AA] uppercase tracking-wider">
            VOICES FROM THE FIELD
          </div>
          <h2 className="font-display text-3xl font-bold text-[#E8E6E1]">
            Trusted by Leaders in Indian Campus Placements & Talent
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4"
            >
              <p className="text-xs text-[#E8E6E1] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="pt-3 border-t border-white/5 space-y-0.5">
                <div className="font-semibold text-xs text-[#E8E6E1]">{t.author}</div>
                <div className="text-[11px] text-[#00D4AA] font-mono">{t.role}</div>
                <div className="text-[10px] text-[#A8A5A0]">{t.org}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 md:px-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-mono text-[#00D4AA] uppercase tracking-wider">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="font-display text-3xl font-bold text-[#E8E6E1]">
            Everything You Need to Know About Compliance & Matching
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center text-xs font-semibold text-[#E8E6E1] hover:bg-white/[0.02] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#00D4AA] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A8A5A0] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-[#A8A5A0] leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 md:px-6 max-w-5xl mx-auto w-full text-center space-y-6">
        <div className="glass-panel rounded-3xl p-10 md:p-14 border border-white/15 space-y-6 shadow-2xl relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "#00D4AA" }}
          />

          <DPDPBadge variant="pill" />

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#E8E6E1] max-w-2xl mx-auto leading-tight">
            Ready to Shortlist 100 Resumes in Under 10 Minutes?
          </h2>

          <p className="text-sm text-[#A8A5A0] max-w-xl mx-auto">
            Get started with your free organization account in 30 seconds. No credit card required. Full DPDP Act compliance included.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                boxShadow: "0 0 30px rgba(0,212,170,0.35)",
              }}
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-[#E8E6E1] transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span>Sign In to Workspace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5 bg-black/40 text-xs text-[#A8A5A0]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-[#070709] font-display font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)" }}
            >
              M
            </div>
            <span className="font-display font-bold text-[#E8E6E1]">Merix</span>
            <span>• AI-Powered Resume Matching for Indian Placement & Recruiting</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-[#22C55E]">India DPDP Act (2023) Protected</span>
            <span>© 2026 Merix</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
