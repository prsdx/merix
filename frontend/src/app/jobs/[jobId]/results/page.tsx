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
  Search,
  ArrowLeft,
  UploadCloud,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

export default function RankedResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [minScoreFilter, setMinScoreFilter] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && jobId) {
      loadData();
    }
  }, [authLoading, isAuthenticated, jobId, minScoreFilter, router]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobData, shortlistData] = await Promise.all([
        api.getJob(jobId),
        api.listMatches(jobId, minScoreFilter),
      ]);
      setJob(jobData);
      setMatches(shortlistData.results);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load ranked matches";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    const query = searchTerm.toLowerCase();
    const nameMatch = (m.candidate_name || "").toLowerCase().includes(query);
    const skillMatch = m.matched_skills.some((s) => s.toLowerCase().includes(query));
    return nameMatch || skillMatch;
  });

  const exportUrl = api.getExportUrl(jobId, minScoreFilter);

  if (authLoading || (loading && !job)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400 mb-3" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading Ranked Shortlist...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100">
                {job?.title}
              </h1>
              <DPDPBadge variant="row" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked shortlist based on 70/20/10 deterministic skill comparison.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/jobs/${jobId}/upload`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Add More Resumes</span>
            </Link>

            <a
              href={exportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md hover:opacity-95 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
              }}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV Shortlist</span>
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Threshold Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
              Filter by Fit:
            </span>
            {[
              { label: "All Candidates", value: undefined },
              { label: "80+ Strong Fit", value: 80 },
              { label: "70+ Good Fit", value: 70 },
              { label: "60+ Moderate Fit", value: 60 },
            ].map((f) => {
              const active = minScoreFilter === f.value;
              return (
                <button
                  key={f.label}
                  onClick={() => setMinScoreFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-teal-700 dark:bg-teal-400 text-white dark:text-slate-900 font-bold shadow-xs"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate or skill..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Ranked Candidate Data Table */}
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
          {filteredMatches.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-normal text-slate-900 dark:text-slate-100">
                  No Candidates Match Filter Criteria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {minScoreFilter
                    ? `No candidates scored above ${minScoreFilter}. Try resetting the filter.`
                    : "No resume evaluations found. Upload candidate resumes to generate scores."}
                </p>
              </div>
              {minScoreFilter && (
                <button
                  onClick={() => setMinScoreFilter(undefined)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-500/10 border border-teal-500/25 hover:bg-teal-500/20 transition-colors"
                >
                  Clear Threshold Filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/40 text-slate-500 dark:text-slate-400 font-mono">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4 w-1/4">Candidate Details</th>
                    <th className="p-4 w-28 text-center">Match Score</th>
                    <th className="p-4 w-1/3">Matched Skills (Verified)</th>
                    <th className="p-4">Identified Gaps</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
                  {filteredMatches.map((m, idx) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => router.push(`/jobs/${jobId}/candidates/${m.id}`)}
                    >
                      {/* Rank */}
                      <td className="p-4 text-center font-mono font-bold text-sm text-slate-400 dark:text-slate-500">
                        #{idx + 1}
                      </td>

                      {/* Candidate Name & Info */}
                      <td className="p-4">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {m.candidate_name || `Candidate #${m.id.slice(0, 6)}`}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <DPDPBadge variant="row" />
                          <span>Evaluation #MX-{m.id.slice(0, 5)}</span>
                        </div>
                      </td>

                      {/* Score Ring Centerpiece */}
                      <td className="p-4 text-center">
                        <div className="inline-flex justify-center">
                          <ScoreRing score={m.score} size={54} strokeWidth={5} animated={true} />
                        </div>
                      </td>

                      {/* Matched Skills */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {m.matched_skills.slice(0, 4).map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/25"
                            >
                              {sk}
                            </span>
                          ))}
                          {m.matched_skills.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                              +{m.matched_skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Missing Gaps */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {m.missing_skills.length === 0 ? (
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                              No critical gaps
                            </span>
                          ) : (
                            m.missing_skills.slice(0, 2).map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25"
                              >
                                {sk}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/jobs/${jobId}/candidates/${m.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend strip */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              <span className="text-slate-800 dark:text-slate-200">80–100: Strong Fit (Interview Shortlist)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500" />
              <span className="text-slate-800 dark:text-slate-200">60–79: Moderate Fit (Preferred Gap)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-600 dark:bg-orange-500" />
              <span className="text-slate-800 dark:text-slate-200">&lt;60: Needs Review</span>
            </div>
          </div>
          <DPDPBadge variant="pill" />
        </div>
      </main>
    </div>
  );
}
