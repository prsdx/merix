"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { JobSummary } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  Briefcase,
  PlusCircle,
  FileText,
  Users,
  Download,
  ArrowRight,
  Sparkles,
  Clock,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
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
        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-3" />
        <span className="text-xs text-zinc-400 font-mono">Loading Organisation Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Workspace Greeting & Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Placement & Recruitment Dashboard
              </h1>
              <DPDPBadge variant="pill" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              Manage active job openings, upload candidate resume batches, and inspect explainable match scores.
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Active Job Openings</span>
              <Briefcase className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{jobs.length}</div>
          </div>

          <div className="p-4 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Resumes Ingested</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-300">{totalResumes}</div>
          </div>

          <div className="p-4 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Matches Evaluated</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{totalMatches}</div>
          </div>

          <div className="p-4 rounded-2xl glass-panel">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>DPDP Retention Clock</span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-300">90 Days</div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              <button
                onClick={loadJobs}
                className="ml-3 underline hover:text-rose-200 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search job titles..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        </div>

        {/* Jobs List / Empty State */}
        {jobs.length === 0 ? (
          /* Empty State */
          <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto my-12 border border-white/10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Job Openings</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Post your first Job Description to extract requirements, upload candidate resumes in batches, and generate explainable match scores.
              </p>
            </div>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Job</span>
            </Link>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 text-xs text-zinc-500 font-mono">
            No job matches found for &quot;{searchTerm}&quot;.
          </div>
        ) : (
          /* Populated State: Job Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const hasMatches = (job.match_count || 0) > 0;
              const hasResumes = (job.resume_count || 0) > 0;

              return (
                <div
                  key={job.id}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between border border-white/10 space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-white tracking-tight line-clamp-1">
                        {job.title}
                      </h3>
                      {hasMatches ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0">
                          Screened
                        </span>
                      ) : hasResumes ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
                          Ready to Match
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/25 shrink-0">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Parsed Required Skills Preview */}
                    {job.parsed?.required_skills && job.parsed.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {job.parsed.required_skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[11px] text-zinc-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.parsed.required_skills.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono">
                            +{job.parsed.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        <strong className="text-white font-mono">{job.resume_count || 0}</strong> resumes
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        <strong className="text-white font-mono">{job.match_count || 0}</strong> ranked
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasMatches ? (
                        <Link
                          href={`/jobs/${job.id}/results`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 font-medium transition-colors"
                        >
                          <span>Results</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/jobs/${job.id}/upload`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium transition-colors"
                        >
                          <span>Upload</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
