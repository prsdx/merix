"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { JobSummary } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import { CountUp } from "@/components/count-up";
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
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400 mb-3" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading Organisation Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-teal-700 dark:text-teal-400 uppercase tracking-wider font-semibold">
                ORGANISATION WORKSPACE
              </span>
              <DPDPBadge variant="row" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-slate-900 dark:text-slate-100">
              {user?.org_name || "Organisation Pipeline"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logged in as <span className="font-mono text-slate-800 dark:text-slate-200">{user?.email}</span>
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95 shrink-0"
            style={{
              background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadJobs}
              className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-800 dark:text-rose-200 font-mono text-[11px] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono uppercase tracking-wider">Active Job Postings</span>
              <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-slate-100">
              <CountUp to={jobs.length} />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Configured evaluation targets</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono uppercase tracking-wider">Total Resumes Screened</span>
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-teal-700 dark:text-teal-400">
              <CountUp to={totalResumes} />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">With explicit DPDP consent recorded</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono uppercase tracking-wider">Evaluations Run</span>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              <CountUp to={totalMatches} />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Evidence-grounded scored dossiers</div>
          </div>
        </div>

        {/* Empty State vs Job List */}
        {jobs.length === 0 && !loading ? (
          <div className="glass-panel rounded-3xl p-10 md:p-14 border border-slate-200 dark:border-white/10 text-center space-y-8 max-w-3xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-700 dark:text-teal-400 mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100">
                Your Hiring Pipeline Starts Here
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Post your first Job Description to begin batch processing candidate resumes with grounded, explainable scoring.
              </p>
            </div>

            {/* 3-Step Walkthrough */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-mono font-bold text-xs">
                  1
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Post Job Description</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Paste JD text to extract required technical & preferred skills.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-mono font-bold text-xs">
                  2
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Upload Resumes</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Batch upload up to 100 PDFs with automated DPDP consent gate.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-mono font-bold text-xs">
                  3
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Ranked Shortlist</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Inspect 0–100 match scores and export CSV shortlists.
                </div>
              </div>
            </div>

            <Link
              href="/jobs/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95"
              style={{
                background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
              }}
            >
              <span>Post Your First Job</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Jobs ({filteredJobs.length})
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search job titles..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
                          <Link href={`/jobs/${job.id}/results`}>{job.title}</Link>
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Created {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <DPDPBadge variant="row" />
                    </div>

                    {/* Counts Row */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-xs font-mono">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">CANDIDATE RESUMES</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{job.resume_count || 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">EVALUATIONS RUN</div>
                        <div className="text-sm font-bold text-teal-700 dark:text-teal-400">{job.match_count || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                    <Link
                      href={`/jobs/${job.id}/upload`}
                      className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Upload Resumes</span>
                    </Link>

                    <Link
                      href={`/jobs/${job.id}/results`}
                      className="inline-flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>View Shortlist</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && searchTerm && (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                No job postings found matching &quot;{searchTerm}&quot;.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
