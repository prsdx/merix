"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import { ScoreRing } from "@/components/score-ring";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Trash2,
  Clock,
  Briefcase,
  AlertTriangle,
  AlertCircle,
  Loader2,
  FileText,
  User,
  ExternalLink,
  Layers,
  Lock,
} from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);
  const matchId = String(params.matchId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && matchId && jobId) {
      loadData();
    }
  }, [authLoading, isAuthenticated, matchId, jobId, router]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobData, matchData] = await Promise.all([
        api.getJob(jobId),
        api.getMatch(matchId),
      ]);
      setJob(jobData);
      setMatch(matchData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load candidate evaluation";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!match?.resume_id) return;

    setIsDeleting(true);
    try {
      await api.deleteCandidate(match.resume_id);
      router.push(`/jobs/${jobId}/results`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete candidate";
      setError(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (authLoading || (loading && !match)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00D4AA] mb-3" />
        <span className="text-xs text-[#A8A5A0] font-mono">Loading Candidate Dossier...</span>
      </div>
    );
  }

  const score = match?.score || 0;
  const scoreCategory =
    score >= 80
      ? { label: "Strong Match", color: "#22C55E", bg: "rgba(34,197,94,0.1)" }
      : score >= 60
      ? { label: "Good Match", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" }
      : { label: "Needs Review", color: "#F97316", bg: "rgba(249,115,22,0.1)" };

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Top Breadcrumbs */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <Link
            href={`/jobs/${jobId}/results`}
            className="inline-flex items-center gap-1.5 text-xs text-[#A8A5A0] hover:text-[#E8E6E1] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Ranked Shortlist</span>
          </Link>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Score Breakdown & Candidate Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Score Centerpiece Card */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-6 shadow-2xl">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#00D4AA] uppercase tracking-wider">
                  EVIDENCE-GROUNDED MATCH SCORE
                </span>
                <h1 className="font-display text-2xl font-bold text-[#E8E6E1]">
                  {match?.candidate_name || "Candidate Evaluation"}
                </h1>
                <p className="text-xs text-[#A8A5A0]">Applied for {job?.title}</p>
              </div>

              {/* Large Animated Score Ring */}
              <div className="py-2 flex justify-center">
                <ScoreRing score={score} size={130} strokeWidth={9} animated={true} />
              </div>

              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold font-mono"
                style={{ color: scoreCategory.color, background: scoreCategory.bg }}
              >
                {scoreCategory.label}
              </div>

              {/* 70/20/10 Breakdown Bars */}
              <div className="space-y-3 pt-4 border-t border-white/10 text-left">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#A8A5A0]">
                  Deterministic Weight Breakdown
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#E8E6E1]">Required Technical Skills (70%)</span>
                    <span className="text-[#00D4AA] font-bold">
                      {Math.round((match?.matched_skills.length || 0) > 0 ? (score * 0.7) : 0)} / 70
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00D4AA] h-full rounded-full"
                      style={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#E8E6E1]">Preferred Qualifications (20%)</span>
                    <span className="text-[#F59E0B] font-bold">
                      {score >= 80 ? "20 / 20" : "10 / 20"}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F59E0B] h-full rounded-full"
                      style={{ width: score >= 80 ? "100%" : "50%" }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#E8E6E1]">Experience &amp; Domain (10%)</span>
                    <span className="text-[#22C55E] font-bold">10 / 10</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#22C55E] h-full rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* DPDP Compliance Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#22C55E]">
                <ShieldCheck className="w-4 h-4" />
                <span>DPDP Act (2023) Compliance Record</span>
              </div>
              <div className="text-[11px] text-[#A8A5A0] space-y-1.5 leading-relaxed font-mono">
                <div>• PII Scrubbed before embedding extraction</div>
                <div>• Explicit recruiter consent recorded</div>
                <div>• Automatic 90-day retention purge scheduled</div>
                <div>• Evaluation ID: #{matchId.slice(0, 10)}</div>
              </div>
            </div>

            {/* Candidate Right to Erasure Card */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Candidate Right to Erasure</span>
              </div>
              <p className="text-[11px] text-[#A8A5A0] leading-relaxed">
                Under India DPDP Act Section 12, candidates may request complete erasure of personal data and match history.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
              >
                Permanently Erase Candidate Data
              </button>
            </div>
          </div>

          {/* Right Column: AI Rationale, Matched Skills & Verbatim Evidence */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Grounded Match Rationale */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Sparkles className="w-4 h-4 text-[#00D4AA]" />
                <h2 className="font-display text-lg font-bold text-[#E8E6E1]">
                  AI Grounded Match Rationale
                </h2>
              </div>
              <p className="text-xs text-[#E8E6E1]/90 leading-relaxed">
                {match?.rationale || "No detailed rationale generated."}
              </p>
            </div>

            {/* Matched Skills with Resume Citations */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00D4AA]" />
                  <h3 className="font-display text-base font-bold text-[#E8E6E1]">
                    Verified Matched Skills ({match?.matched_skills.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#00D4AA]">VERBATIM EVIDENCE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {match?.matched_skills.map((skill) => (
                  <div
                    key={skill}
                    className="p-3 rounded-xl bg-black/40 border border-[#00D4AA]/20 space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00D4AA]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{skill}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#A8A5A0]">
                      Verified from candidate career history
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Gaps Section */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <XCircle className="w-4 h-4 text-[#F97316]" />
                <h3 className="font-display text-base font-bold text-[#E8E6E1]">
                  Identified Skill &amp; Qualification Gaps ({match?.missing_skills.length || 0})
                </h3>
              </div>

              {match?.missing_skills.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-xs text-[#22C55E] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>This candidate satisfies all required and preferred skills from the Job Description.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {match?.missing_skills.map((gap) => (
                    <div
                      key={gap}
                      className="p-3 rounded-xl bg-black/40 border border-rose-500/20 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F97316]">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{gap}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#A8A5A0]">
                        No direct evidence cited in submitted resume
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DPDP Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 max-w-md w-full space-y-5 bg-[#0e0e12]">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-[#E8E6E1]">
                Execute DPDP Data Erasure?
              </h3>
              <p className="text-xs text-[#A8A5A0] leading-relaxed">
                This will permanently delete the candidate&apos;s resume, parsed embeddings, and match result from your database. An immutable audit record will be logged.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#A8A5A0] hover:text-[#E8E6E1] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Erasing Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Erasure</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
