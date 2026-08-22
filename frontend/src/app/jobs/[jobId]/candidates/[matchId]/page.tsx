"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, MatchResult } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Trash2,
  Clock,
  Briefcase,
  AlertTriangle,
  Loader2,
  FileText,
  User,
  ExternalLink,
} from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);
  const matchId = String(params.matchId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && matchId && jobId) {
      loadData();
    }
  }, [authLoading, isAuthenticated, matchId, jobId, router]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobData, matchData] = await Promise.all([
        api.getJob(jobId),
        api.getMatch(matchId),
      ]);
      setJob(jobData);
      setMatch(matchData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load candidate details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!match) return;
    setIsDeleting(true);
    try {
      await api.deleteCandidate(match.resume_id);
      router.push(`/jobs/${jobId}/results`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete candidate data";
      setError(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading || !match) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-3" />
        <span className="text-xs text-zinc-400 font-mono">Loading Candidate Dossier...</span>
      </div>
    );
  }

  const score = match.score;
  const scoreColor =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-300" : "text-zinc-400";

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-white/10">
          <Link
            href={`/jobs/${jobId}/results`}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Ranked Shortlist</span>
          </Link>
          <DPDPBadge variant="subtle" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Candidate Profile Header Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
                Evaluation Dossier
              </span>
              <span className="text-xs text-zinc-500 font-mono">Job: {job?.title}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {match.candidate_name || `Candidate #${match.resume_id.substring(0, 8)}`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Evaluated {new Date(match.created_at).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Consent Verified (90-Day Retention Active)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-0.5">Match Score</div>
              <div className={`text-4xl font-bold font-mono ${scoreColor}`}>
                {match.score}
                <span className="text-sm text-zinc-500">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Explainable Rationale Box */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-950/20 to-transparent space-y-4">
          <div className="flex items-center gap-2 text-violet-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Verbatim Rationale & Grounding</span>
          </div>

          <p className="text-sm text-zinc-200 leading-relaxed font-sans bg-black/40 p-5 rounded-2xl border border-white/5">
            {match.rationale}
          </p>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 font-mono">
            <span>Model: Gemini Embedding + Deterministic Match</span>
            <span>Temperature: 0.0 (Deterministic)</span>
          </div>
        </div>

        {/* Skills Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Matched Skills ({match.matched_skills.length})</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">70% Req / 20% Pref</span>
            </div>

            <div className="space-y-2.5">
              {match.matched_skills.map((skill, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex items-start gap-2.5 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-200">{skill}</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Verbatim match identified in candidate resume work history.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills / Gaps */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Identified Gaps ({match.missing_skills.length})</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">Skills Not Found</span>
            </div>

            {match.missing_skills.length === 0 ? (
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-xs text-zinc-400">
                No requirement gaps identified. Full alignment with job specification.
              </div>
            ) : (
              <div className="space-y-2.5">
                {match.missing_skills.map((skill, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-black/40 border border-rose-500/20 flex items-start gap-2.5 text-xs"
                  >
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-zinc-200">{skill}</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        No conclusive evidence or projects found for this requirement.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DPDP Compliance & Right to Erasure Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DPDP Right to Erasure (Data Principal Request)</span>
            </h4>
            <p className="text-xs text-zinc-400 max-w-xl">
              If a candidate requests data deletion, invoke the erasure protocol below. This permanently removes the resume, embeddings, and match results, and appends a compliance audit entry.
            </p>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Erase Candidate Data</span>
          </button>
        </div>

        {/* Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-rose-500/30 space-y-4 text-left shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-white">Confirm DPDP Data Erasure</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Are you sure you want to permanently erase all data for{" "}
                  <strong className="text-white">{match.candidate_name || "this candidate"}</strong>? This action is irreversible and cascades across all match scores.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCandidate}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Erasing Data...</span>
                    </>
                  ) : (
                    <span>Permanently Erase</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
