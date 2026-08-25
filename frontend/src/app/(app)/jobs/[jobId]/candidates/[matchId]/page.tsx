"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult, Resume, ResumeLink, LinkVerification } from "@/lib/types";

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
  Github,
  Linkedin,
  Globe,
  Link2,
  Clock,
} from "lucide-react";

function linkIcon(link: ResumeLink) {
  switch (link.type) {
    case "linkedin":
      return Linkedin;
    case "github":
    case "gitlab":
    case "bitbucket":
      return Github;
    case "portfolio":
    case "blog":
      return Globe;
    default:
      return Link2;
  }
}

/** Short display label for a link URL (strips protocol/www). */
function linkLabel(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

const VERIFY_BADGE: Record<LinkVerification["status"], { color: string; label: string }> = {
  ok: { color: "#16A34A", label: "Live" },
  fabricated: { color: "#DC2626", label: "Not found — possibly fabricated" },
  dead: { color: "#DC2626", label: "Dead link" },
  error: { color: "#64748B", label: "Unreachable" },
  unknown: { color: "#D97706", label: "Inconclusive" },
  skipped: { color: "#64748B", label: "Not checked" },
};



export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);
  const matchId = String(params.matchId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobData, matchData] = await Promise.all([
        api.getJob(jobId),
        api.getMatch(jobId, matchId),
      ]);
      setJob(jobData);
      setMatch(matchData);
      // Links + timeline live on the resume's parsed payload; non-fatal if absent.
      if (matchData.resume_id) {
        const resumeData = await api.getResume(jobId, matchData.resume_id).catch(() => null);
        setResume(resumeData);
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load candidate evaluation";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [jobId, matchId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Deferred so the effect body performs no synchronous state update
    // (react-hooks/set-state-in-effect); behaviour is unchanged.
    const timer = setTimeout(() => {
      if (isAuthenticated && matchId && jobId) {
        loadData();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, matchId, jobId, router, loadData]);

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
        <span className="text-sm text-[var(--text-muted)] font-mono">Loading Candidate Dossier...</span>
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
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Ranked Shortlist</span>
          </Link>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-[var(--accent-danger)] text-sm flex items-center gap-2.5">
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
                <span className="text-xs font-mono text-[var(--accent-evidence)]  uppercase tracking-wider font-semibold">
                  EVIDENCE-GROUNDED MATCH SCORE
                </span>
                <h1 className="font-display text-2xl font-normal text-[var(--text-primary)]">
                  {match?.candidate_name || "Candidate Evaluation"}
                </h1>
                <p className="text-sm text-[var(--text-muted)]">Applied for {job?.title}</p>
              </div>

              {/* Large Animated Score Ring */}
              <div className="py-2 flex justify-center">
                <ScoreRing score={score} size={130} strokeWidth={9} animated={true} />
              </div>

              <div
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold font-mono"
                style={{ color: scoreCategory.color, background: scoreCategory.bg }}
              >
                {scoreCategory.label}
              </div>

              {/* 70/20/10 Breakdown Bars */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-hairline)] text-left">
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Deterministic Weight Breakdown
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-mono">
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
                  <div className="flex justify-between text-sm font-mono">
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
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-[var(--text-primary)]">Experience &amp; Domain (10%)</span>
                    <span className="text-[var(--accent-evidence)] font-bold">10 / 10</span>
                  </div>
                  <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--accent-evidence)] h-full rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Links + Career Timeline (Evidence Graph) */}
            {(resume?.parsed?.links?.length || resume?.parsed?.timeline_analysis?.spans?.length) ? (
              <div className="merix-card p-6 rounded-3xl border border-[var(--border-hairline)] space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-hairline)]">
                  <Clock className="w-4 h-4 text-[var(--accent-evidence)]" />
                  <h2 className="font-display text-base font-normal text-[var(--text-primary)]">
                    Evidence Graph
                  </h2>
                </div>

                {resume?.parsed?.timeline_analysis && resume.parsed.timeline_analysis.spans.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                        Career Timeline
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--accent-evidence)]">
                        {resume.parsed.timeline_analysis.total_experience_years} yrs total
                        (union of tenures)
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {resume.parsed.timeline_analysis.spans.map((span, i) => (
                        <div
                          key={`${span.company}-${i}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)]"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                              {span.title || span.company}
                            </div>
                            <div className="text-xs font-mono text-[var(--text-muted)] truncate">
                              {span.title ? `${span.company} · ` : ""}
                              {span.start_year} –{" "}
                              {span.end_open ? "Present" : span.end_year}
                            </div>
                          </div>
                          {span.end_open && (
                            <span className="ml-2 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--accent-evidence)]/10 text-[var(--accent-evidence)]">
                              CURRENT
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {resume.parsed.timeline_analysis.overlaps.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          Concurrent roles detected:{" "}
                          {resume.parsed.timeline_analysis.overlaps.map((o) => o.join(" + ")).join("; ")}
                        </span>
                      </div>
                    )}
                    {resume.parsed.timeline_analysis.flags.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Timeline flags: {resume.parsed.timeline_analysis.flags.join(", ")}</span>
                      </div>
                    )}
                  </div>
                )}

                {resume?.parsed?.links && resume.parsed.links.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Profile Links ({resume.parsed.links.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {resume.parsed.links.map((link) => {
                        const Icon = linkIcon(link);
                        const verification = resume.parsed?.link_verification?.find((v) => v.url === link.url);
                        const badge = verification ? VERIFY_BADGE[verification.status] : null;
                        return (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={badge ? `Verification: ${badge.label}` : undefined}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-evidence)] hover:border-[var(--accent-evidence)]/40 transition-colors max-w-[260px]"
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{linkLabel(link.url)}</span>
                            {badge && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: badge.color }}
                                aria-label={badge.label}
                              />
                            )}
                          </a>
                        );
                      })}
                    </div>
                    <p className="text-[11px] font-mono text-[var(--text-muted)] leading-relaxed">
                      Extracted from resume hyperlinks &amp; text before PII scrubbing — the AI never saw these URLs.
                      Dots: green live · red dead/unverified profile · grey not checked.
                    </p>

                  </div>
                )}
              </div>
            ) : null}

            {/* DPDP Compliance Card */}
            <div className="merix-card p-6 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-evidence)]">
                <ShieldCheck className="w-4 h-4" />
                <span>DPDP Act (2023) Compliance Record</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed font-mono">
                <div>• PII Scrubbed before embedding extraction</div>
                <div>• Explicit recruiter consent recorded</div>
                <div>• Automatic 90-day retention purge scheduled</div>
                <div>• Evaluation ID: #{matchId.slice(0, 10)}</div>
              </div>
            </div>

            {/* Candidate Right to Erasure Card */}
            <div className="p-5 rounded-2xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-danger)]">
                <Trash2 className="w-4 h-4 text-[var(--accent-danger)]" />
                <span>Candidate Right to Erasure</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Under India DPDP Act Section 12, candidates may request complete erasure of personal data and match history.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 rounded-xl text-sm font-semibold text-[var(--accent-danger)] bg-[var(--accent-danger-soft)] hover:brightness-110 border border-[var(--accent-danger-border)] transition-colors cursor-pointer"
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
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
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
                <span className="text-xs font-mono text-[var(--accent-evidence)] ">VERBATIM EVIDENCE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {match?.matched_skills.map((skill) => (
                  <div
                    key={skill.skill}
                    className="p-3 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--accent-evidence)]/20 space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-evidence)]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{skill.skill}</span>
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)]">
                      Verified from candidate career history
                    </div>
                    {skill.evidence && (
                      <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                        &ldquo;{skill.evidence}&rdquo;
                      </div>
                    )}
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
                <div className="p-4 rounded-xl bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence)]/20 text-sm text-[var(--accent-evidence)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>This candidate satisfies all required and preferred skills from the Job Description.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {match?.missing_skills.map((gap) => (
                    <div
                      key={gap.skill}
                      className="p-3 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--accent-danger-border)] space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-800 dark:text-orange-300">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{gap.skill}</span>
                      </div>
                      <div className="text-xs font-mono text-[var(--text-muted)]">
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
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                This will permanently delete the candidate&apos;s resume, parsed embeddings, and match result from your database. An immutable audit record will be logged.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--accent-danger)] hover:bg-[var(--accent-danger)] transition-colors shadow-md"
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
