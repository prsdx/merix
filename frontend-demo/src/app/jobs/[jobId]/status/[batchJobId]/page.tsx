"use client";

import React, { useEffect, useState, useRef } from "react";
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
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Briefcase,
  Layers,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function BatchJobStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);
  const batchJobId = String(params.batchJobId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [batchJob, setBatchJob] = useState<BatchJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && jobId && batchJobId) {
      api.getJob(jobId).then(setJob).catch(() => {});
      pollStatus();

      pollIntervalRef.current = setInterval(() => {
        pollStatus();
      }, 1500);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [authLoading, isAuthenticated, jobId, batchJobId, router]);

  const pollStatus = async () => {
    try {
      const status = await api.getBatchJobStatus(batchJobId);
      setBatchJob(status);
      setPollCount((prev) => prev + 1);

      if (status.status === "completed" || status.status === "failed") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch job status";
      setError(msg);
    }
  };

  const progressPercent =
    batchJob && batchJob.total_resumes > 0
      ? Math.round((batchJob.completed_resumes / batchJob.total_resumes) * 100)
      : batchJob?.status === "completed"
      ? 100
      : 0;

  const isCompleted = batchJob?.status === "completed";
  const isFailed = batchJob?.status === "failed";
  const isRunning = batchJob?.status === "running" || batchJob?.status === "queued";

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Jobs
              </Link>
              <span>/</span>
              <span className="text-zinc-200 font-medium truncate max-w-xs">{job?.title || "Job"}</span>
              <span>/</span>
              <span className="text-violet-400 font-medium font-mono">Job Status</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Zap className="w-6 h-6 text-violet-400" />
              <span>AI Batch Matching Status</span>
            </h1>
          </div>
          <DPDPBadge variant="subtle" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Display Card */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6 text-center">
          {/* Animated Spinner / Status Icon */}
          <div className="flex justify-center">
            {isCompleted ? (
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : isFailed ? (
              <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="w-10 h-10" />
              </div>
            ) : (
              <div className="relative w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
                <Sparkles className="w-4 h-4 text-indigo-300 absolute" />
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isCompleted
                ? "Batch Screening Complete!"
                : isFailed
                ? "Matching Process Failed"
                : "AI Semantic Evaluation in Progress..."}
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {isCompleted
                ? "All candidate resumes have been evaluated, cross-referenced with the JD, and grounded with verbatim evidence."
                : isFailed
                ? batchJob?.error_message || "An unexpected error occurred during batch matching."
                : "Executing deterministic Python skill matching, Gemini embedding calculations, and LLM rationale generation."}
            </p>
          </div>

          {/* Progress Bar & Counter */}
          <div className="space-y-3 max-w-lg mx-auto pt-2">
            <div className="w-full bg-white/5 rounded-full h-3.5 p-0.5 border border-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : isFailed
                    ? "bg-rose-500"
                    : "bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 animate-pulse"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-zinc-400 px-1">
              <span>
                Status: <strong className="text-white capitalize">{batchJob?.status || "Connecting..."}</strong>
              </span>
              <span>
                Progress:{" "}
                <strong className="text-violet-300">
                  {batchJob?.completed_resumes || 0} / {batchJob?.total_resumes || 0} resumes
                </strong>{" "}
                ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            {isCompleted && (
              <Link
                href={`/jobs/${jobId}/results`}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02]"
              >
                <span>View Ranked Shortlist & Explainability</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {isFailed && (
              <Link
                href={`/jobs/${jobId}/upload`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 transition-all"
              >
                <span>Return to Upload & Retry</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Dashboard Overview
            </Link>
          </div>
        </div>

        {/* Live Batch Results Breakdown / Partial Failure Table */}
        {batchJob?.batch_results && batchJob.batch_results.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-violet-400" />
              <span>Ingested Resume Dispositions ({batchJob.batch_results.length})</span>
            </h3>

            <div className="divide-y divide-white/5 max-h-60 overflow-y-auto pr-1">
              {batchJob.batch_results.map((res, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-medium text-white">{res.candidate_name || `Resume ${res.resume_id.substring(0, 8)}`}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {res.status === "matched" ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Score: {res.score}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{res.error || "Extraction error"}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
