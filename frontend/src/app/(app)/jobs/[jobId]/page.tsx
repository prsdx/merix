"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult, Resume } from "@/lib/types";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Users,
  Clock,
  UploadCloud,
  ListOrdered,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  Copy,
  Award,
  ListChecks,
} from "lucide-react";

type PipelineState = "draft" | "ready" | "screened";

const STATE_META: Record<PipelineState, { label: string; cls: string }> = {
  draft: {
    label: "Draft",
    cls: "bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-hairline)]",
  },
  ready: {
    label: "Ready to Screen",
    cls: "bg-[var(--brand-soft)] text-[var(--brand-primary)] border-[var(--brand-border)]",
  },
  screened: {
    label: "Screened",
    cls: "bg-[var(--accent-evidence-soft)] text-[var(--accent-evidence)] border-[var(--accent-evidence-border)]",
  },
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = String(params.jobId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Deferred so the effect body performs no synchronous state update
    // (react-hooks/set-state-in-effect); behaviour is unchanged.
    const timer = setTimeout(() => {
      if (!isAuthenticated) return;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          // The job itself first — the JD text is the reason this page exists.
          // Counts are best-effort: a failed stats fetch must not hide the JD.
          const data = await api.getJob(jobId);
          setJob(data);
          try {
            setResumes(await api.listJobResumes(jobId));
          } catch {
            /* stats are optional */
          }
          try {
            const shortlist = await api.listMatches(jobId);
            setMatches(shortlist.results);
          } catch {
            setMatches(null);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load job posting";
          setError(msg);
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, jobId, router]);

  const handleCopyJd = async () => {
    if (!job?.raw_text) return;
    try {
      await navigator.clipboard.writeText(job.raw_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-canvas)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)] mb-3" />
        <span className="text-sm text-[var(--text-muted)] font-mono">Loading Job Posting...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-[var(--bg-canvas)] px-4">
        <AlertCircle className="w-8 h-8 text-[var(--accent-danger)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          {error || "This job posting could not be found."}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }
  const resumeCount = resumes.length;
  const matchCount = matches ? matches.length : 0;
  const shortlistedCount = matches ? matches.filter((m) => m.status === "shortlisted").length : 0;

  const state: PipelineState =
    matchCount > 0 ? "screened" : resumeCount > 0 ? "ready" : "draft";
  const meta = STATE_META[state];

  const requiredSkills = job.parsed?.required_skills || [];
  const preferredSkills = job.parsed?.preferred_skills || [];

  return (
    <div className="min-h-screen pb-16 bg-[var(--bg-canvas)] text-[var(--text-primary)]">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <DPDPBadge variant="row" />
        </div>

        {/* Header Card */}
        <div className="merix-card p-6 sm:p-8 rounded-3xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Briefcase className="w-3.5 h-3.5" />
                JOB POSTING · SCORING RUBRIC &amp; ORIGINAL JD
              </div>
              <h1 className="font-display text-2xl sm:text-3xl leading-tight break-words">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-mono text-[var(--text-muted)]">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${meta.cls}`}>
                  {meta.label}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Posted {timeAgo(job.created_at)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {resumeCount} Resumes
                </span>
                <span>•</span>
                <span>{matchCount} Evaluations</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[var(--accent-evidence)]">
                  <Award className="w-3 h-3" />
                  {shortlistedCount} Shortlisted
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {state === "screened" && (
                <>
                  <Link
                    href={`/jobs/${job.id}/results`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] shadow-xs transition-all"
                  >
                    <ListOrdered className="w-4 h-4" />
                    <span>View Shortlist</span>
                  </Link>
                  <Link
                    href={`/jobs/${job.id}/upload`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>More Resumes</span>
                  </Link>
                </>
              )}
              {state === "ready" && (
                <Link
                  href={`/jobs/${job.id}/upload`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] shadow-xs transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Screen Now</span>
                </Link>
              )}
              {state === "draft" && (
                <Link
                  href={`/jobs/${job.id}/upload`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] shadow-xs transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Add Candidates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-sm text-[var(--accent-danger)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Extracted Rubric */}
          <div className="lg:col-span-5 space-y-4">
            <div className="merix-card p-6 rounded-3xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-evidence)]" />
                  <span className="text-sm font-mono font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                    Extracted Scoring Rubric
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--accent-evidence)]">EXTRACT ONCE • MATCH ALL</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  <span>Required Skills</span>
                  <span className="text-[var(--brand-primary)] font-bold">70% weight</span>
                </div>
                {requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--brand-soft)] text-[var(--brand-primary)] border border-[var(--brand-border)]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--text-muted)] italic">
                    None extracted — candidates are not scored on required skills.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  <span>Preferred Qualifications</span>
                  <span className="text-[var(--text-secondary)] font-bold">20% weight</span>
                </div>
                {preferredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {preferredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--text-muted)] italic">None extracted.</div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-hairline)] grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Min Experience · 10%
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {job.parsed?.min_years_experience != null
                      ? `${job.parsed.min_years_experience}+ years`
                      : "Not specified"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Education
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {job.parsed?.education_level || "Not specified"}
                  </div>
                </div>
              </div>

              {job.parsed?.summary && (
                <div className="pt-3 border-t border-[var(--border-hairline)]">
                  <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Role Summary
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{job.parsed.summary}</p>
                </div>
              )}

              <div className="flex items-start gap-2 text-xs font-mono text-[var(--text-muted)]">
                <ListChecks className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--accent-evidence)]" />
                <span>
                  This rubric is cached at creation time for determinism — every candidate is scored against exactly this.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Original JD Reader */}
          <div className="lg:col-span-7 space-y-4">
            <div className="merix-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="text-sm font-mono font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                    Original Job Description
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyJd}
                  disabled={!job.raw_text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy the full JD to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-evidence)]" />
                      <span className="text-[var(--accent-evidence)]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JD</span>
                    </>
                  )}
                </button>
              </div>

              {job.raw_text ? (
                <div className="jd-reader max-w-none">{job.raw_text}</div>
              ) : (
                <div className="p-6 text-center text-sm text-[var(--text-muted)] italic">
                  No description text stored for this posting.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

