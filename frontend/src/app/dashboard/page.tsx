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
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
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
        <Loader2 className="w-8 h-8 animate-spin text-[#00D4AA] mb-3" />
        <span className="text-xs text-[#A8A5A0] font-mono">Loading Organisation Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#00D4AA] uppercase tracking-wider">
                ORGANISATION WORKSPACE
              </span>
              <DPDPBadge variant="row" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#E8E6E1]">
              {user?.org_name || "Organisation Pipeline"}
            </h1>
            <p className="text-xs text-[#A8A5A0]">
              Logged in as <span className="font-mono text-[#E8E6E1]">{user?.email}</span>
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            style={{
              background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
              boxShadow: "0 4px 16px rgba(0,212,170,0.25)",
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadJobs}
              className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-mono text-[11px] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A8A5A0]">
              <span className="font-mono uppercase tracking-wider">Active Job Postings</span>
              <Briefcase className="w-4 h-4 text-[#00D4AA]" />
            </div>
            <div className="font-mono text-3xl font-bold text-[#E8E6E1]">
              <CountUp to={jobs.length} />
            </div>
            <div className="text-[11px] text-[#A8A5A0]">Configured evaluation targets</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A8A5A0]">
              <span className="font-mono uppercase tracking-wider">Total Resumes Screened</span>
              <Users className="w-4 h-4 text-[#00D4AA]" />
            </div>
            <div className="font-mono text-3xl font-bold text-[#00D4AA]">
              <CountUp to={totalResumes} />
            </div>
            <div className="text-[11px] text-[#A8A5A0]">With explicit DPDP consent recorded</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A8A5A0]">
              <span className="font-mono uppercase tracking-wider">Evaluations Run</span>
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="font-mono text-3xl font-bold text-[#22C55E]">
              <CountUp to={totalMatches} />
            </div>
            <div className="text-[11px] text-[#A8A5A0]">Evidence-grounded scored dossiers</div>
          </div>
        </div>

        {/* Empty State vs Job List */}
        {jobs.length === 0 && !loading ? (
          <div className="glass-panel rounded-3xl p-10 md:p-14 border border-white/10 text-center space-y-8 max-w-3xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#00D4AA]/10 border border-[#00D4AA]/25 flex items-center justify-center text-[#00D4AA] mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#E8E6E1]">
                Your Hiring Pipeline Starts Here
              </h2>
              <p className="text-xs text-[#A8A5A0] leading-relaxed">
                Post your first Job Description to begin batch processing candidate resumes with grounded, explainable scoring.
              </p>
            </div>

            {/* 3-Step Walkthrough */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center font-mono font-bold text-xs">
                  1
                </div>
                <div className="font-semibold text-xs text-[#E8E6E1]">Post Job Description</div>
                <div className="text-[11px] text-[#A8A5A0]">
                  Paste JD text to extract required technical & preferred skills.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center font-mono font-bold text-xs">
                  2
                </div>
                <div className="font-semibold text-xs text-[#E8E6E1]">Upload Resumes</div>
                <div className="text-[11px] text-[#A8A5A0]">
                  Batch upload up to 100 PDFs with automated DPDP consent gate.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center font-mono font-bold text-xs">
                  3
                </div>
                <div className="font-semibold text-xs text-[#E8E6E1]">Ranked Shortlist</div>
                <div className="text-[11px] text-[#A8A5A0]">
                  Inspect 0–100 match scores and export CSV shortlists.
                </div>
              </div>
            </div>

            <Link
              href="/jobs/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-xs text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                boxShadow: "0 4px 20px rgba(0,212,170,0.3)",
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
              <div className="text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                Active Jobs ({filteredJobs.length})
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#A8A5A0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search job titles..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#A8A5A0]/50 focus:border-[#00D4AA] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm text-[#E8E6E1] hover:text-[#00D4AA] transition-colors">
                          <Link href={`/jobs/${job.id}/results`}>{job.title}</Link>
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#A8A5A0] mt-1">
                          <Clock className="w-3 h-3 text-[#A8A5A0]" />
                          <span>Created {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <DPDPBadge variant="row" />
                    </div>

                    {/* Counts Row */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                      <div>
                        <div className="text-[#A8A5A0] text-[10px]">CANDIDATE RESUMES</div>
                        <div className="text-sm font-bold text-[#E8E6E1]">{job.resume_count || 0}</div>
                      </div>
                      <div>
                        <div className="text-[#A8A5A0] text-[10px]">EVALUATIONS RUN</div>
                        <div className="text-sm font-bold text-[#00D4AA]">{job.match_count || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <Link
                      href={`/jobs/${job.id}/upload`}
                      className="inline-flex items-center gap-1.5 text-[#A8A5A0] hover:text-[#E8E6E1] transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-[#00D4AA]" />
                      <span>Upload Resumes</span>
                    </Link>

                    <Link
                      href={`/jobs/${job.id}/results`}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#00D4AA] hover:underline"
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
              <div className="p-8 text-center text-xs text-[#A8A5A0] font-mono">
                No job postings found matching &quot;{searchTerm}&quot;.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
