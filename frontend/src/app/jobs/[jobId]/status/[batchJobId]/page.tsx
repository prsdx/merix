"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { BatchJob, Job } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function BatchJobStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);
  const batchJobId = String(params.batchJobId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [batchJob, setBatchJob] = useState<BatchJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && jobId && batchJobId) {
      loadInitialData();
    }
  }, [authLoading, isAuthenticated, jobId, batchJobId, router]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [jobData, batchData] = await Promise.all([
        api.getJob(jobId),
        api.getBatchJobStatus(jobId, batchJobId),
      ]);
      setJob(jobData);
      setBatchJob(batchData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load job status";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Polling loop
  useEffect(() => {
    if (!isAuthenticated || !batchJobId || !jobId) return;

    const interval = setInterval(async () => {
      try {
        const latest = await api.getBatchJobStatus(jobId, batchJobId);
        setBatchJob(latest);

        if (latest.status === "completed") {
          clearInterval(interval);
          setCountdown(3);
        } else if (latest.status === "failed") {
          clearInterval(interval);
        }
      } catch (err: unknown) {
        console.error("Polling error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isAuthenticated, batchJobId]);

  // Redirect countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.push(`/jobs/${jobId}/results`);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, jobId, router]);

  if (authLoading || (loading && !batchJob)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400 mb-3" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Connecting to Evaluation Pipeline...</span>
      </div>
    );
  }

  const total = batchJob?.total_resumes || 0;
  const completed = batchJob?.completed_resumes || 0;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const isFinished = batchJob?.status === "completed";
  const isFailed = batchJob?.status === "failed";
  const batchResults = batchJob?.batch_results || [];
  const failedCount = batchResults.filter((r) => r.status === "failed").length;

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="text-[11px] font-mono text-teal-700 dark:text-teal-400 uppercase tracking-wider font-semibold">
              EVALUATION PIPELINE STATUS
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100">
              {job?.title || "Batch Processing"}
            </h1>
          </div>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Status & Progress Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              {isFinished ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : isFailed ? (
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-normal text-slate-900 dark:text-slate-100">
                    {isFinished
                      ? "Batch Evaluation Completed"
                      : isFailed
                      ? "Batch Evaluation Failed"
                      : "Processing Candidates Against JD"}
                  </h2>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Batch ID: #{batchJobId.slice(0, 8)} • Status: {batchJob?.status.toUpperCase()}
                </div>
              </div>
            </div>

            {isFinished && (
              <Link
                href={`/jobs/${jobId}/results`}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                }}
              >
                <span>View Ranked Shortlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Progress Bar & Percentage */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Extraction &amp; Deterministic Scoring Progress
              </span>
              <span className="font-mono text-2xl font-bold text-teal-700 dark:text-teal-400">
                {percent}%
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
              <div
                className="bg-gradient-to-r from-teal-600 to-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>{completed} of {total} candidate resumes processed</span>
              {isFinished && countdown !== null && (
                <span className="text-teal-700 dark:text-teal-400 font-semibold">Redirecting in {countdown}s...</span>
              )}
            </div>
          </div>

          {/* Partial Failure Notice */}
          {failedCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {failedCount} resume(s) could not be parsed (corrupt PDF or encrypted). The remaining {completed - failedCount} resumes were evaluated successfully.
              </span>
            </div>
          )}

          {/* Itemized Candidate Ingestion Results Table */}
          {batchResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Processed Candidate Stream
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {batchResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {res.status === "matched" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                      )}
                      <span className="text-slate-900 dark:text-slate-100 truncate font-medium">
                        {res.candidate_name || `Resume #${i + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {res.status === "matched" && res.score !== undefined && (
                        <span
                          className="px-2 py-0.5 rounded font-bold text-xs"
                          style={{
                            background:
                              res.score >= 80
                                ? "rgba(22,163,74,0.15)"
                                : res.score >= 60
                                ? "rgba(217,119,6,0.15)"
                                : "rgba(234,88,12,0.15)",
                            color:
                              res.score >= 80
                                ? "#16A34A"
                                : res.score >= 60
                                ? "#D97706"
                                : "#EA580C",
                          }}
                        >
                          Score: {Math.round(res.score)}/100
                        </span>
                      )}
                      {res.status === "failed" && (
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 truncate max-w-[160px]">
                          {res.error || "Parsing failed"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
