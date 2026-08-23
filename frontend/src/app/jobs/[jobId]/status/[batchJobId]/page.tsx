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
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
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
        api.getBatchJobStatus(batchJobId),
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
    if (!isAuthenticated || !batchJobId) return;

    const interval = setInterval(async () => {
      try {
        const latest = await api.getBatchJobStatus(batchJobId);
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
        <Loader2 className="w-8 h-8 animate-spin text-[#00D4AA] mb-3" />
        <span className="text-xs text-[#A8A5A0] font-mono">Connecting to Evaluation Pipeline...</span>
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

      <main className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
            <div className="text-[11px] font-mono text-[#00D4AA] uppercase tracking-wider">
              EVALUATION PIPELINE STATUS
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#E8E6E1]">
              {job?.title || "Batch Processing"}
            </h1>
          </div>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Status & Progress Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {isFinished ? (
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/25 flex items-center justify-center text-[#22C55E]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : isFailed ? (
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/25 flex items-center justify-center text-[#00D4AA]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-[#E8E6E1]">
                    {isFinished
                      ? "Batch Evaluation Completed"
                      : isFailed
                      ? "Batch Evaluation Failed"
                      : "Processing Candidates Against JD"}
                  </h2>
                </div>
                <div className="text-xs text-[#A8A5A0] font-mono mt-0.5">
                  Batch ID: #{batchJobId.slice(0, 8)} • Status: {batchJob?.status.toUpperCase()}
                </div>
              </div>
            </div>

            {isFinished && (
              <Link
                href={`/jobs/${jobId}/results`}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-xs text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                  boxShadow: "0 4px 16px rgba(0,212,170,0.25)",
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
              <span className="text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                Extraction &amp; Deterministic Scoring Progress
              </span>
              <span className="font-mono text-2xl font-bold text-[#00D4AA]">
                {percent}%
              </span>
            </div>

            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono text-[#A8A5A0]">
              <span>{completed} of {total} candidate resumes processed</span>
              {isFinished && countdown !== null && (
                <span className="text-[#00D4AA]">Redirecting in {countdown}s...</span>
              )}
            </div>
          </div>

          {/* Partial Failure Notice */}
          {failedCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {failedCount} resume(s) could not be parsed (corrupt PDF or encrypted). The remaining {completed - failedCount} resumes were evaluated successfully.
              </span>
            </div>
          )}

          {/* Itemized Candidate Ingestion Results Table */}
          {batchResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                Processed Candidate Stream
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {batchResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {res.status === "matched" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                      )}
                      <span className="text-[#E8E6E1] truncate font-medium">
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
                                ? "rgba(34,197,94,0.15)"
                                : res.score >= 60
                                ? "rgba(245,158,11,0.15)"
                                : "rgba(249,115,22,0.15)",
                            color:
                              res.score >= 80
                                ? "#22C55E"
                                : res.score >= 60
                                ? "#F59E0B"
                                : "#F97316",
                          }}
                        >
                          Score: {Math.round(res.score)}/100
                        </span>
                      )}
                      {res.status === "failed" && (
                        <span className="text-[10px] text-[#F97316] truncate max-w-[160px]">
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
