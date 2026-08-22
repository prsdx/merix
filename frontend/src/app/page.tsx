"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  BarChart3,
  Search,
  Command,
  Clock,
  Trash2,
} from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-between px-6 py-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Merix</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Explainable AI
            </a>
            <a href="#compliance" className="hover:text-white transition-colors">
              DPDP Compliance
            </a>
            <a href="#metrics" className="hover:text-white transition-colors">
              ROI Metrics
            </a>
          </div>

          <div className="flex items-center gap-3">
            <DPDPBadge variant="pill" className="hidden sm:inline-flex" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 transition-all"
              >
                <span>Go to Dashboard</span>
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
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 transition-all"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section (v5 Structure + v7 Glass Theme) */}
      <section className="relative pt-24 pb-20 px-4 md:px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-medium mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>India&apos;s First DPDP-Compliant Resume Matching Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6"
        >
          Shortlist 100 resumes in{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
            10 minutes.
          </span>{" "}
          With zero black-box scoring.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10"
        >
          Merix gives Indian campus placement cells and enterprise recruiters evidence-grounded, explainable match scores with full DPDP consent and automated 90-day retention.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href={isAuthenticated ? "/jobs/new" : "/signup"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02]"
          >
            <span>Post a Job & Batch Screen</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl"
          >
            <span>Recruiter Sign In</span>
          </Link>
        </motion.div>

        {/* Live Product Preview Card (Frosted Glass Container) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-14 w-full rounded-2xl glass-panel p-4 md:p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/15"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-zinc-400 font-mono pl-2">merix://shortlist/batch-match-live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Verbatim Evidence</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left preview candidate */}
            <div className="md:col-span-7 rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Aditya Sharma</h4>
                  <p className="text-xs text-zinc-400">Backend Lead • 4.5 YOE • IIT Bombay</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-emerald-400">92<span className="text-xs text-zinc-500">/100</span></div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">High Match</span>
                </div>
              </div>

              <div className="text-xs text-zinc-300 bg-black/40 rounded-lg p-3 border border-white/5 leading-relaxed">
                <strong className="text-violet-300">AI Rationale:</strong> Candidate demonstrates strong mastery of FastAPI async patterns and PostgreSQL pgvector architectures with 3+ years production scaling experience.
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[11px]">✓ Python / FastAPI (Req)</span>
                <span className="px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[11px]">✓ pgvector / Supabase (Req)</span>
                <span className="px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[11px]">✓ Redis Caching</span>
              </div>
            </div>

            {/* Right preview stats */}
            <div className="md:col-span-5 rounded-xl bg-white/[0.02] border border-white/10 p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Batch Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Resumes Screened</span>
                    <span className="font-mono text-white font-semibold">100 / 100</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Top Tier (&gt;80)</span>
                    <span className="font-mono text-emerald-400 font-semibold">18 Candidates</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Processing Time</span>
                    <span className="font-mono text-violet-300 font-semibold">14.2 seconds</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Consent Verified</span>
                    <span className="font-mono text-emerald-400 font-semibold">100% DPDP</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-3 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">Retention: 90 Days</span>
                <span className="text-violet-400 font-medium hover:underline cursor-pointer">Export Shortlist CSV →</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof Trust Band */}
      <section className="py-12 border-y border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-6">
            Trusted by Indian Campus Placement Cells & High-Growth Staffing Teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="text-sm font-semibold tracking-wider text-zinc-300">IIT Placement Cells</span>
            <span className="text-sm font-semibold tracking-wider text-zinc-300">NIT Career Hub</span>
            <span className="text-sm font-semibold tracking-wider text-zinc-300">Apex Tech Recruiters</span>
            <span className="text-sm font-semibold tracking-wider text-zinc-300">Nexus Staffing India</span>
            <span className="text-sm font-semibold tracking-wider text-zinc-300">Bengaluru Talent Labs</span>
          </div>
        </div>
      </section>

      {/* Feature Grid (v5 3-Pillar Zigzag + v7 Glass) */}
      <section id="features" className="py-24 px-4 md:px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Built for Explainability, Speed & India DPDP Compliance
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Every score is mathematically justified. Never guess why an ATS rejected your top talent.
          </p>
        </div>

        {/* Pillar 1: Explainability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center glass-panel p-6 md:p-10 rounded-3xl">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Verbatim Evidence for Every Skill</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Unlike generic ATS systems that output arbitrary numbers, Merix parses required vs preferred skills and maps exact quotes directly from the candidate&apos;s resume text into an explainable rationale.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic weighted matching (70% required / 20% preferred / 10% experience)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Clear missing skills callouts for recruiter debriefs</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-black/50 border border-white/10 p-5 font-mono text-xs text-zinc-300 space-y-3 shadow-inner">
            <div className="text-zinc-500 text-[11px] pb-2 border-b border-white/10">// Match Evidence Output</div>
            <div className="text-emerald-400">✓ Skill: &quot;PyTorch / Deep Learning&quot;</div>
            <div className="text-zinc-400 pl-4 border-l-2 border-emerald-500/40 text-[11px]">
              &quot;Developed and fine-tuned transformer architectures for NLP classification using PyTorch across 4 multi-GPU nodes.&quot;
            </div>
            <div className="text-rose-400 pt-2">✗ Gap: &quot;Kubernetes Cluster Management&quot;</div>
            <div className="text-zinc-500 pl-4 border-l-2 border-rose-500/40 text-[11px]">
              No evidence of production K8s deployment found in work history.
            </div>
          </div>
        </div>

        {/* Pillar 2: Batch Processing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center glass-panel p-6 md:p-10 rounded-3xl">
          <div className="order-2 md:order-1 rounded-2xl bg-black/50 border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="text-zinc-400 font-mono">Async Background Queue</span>
              <span className="text-violet-400 font-mono">202 Accepted</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full w-[85%]" />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Status: Processing 85/100 Resumes</span>
                <span>85%</span>
              </div>
            </div>
            <div className="text-[11px] text-zinc-400 bg-white/[0.02] p-2.5 rounded border border-white/5">
              Partial failure isolation: Corrupted or unparseable files are quarantined with exact error messages while valid resumes process without interruption.
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">High-Throughput Batch Uploads</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Drop 100+ PDF resumes for a single opening. Our background processing pipeline parses, extracts semantic embeddings, and ranks candidates asynchronously with live status polling.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant shortlist CSV export with candidate ranking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time progress bars with zero page freezing</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pillar 3: DPDP Compliance */}
        <div id="compliance" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center glass-panel p-6 md:p-10 rounded-3xl">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Full India DPDP (2023) Compliance</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Built from day one for Indian data privacy. Consent is required and stamped on every resume, automated 90-day retention policies auto-expire data, and candidate erasure is supported in one click.
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pre-processing PII scrubbing (phone, email, address)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Immutable audit trail tracking every batch action</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-click Data Principal Erasure (Right to be Forgotten)</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-black/50 border border-white/10 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>DPDP Trust Vault</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">ORG-RETENTION: 90 DAYS</span>
            </div>
            <div className="space-y-2 text-zinc-300">
              <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/5">
                <span className="text-zinc-400">Consent Stamping</span>
                <span className="text-emerald-300 font-mono">Server-Side Verified</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/5">
                <span className="text-zinc-400">Row-Level Security</span>
                <span className="text-emerald-300 font-mono">Postgres Tenant RLS</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/5">
                <span className="text-zinc-400">Right to Erasure</span>
                <span className="text-rose-300 font-mono">Instant Cascade Delete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Metrics Section */}
      <section id="metrics" className="py-20 border-t border-white/10 bg-gradient-to-b from-black/60 to-black/90">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-2xl glass-panel">
              <div className="text-4xl font-bold font-mono text-white mb-1">&lt;10 min</div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">100 Resumes Screened</p>
            </div>
            <div className="p-6 rounded-2xl glass-panel">
              <div className="text-4xl font-bold font-mono text-emerald-400 mb-1">100%</div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Grounded Evidence</p>
            </div>
            <div className="p-6 rounded-2xl glass-panel">
              <div className="text-4xl font-bold font-mono text-violet-400 mb-1">4.5 hrs</div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Saved per Batch</p>
            </div>
            <div className="p-6 rounded-2xl glass-panel">
              <div className="text-4xl font-bold font-mono text-indigo-400 mb-1">DPDP</div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Fully Compliant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <div className="glass-panel p-10 md:p-16 rounded-3xl border border-white/15 shadow-[0_0_50px_rgba(124,58,237,0.2)]">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Ready to streamline your placement drives?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Create an organization account in seconds and post your first job description.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02]"
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
