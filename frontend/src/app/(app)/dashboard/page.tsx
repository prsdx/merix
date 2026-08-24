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
  Loader2,
  AlertCircle,
  Clock,
  UploadCloud,
  ListOrdered,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadJobs();
    }
  }, [authLoading, isAuthenticated, router]);

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

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalResumes = jobs.reduce((acc, j) => acc + (j.resume_count || 0), 0);
  const totalMatches = jobs.reduce((acc, j) => acc + (j.match_count || 0), 0);

  if (authLoading || (loading && jobs.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-canvas)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)] mb-3" />
        <span className="text-sm text-[var(--text-muted)] font-mono">
          Loading Recruitment Pipeline...
        </span>
      </div>
    );
  }

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
          </div>

          {jobs.length === 0 ? (
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
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="merix-card p-6 space-y-4 flex flex-col justify-between merix-card-hover"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-[var(--text-primary)]">
                        {job.title}
                      </h3>
                      <DPDPBadge variant="row" />
                    </div>

                    <div className="flex items-center gap-3 text-sm font-mono text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {job.resume_count || 0} Resumes
                      </span>
                      <span>•</span>
                      <span>{job.match_count || 0} Evaluations</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2">
                    <Link
                      href={`/jobs/${job.id}/upload`}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Upload Resumes
                    </Link>

                    <Link
                      href={`/jobs/${job.id}/results`}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors"
                    >
                      <span>View Shortlist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
