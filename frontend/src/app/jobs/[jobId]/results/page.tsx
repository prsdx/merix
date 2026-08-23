"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult, ShortlistResponse } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import { ScoreRing } from "@/components/score-ring";
import {
  Sparkles,
  Download,
  Search,
  ArrowRight,
  ArrowLeft,
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
        <Loader2 className="w-8 h-8 animate-spin text-[#00D4AA] mb-3" />
        <span className="text-xs text-[#A8A5A0] font-mono">Loading Ranked Shortlist...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-[#A8A5A0] hover:text-[#E8E6E1] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#E8E6E1]">
                {job?.title}
              </h1>
              <DPDPBadge variant="row" />
            </div>
            <p className="text-xs text-[#A8A5A0]">
              Ranked shortlist based on 70/20/10 deterministic skill comparison.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/jobs/${jobId}/upload`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#E8E6E1] bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span>Add More Resumes</span>
            </Link>

            <a
              href={exportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
              style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
              }}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV Shortlist</span>
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Threshold Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A8A5A0] mr-1">
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
                      ? "bg-[#00D4AA] text-[#070709] font-bold shadow-md"
                      : "bg-white/[0.04] text-[#A8A5A0] hover:text-[#E8E6E1] border border-white/5"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#A8A5A0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate or skill..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#A8A5A0]/50 focus:border-[#00D4AA] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Ranked Candidate Data Table */}
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {filteredMatches.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A8A5A0] mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-[#E8E6E1]">
                  No Candidates Match Filter Criteria
                </h3>
                <p className="text-xs text-[#A8A5A0]">
                  {minScoreFilter
                    ? `No candidates scored above ${minScoreFilter}. Try resetting the filter.`
                    : "No resume evaluations found. Upload candidate resumes to generate scores."}
                </p>
              </div>
              {minScoreFilter && (
                <button
                  onClick={() => setMinScoreFilter(undefined)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/25 hover:bg-[#00D4AA]/20 transition-colors"
                >
                  Clear Threshold Filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[#A8A5A0] font-mono">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4 w-1/4">Candidate Details</th>
                    <th className="p-4 w-28 text-center">Match Score</th>
                    <th className="p-4 w-1/3">Matched Skills (Verified)</th>
                    <th className="p-4">Identified Gaps</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredMatches.map((m, idx) => (
                    <tr
                      key={m.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => router.push(`/jobs/${jobId}/candidates/${m.id}`)}
                    >
                      {/* Rank */}
                      <td className="p-4 text-center font-mono font-bold text-sm text-[#A8A5A0]">
                        #{idx + 1}
                      </td>

                      {/* Candidate Name & Info */}
                      <td className="p-4">
                        <div className="font-semibold text-sm text-[#E8E6E1] group-hover:text-[#00D4AA] transition-colors">
                          {m.candidate_name || `Candidate #${m.id.slice(0, 6)}`}
                        </div>
                        <div className="text-[11px] font-mono text-[#A8A5A0] mt-0.5 flex items-center gap-1.5">
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
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/25"
                            >
                              {sk}
                            </span>
                          ))}
                          {m.matched_skills.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#A8A5A0]">
                              +{m.matched_skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Missing Gaps */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {m.missing_skills.length === 0 ? (
                            <span className="text-[11px] text-[#22C55E] font-mono">
                              No critical gaps
                            </span>
                          ) : (
                            m.missing_skills.slice(0, 2).map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/25"
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00D4AA] bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20 border border-[#00D4AA]/25 transition-colors"
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
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
              <span className="text-[#E8E6E1]">80–100: Strong Fit (Interview Shortlist)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="text-[#E8E6E1]">60–79: Moderate Fit (Preferred Gap)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F97316]" />
              <span className="text-[#E8E6E1]">&lt;60: Needs Review</span>
            </div>
          </div>
          <DPDPBadge variant="pill" />
        </div>
      </main>
    </div>
  );
}
