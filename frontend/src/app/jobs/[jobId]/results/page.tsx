"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult, ShortlistResponse } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  Sparkles,
  Download,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UploadCloud,
  FileText,
  Loader2,
  AlertCircle,
  Layers,
  ChevronRight,
  SlidersHorizontal,
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

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-amber-300 bg-amber-500/10 border-amber-500/30";
    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
  };

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Jobs
              </Link>
              <span>/</span>
              <span className="text-zinc-200 font-medium truncate max-w-xs">{job?.title || "Job"}</span>
              <span>/</span>
              <span className="text-emerald-400 font-medium">Ranked Results</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-violet-400" />
              <span>Explainable Shortlist ({matches.length} Candidates)</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/jobs/${jobId}/upload`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-zinc-400" />
              <span>Upload More</span>
            </Link>

            <a
              href={exportUrl}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Export Shortlist CSV</span>
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 shrink-0 pl-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Threshold:</span>
            </span>

            <button
              onClick={() => setMinScoreFilter(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                minScoreFilter === undefined
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              All Scores
            </button>
            <button
              onClick={() => setMinScoreFilter(80)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                minScoreFilter === 80
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              High Fit (80+)
            </button>
            <button
              onClick={() => setMinScoreFilter(70)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                minScoreFilter === 70
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Good Fit (70+)
            </button>
            <button
              onClick={() => setMinScoreFilter(60)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                minScoreFilter === 60
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Review (60+)
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by candidate or skill..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>
        </div>

        {/* Explainable Ranked Candidates List */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
            <span className="text-xs text-zinc-400 font-mono">Loading Explainable Match Results...</span>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Matching Candidates Found</h3>
            <p className="text-xs text-zinc-400">
              No candidates meet the score threshold of {minScoreFilter || 0}+ with the current search term.
            </p>
            <button
              onClick={() => {
                setMinScoreFilter(undefined);
                setSearchTerm("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match, index) => {
              return (
                <div
                  key={match.id}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  {/* Left: Rank, Name, Skills & Verbatim Rationale Preview */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold font-mono text-zinc-300">
                        {index + 1}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight truncate">
                        {match.candidate_name || `Candidate #${match.resume_id.substring(0, 8)}`}
                      </h3>
                      <DPDPBadge variant="pill" className="text-[10px] py-0.5 px-2" />
                    </div>

                    {/* AI Rationale Preview */}
                    <p className="text-xs text-zinc-300 bg-black/40 rounded-xl p-3 border border-white/5 leading-relaxed">
                      <strong className="text-violet-300 font-medium">Explainable Grounding:</strong>{" "}
                      {match.rationale}
                    </p>

                    {/* Matched & Missing Skills at a Glance (No Hidden Clicks) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {match.matched_skills.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{skill}</span>
                        </span>
                      ))}

                      {match.missing_skills.slice(0, 2).map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-500/10 border border-rose-500/25 text-rose-300"
                        >
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>Missing: {skill}</span>
                        </span>
                      ))}

                      {match.matched_skills.length > 4 && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          +{match.matched_skills.length - 4} more skills
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Score Box & Detailed Drilldown Button */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
                    <div className="text-left md:text-right">
                      <div
                        className={`text-2xl md:text-3xl font-bold font-mono px-3 py-1 rounded-xl border ${getScoreBadgeClass(
                          match.score
                        )}`}
                      >
                        {match.score}
                        <span className="text-xs opacity-60">/100</span>
                      </div>
                    </div>

                    <Link
                      href={`/jobs/${jobId}/candidates/${match.id}`}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/20 transition-all hover:scale-[1.02]"
                    >
                      <span>Full Drilldown</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
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
