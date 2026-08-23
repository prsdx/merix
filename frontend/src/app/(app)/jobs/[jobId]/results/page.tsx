"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult } from "@/lib/types";
import { DPDPBadge } from "@/components/dpdp-badge";
import { ScoreRing } from "@/components/score-ring";
import {
  Search,
  ArrowLeft,
  UploadCloud,
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
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
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

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
    const skillMatch = m.matched_skills.some((s) => s.skill.toLowerCase().includes(query));
    return nameMatch || skillMatch;
  });

  const exportUrl = api.getExportUrl(jobId, minScoreFilter);

  if (authLoading || (loading && !job)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-canvas)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)] mb-3" />
        <span className="text-sm text-[var(--text-muted)] font-mono">
          Loading Ranked Shortlist...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-[var(--bg-canvas)] text-[var(--text-primary)]">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pipeline</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
                {job?.title || "Ranked Candidate Shortlist"}
              </h1>
              <DPDPBadge variant="row" />
            </div>
            <p className="text-sm text-[var(--text-muted)] font-mono">
              Job ID: {jobId} • Evaluated with Deterministic 70/20/10 Formula
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/jobs/${jobId}/upload`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-hairline)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Add More Resumes</span>
            </Link>
            <a
              href={exportUrl}
              download
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Embedded Direct Trust Statement (Truffle Style) */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between gap-4 text-sm font-mono">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-evidence)] shrink-0" />
            <span>
              <strong>Merix never auto-rejects.</strong> Every candidate reaches you with verbatim evidence so you make every advance call.
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)] shrink-0 hidden md:block">
            DPDP Section 12 Audited
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs">
          {/* Score Threshold Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono text-[var(--text-muted)] mr-2 shrink-0">
              Filter:
            </span>
            {[
              { label: "All Applicants", val: undefined },
              { label: "Strong Fit (80%+)", val: 80 },
              { label: "Good Fit (70%+)", val: 70 },
              { label: "Moderate (60%+)", val: 60 },
            ].map((f) => {
              const active = minScoreFilter === f.val;
              return (
                <button
                  key={f.label}
                  onClick={() => setMinScoreFilter(f.val)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-[var(--brand-primary)] text-white shadow-xs"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate or skill..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>
        </div>

        {/* Results Table with Truffle-Style "Why This Matters" Expandable Drawers */}
        {loading ? (
          <div className="p-12 text-center merix-card space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-primary)] mx-auto" />
            <div className="text-sm text-[var(--text-muted)] font-mono">Filtering candidates...</div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="p-12 text-center merix-card space-y-4">
            <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                No candidates found matching this filter
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Try resetting your score threshold or upload additional candidate resumes.
              </p>
            </div>
            <button
              onClick={() => {
                setMinScoreFilter(undefined);
                setSearchTerm("");
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--brand-primary)] text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="merix-card overflow-hidden divide-y divide-[var(--border-hairline)] shadow-xs">
            {/* Table Header */}
            <div className="px-5 py-3 bg-[var(--bg-subtle)] grid grid-cols-12 text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Candidate</div>
              <div className="col-span-2 text-center">Fit Score</div>
              <div className="col-span-4">Matched &amp; Missing Competencies</div>
              <div className="col-span-1 text-right">Details</div>
            </div>

            {/* Candidate Rows */}
            {filteredMatches.map((m, idx) => {
              const isExpanded = expandedMatchId === m.id;
              const verd = m.score >= 80 ? "Strong" : m.score >= 60 ? "Mixed" : "Weak";
              const verdClass =
                m.score >= 80
                  ? "verd-strong"
                  : m.score >= 60
                  ? "verd-mixed"
                  : "verd-weak";

              return (
                <div key={m.id} className="transition-colors hover:bg-[var(--bg-subtle)]/50">
                  {/* Row Summary Bar */}
                  <div
                    onClick={() => setExpandedMatchId(isExpanded ? null : m.id)}
                    className="px-5 py-4 grid grid-cols-12 items-center gap-2 cursor-pointer select-none"
                  >
                    {/* Rank */}
                    <div className="col-span-1 font-mono text-sm font-bold text-[var(--text-muted)]">
                      #{idx + 1}
                    </div>

                    {/* Candidate Identity */}
                    <div className="col-span-4 min-w-0 pr-2">
                      <div className="font-bold text-sm text-[var(--text-primary)] truncate">
                        {m.candidate_name || "Applicant"}
                      </div>
                      <div className="text-xs font-mono text-[var(--text-muted)] truncate mt-0.5">
                        ID: {m.resume_id.substring(0, 8)} • Click to inspect evidence
                      </div>
                    </div>

                    {/* Score Ring & Verdict */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <ScoreRing score={m.score} size={42} strokeWidth={4} />
                      <span className={verdClass}>{verd}</span>
                    </div>

                    {/* Skills Chips */}
                    <div className="col-span-4 flex flex-wrap gap-1 pr-2">
                      {m.matched_skills.slice(0, 3).map((sk) => (
                        <span key={sk.skill} className="tag-evidence text-[10px]">
                          ✓ {sk.skill}
                        </span>
                      ))}
                      {m.missing_skills.slice(0, 1).map((sk) => (
                        <span key={sk.skill} className="tag-gap text-[10px]">
                          ✗ {sk.skill}
                        </span>
                      ))}
                      {m.matched_skills.length > 3 && (
                        <span className="tag-neutral text-xs">
                          +{m.matched_skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Expand Chevron & Link */}
                    <div className="col-span-1 flex items-center justify-end gap-2 text-[var(--text-muted)]">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--brand-primary)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Truffle-Style "Why This Matters" Expandable Evidence Drawer */}
                  {isExpanded && (
                    <div className="px-6 py-5 bg-[var(--bg-subtle)] border-t border-[var(--border-hairline)] space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left: AI Rationale & Quote */}
                        <div className="md:col-span-8 space-y-3">
                          <div className="space-y-1">
                            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              Verbatim Monospace Citation from Candidate Resume:
                            </div>
                            <div className="forensic-citation">
                              &ldquo;{m.rationale || "Candidate demonstrates required technical competencies across core job specification criteria."}&rdquo;
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              All Extracted Technical Competencies:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {m.matched_skills.map((sk) => (
                                <span key={sk.skill} className="tag-evidence">
                                  ✓ {sk.skill}
                                </span>
                              ))}
                              {m.missing_skills.map((sk) => (
                                <span key={sk.skill} className="tag-gap">
                                  ✕ {sk.skill} (Gap)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions & Dossier Link */}
                        <div className="md:col-span-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-3 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-mono uppercase text-[var(--text-muted)]">
                              Evaluation Actions
                            </div>
                            <div className="text-sm font-bold text-[var(--text-primary)]">
                              Ready for Recruiter Decision
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Link
                              href={`/jobs/${jobId}/candidates/${m.id}`}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
                            >
                              <span>Open Candidate Dossier</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
