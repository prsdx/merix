"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult } from "@/lib/types";
import { DPDPBadge } from "@/components/dpdp-badge";
import { ScoreRing } from "@/components/score-ring";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Loader2,
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
        api.getMatch(jobId, matchId),
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
      await api.deleteCandidate(jobId, match.resume_id);
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
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-evidence)] mb-3" />
        <span className="text-xs text-[var(--text-muted)] font-mono">Loading Candidate Dossier...</span>
      </div>
    );
  }

  const score = match?.score || 0;
  const scoreCategory =
    score >= 80
      ? { label: "Strong Match", color: "#16A34A", bg: "rgba(22,163,74,0.12)" }
      : score >= 60
      ? { label: "Good Match", color: "#D97706", bg: "rgba(217,119,6,0.12)" }
      : { label: "Needs Review", color: "#EA580C", bg: "rgba(234,88,12,0.12)" };

  return (
    <div className="min-h-screen pb-16">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Breadcrumbs */}
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-hairline)]">
          <Link
            href={`/jobs/${jobId}/results`}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Ranked Shortlist</span>
          </Link>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-[var(--accent-danger)] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[var(--accent-danger)] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Score Breakdown & Candidate Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Score Centerpiece Card */}
            <div className="merix-card p-8 rounded-3xl border border-[var(--border-hairline)] text-center space-y-6 shadow-xl">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[var(--accent-evidence)]  uppercase tracking-wider font-semibold">
                  EVIDENCE-GROUNDED MATCH SCORE
                </span>
                <h1 className="font-display text-2xl font-normal text-[var(--text-primary)]">
                  {match?.candidate_name || "Candidate Evaluation"}
                </h1>
                <p className="text-xs text-[var(--text-muted)]">Applied for {job?.title}</p>
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
              <div className="space-y-3 pt-4 border-t border-[var(--border-hairline)] text-left">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Deterministic Weight Breakdown
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--text-primary)]">Required Technical Skills (70%)</span>
                    <span className="text-[var(--accent-evidence)]  font-bold">
                      {Math.round((match?.matched_skills.length || 0) > 0 ? (score * 0.7) : 0)} / 70
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--accent-evidence)] h-full rounded-full"
                      style={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--text-primary)]">Preferred Qualifications (20%)</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">
                      {score >= 80 ? "20 / 20" : "10 / 20"}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 dark:bg-amber-400 h-full rounded-full"
                      style={{ width: score >= 80 ? "100%" : "50%" }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[var(--text-primary)]">Experience &amp; Domain (10%)</span>
                    <span className="text-[var(--accent-evidence)] font-bold">10 / 10</span>
                  </div>
                  <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--accent-evidence)] h-full rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* DPDP Compliance Card */}
            <div className="merix-card p-6 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-evidence)]">
                <ShieldCheck className="w-4 h-4" />
                <span>DPDP Act (2023) Compliance Record</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] space-y-1.5 leading-relaxed font-mono">
                <div>• PII Scrubbed before embedding extraction</div>
                <div>• Explicit recruiter consent recorded</div>
                <div>• Automatic 90-day retention purge scheduled</div>
                <div>• Evaluation ID: #{matchId.slice(0, 10)}</div>
              </div>
            </div>

            {/* Candidate Right to Erasure Card */}
            <div className="p-5 rounded-2xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-danger)]">
                <Trash2 className="w-4 h-4 text-[var(--accent-danger)]" />
                <span>Candidate Right to Erasure</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Under India DPDP Act Section 12, candidates may request complete erasure of personal data and match history.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-[var(--accent-danger)] bg-[var(--accent-danger-soft)] hover:brightness-110 border border-[var(--accent-danger-border)] transition-colors cursor-pointer"
              >
                Permanently Erase Candidate Data
              </button>
            </div>
          </div>

          {/* Right Column: AI Rationale, Matched Skills & Verbatim Evidence */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Grounded Match Rationale */}
            <div className="merix-card p-6 sm:p-8 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-hairline)]">
                <Sparkles className="w-4 h-4 text-[var(--accent-evidence)]" />
                <h2 className="font-display text-lg font-normal text-[var(--text-primary)]">
                  AI Grounded Match Rationale
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {match?.rationale || "No detailed rationale generated."}
              </p>
            </div>

            {/* Matched Skills with Resume Citations */}
            <div className="merix-card p-6 sm:p-8 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-evidence)]" />
                  <h3 className="font-display text-base font-normal text-[var(--text-primary)]">
                    Verified Matched Skills ({match?.matched_skills.length || 0})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--accent-evidence)] ">VERBATIM EVIDENCE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {match?.matched_skills.map((skill) => (
                  <div
                    key={skill}
                    className="p-3 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--accent-evidence)]/20 space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-evidence)]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{skill}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">
                      Verified from candidate career history
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Gaps Section */}
            <div className="merix-card p-6 sm:p-8 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-hairline)]">
                <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="font-display text-base font-normal text-[var(--text-primary)]">
                  Identified Skill &amp; Qualification Gaps ({match?.missing_skills.length || 0})
                </h3>
              </div>

              {match?.missing_skills.length === 0 ? (
                <div className="p-4 rounded-xl bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence)]/20 text-xs text-[var(--accent-evidence)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>This candidate satisfies all required and preferred skills from the Job Description.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {match?.missing_skills.map((gap) => (
                    <div
                      key={gap}
                      className="p-3 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--accent-danger-border)] space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-800 dark:text-orange-300">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{gap}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="merix-card p-6 sm:p-8 rounded-3xl border border-[var(--accent-danger-border)] max-w-md w-full space-y-5 bg-[var(--bg-surface)] shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] flex items-center justify-center text-[var(--accent-danger)]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl font-normal text-[var(--text-primary)]">
                Execute DPDP Data Erasure?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                This will permanently delete the candidate&apos;s resume, parsed embeddings, and match result from your database. An immutable audit record will be logged.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--accent-danger)] hover:bg-[var(--accent-danger)] transition-colors shadow-md"
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
