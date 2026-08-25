"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { JobSummary } from "@/lib/types";
import { DPDPBadge } from "@/components/dpdp-badge";
import { CountUp } from "@/components/count-up";
import { PageHeader, buttonClasses } from "@/components/ui";
import {
  Briefcase,
  PlusCircle,
  Users,
  ArrowRight,
  Sparkles,
  Search,
  AlertCircle,
  Clock,
  UploadCloud,
  ListOrdered,
  Play,
  ChevronDown,
  Loader2,
  Trash2,
  FileText,
} from "lucide-react";

/* ---------- helpers ---------- */

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

type PipelineState = "draft" | "ready" | "screened";

function pipelineState(job: JobSummary): PipelineState {
  if ((job.match_count || 0) > 0) return "screened";
  if ((job.resume_count || 0) > 0) return "ready";
  return "draft";
}

const STATE_META: Record<
  PipelineState,
  { label: string; cls: string }
> = {
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<"newest" | "candidates" | "evaluations">("newest");
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listJobs();
      setJobs(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load jobs";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Deferred so the effect body performs no synchronous state update
    // (react-hooks/set-state-in-effect); behaviour is unchanged.
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        loadJobs();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, router]);

  const handleDeleteJob = async (job: JobSummary) => {
    const confirmed = window.confirm(
      `Delete "${job.title}"? This permanently removes its ${job.resume_count || 0} resumes and ${job.match_count || 0} evaluations. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingJobId(job.id);
    setError(null);
    try {
      await api.deleteJob(job.id);
      await loadJobs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeletingJobId(null);
    }
  };

  const filteredJobs = jobs
    .filter((job) => job.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === "candidates") return (b.resume_count || 0) - (a.resume_count || 0);
      if (sortMode === "evaluations") return (b.match_count || 0) - (a.match_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const readyJobs = jobs.filter((j) => pipelineState(j) === "ready").slice(0, 3);

  const totalResumes = jobs.reduce((acc, j) => acc + (j.resume_count || 0), 0);
  const totalMatches = jobs.reduce((acc, j) => acc + (j.match_count || 0), 0);

  return (
    <div className="min-h-screen pb-16 bg-[var(--bg-canvas)] text-[var(--text-primary)]">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Strip */}
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              Recruiter Workspace
              <DPDPBadge variant="row" />
            </span>
          }
          description={`Organisation: ${user?.org_name || "Active Workspace"} • DPDP Act 2023 Verified`}
          actions={
            <Link href="/jobs/new" className={buttonClasses("primary")}>
              <PlusCircle className="w-4 h-4" />
              <span>Post New Job Description</span>
            </Link>
          }
        />

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-1">
            <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Active Job Postings
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--text-primary)]">
              {jobs.length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-1">
            <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Resumes Ingested
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--brand-primary)]">
              {totalResumes}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-1">
            <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Evaluations with Verbatim Citations
            </div>
            <div className="text-3xl font-mono font-bold text-[var(--accent-evidence)]">
              {totalMatches}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-sm text-[var(--accent-danger)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Job List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job roles..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>

            <div className="relative shrink-0">
              <select
                value={sortMode}
                onChange={(e) =>
                  setSortMode(e.target.value as "newest" | "candidates" | "evaluations")
                }
                className="appearance-none pl-4 pr-9 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
                aria-label="Sort jobs"
              >
                <option value="newest">Newest first</option>
                <option value="candidates">Most candidates</option>
                <option value="evaluations">Most evaluations</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Resume where you left off */}
          {!loading && readyJobs.length > 0 && (
            <div className="merix-card p-4 border-l-4 border-l-[var(--brand-primary)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                <Play className="w-3.5 h-3.5" />
                Resume where you left off
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {readyJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}/upload`}
                    className="flex-1 flex items-center justify-between gap-2 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] group hover:border-[var(--brand-border)] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {job.title}
                      </div>
                      <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                        {job.resume_count} resumes waiting · not screened yet
                      </div>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--brand-primary)] group-hover:bg-[var(--brand-primary-hover)] transition-colors inline-flex items-center gap-1">
                      Run Screening
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {loading && jobs.length === 0 ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="merix-card p-6 space-y-4 animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-5 w-2/3 rounded bg-[var(--bg-subtle)]" />
                  <div className="h-3.5 w-1/3 rounded bg-[var(--bg-subtle)]" />
                  <div className="flex gap-1.5">
                    <div className="h-6 w-16 rounded-md bg-[var(--bg-subtle)]" />
                    <div className="h-6 w-20 rounded-md bg-[var(--bg-subtle)]" />
                    <div className="h-6 w-14 rounded-md bg-[var(--bg-subtle)]" />
                  </div>
                  <div className="pt-3 border-t border-[var(--border-hairline)] flex justify-between">
                    <div className="h-8 w-24 rounded-lg bg-[var(--bg-subtle)]" />
                    <div className="h-8 w-28 rounded-lg bg-[var(--bg-subtle)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center merix-card space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--brand-soft)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-primary)] mx-auto">
                <Briefcase className="w-7 h-7" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h2 className="font-display text-2xl text-[var(--text-primary)]">
                  Your Hiring Pipeline Starts Here
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                  Post your first Job Description to set up your deterministic 70/20/10 scoring rubric, then batch drop candidate resumes to generate an auditable ranked shortlist.
                </p>
              </div>

              <Link
                href="/jobs/new"
                className={buttonClasses("primary", "lg")}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Job</span>
              </Link>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center merix-card text-sm text-[var(--text-muted)]">
              No jobs match &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            /* Jobs Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => {
                const state = pipelineState(job);
                const meta = STATE_META[state];
                const skills = (job.parsed?.required_skills || []).slice(0, 4);
                const extraSkills = (job.parsed?.required_skills || []).length - skills.length;

                return (
                  <div
                    key={job.id}
                    className="merix-card p-6 space-y-4 flex flex-col justify-between merix-card-hover"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-bold text-base text-[var(--text-primary)] leading-snug hover:text-[var(--brand-primary)] transition-colors block"
                            title="View job details & JD"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
                            <Clock className="w-3 h-3" />
                            {timeAgo(job.created_at)}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                      </div>

                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-xs font-mono text-[var(--text-secondary)]"
                            >
                              {skill}
                            </span>
                          ))}
                          {extraSkills > 0 && (
                            <span className="px-2 py-0.5 text-xs font-mono text-[var(--text-muted)] self-center">
                              +{extraSkills} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-mono text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {job.resume_count || 0} Resumes
                        </span>
                        <span>•</span>
                        <span>{job.match_count || 0} Evaluations</span>
                        <span>•</span>
                        <span className="text-[var(--accent-evidence)]">
                          {job.shortlisted_count || 0} Shortlisted
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          title="View the original JD & scoring rubric"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View JD</span>
                        </Link>
                        <Link
                          href={`/jobs/${job.id}/upload`}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          Upload Resumes
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job)}
                          disabled={deletingJobId === job.id}
                          aria-label={`Delete ${job.title}`}
                          title="Delete job posting"
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-danger)] hover:bg-[var(--accent-danger-soft)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingJobId === job.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <Link
                        href={
                          state === "screened"
                            ? `/jobs/${job.id}/results`
                            : `/jobs/${job.id}/upload`
                        }
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors"
                      >
                        <span>
                          {state === "screened"
                            ? "View Shortlist"
                            : state === "ready"
                              ? "Screen Now"
                              : "Add Candidates"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
