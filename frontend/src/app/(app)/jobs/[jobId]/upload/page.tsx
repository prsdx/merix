"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, Resume, BatchJob } from "@/lib/types";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Play,
  Loader2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Users,
  Sparkles,
} from "lucide-react";

interface QueuedFile {
  id: string;
  file: File;
  candidateName: string;
  status: "idle" | "uploading" | "processing" | "success" | "error";
  errorMessage?: string;
}

export default function ResumeUploadPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.jobId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [existingResumes, setExistingResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [erasingId, setErasingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobData, resumesData] = await Promise.all([
        api.getJob(jobId),
        api.listJobResumes(jobId),
      ]);
      setJob(jobData);
      setExistingResumes(resumesData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load job details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Deferred so the effect body performs no synchronous state update
    // (react-hooks/set-state-in-effect); behaviour is unchanged.
    const timer = setTimeout(() => {
      if (isAuthenticated && jobId) {
        loadData();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, jobId, router, loadData]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: QueuedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          candidateName: cleanName,
          status: "idle",
        });
      }
    }

    if (newItems.length === 0) {
      setError("Please select PDF resume files (under 5MB each).");
      return;
    }

    setQueue((prev) => [...prev, ...newItems]);
    setError(null);
  };

  const handleRemoveFile = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const pollBatchJob = async (batchJobId: string): Promise<BatchJob> => {
    // Poll the Task 5 batch-job status endpoint until the upload settles.
    // Extraction/embedding typically takes a few seconds; cap at ~3 minutes
    // (the backend's stale-job timeout marks dead jobs failed at 10 min).
    const maxAttempts = 120;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const bj = await api.getBatchJobStatus(jobId, batchJobId);
      if (bj.status === "completed" || bj.status === "failed") {
        return bj;
      }
    }
    return { id: batchJobId, status: "failed", error_message: "Processing timed out — check back later." } as BatchJob;
  };

  const handleUploadAll = async () => {
    if (!consentConfirmed) {
      setError("You must confirm candidate consent under the DPDP Act before uploading.");
      return;
    }

    const idleItems = queue.filter((item) => item.status === "idle" || item.status === "error");
    if (idleItems.length === 0) return;

    setIsUploading(true);
    setError(null);

    for (const item of idleItems) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", errorMessage: undefined } : q))
      );

      try {
        // The upload returns 202 immediately (consent/size/PDF checks already
        // ran server-side); extraction + embedding continue in the background.
        const batchJob = await api.uploadResume(jobId, item.file, item.candidateName, true);
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "processing" } : q))
        );

        const finished = await pollBatchJob(batchJob.id);

        if (finished.status === "completed") {
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "success" } : q)));
          await loadData(); // refresh the persisted resume list from the API
        } else {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "error", errorMessage: finished.error_message || "Resume processing failed" }
                : q
            )
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "error", errorMessage: msg } : q))
        );
      }
    }

    setIsUploading(false);
  };

  const handleStartMatching = async () => {
    setIsMatching(true);
    setError(null);
    try {
      // Idempotency key guards against double-submission creating duplicate batches
      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${jobId}-${Date.now()}`;
      const batchJob = await api.startBatchMatch(jobId, idempotencyKey);
      router.push(`/jobs/${jobId}/status/${batchJob.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger batch matching";
      setError(msg);
      setIsMatching(false);
    }
  };

  const handleEraseResume = async (resumeId: string, name: string) => {
    if (!window.confirm(`Permanently erase "${name}" and all evaluation data? This cannot be undone (DPDP Right to Erasure).`)) {
      return;
    }
    setErasingId(resumeId);
    setError(null);
    try {
      await api.deleteCandidate(jobId, resumeId);
      setExistingResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to erase candidate";
      setError(msg);
    } finally {
      setErasingId(null);
    }
  };

  if (authLoading || (loading && !job)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-evidence)] mb-3" />
        <span className="text-sm text-[var(--text-muted)] font-mono">Loading Job Workspace...</span>
      </div>
    );
  }

  const totalAvailableResumes = existingResumes.length;

  return (
    <div className="min-h-screen pb-16">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation & Job Context */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
                {job?.title}
              </h1>
              <DPDPBadge variant="row" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalAvailableResumes > 0 && (
              <button
                onClick={handleStartMatching}
                disabled={isMatching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initiating Batch Match...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run AI Matching ({totalAvailableResumes} Resumes)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-[var(--accent-danger)] text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[var(--accent-danger)] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Dropzone and Queue */}
          <div className="lg:col-span-7 space-y-6">
            {/* Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="merix-card p-8 sm:p-10 rounded-3xl border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-evidence)] hover:bg-[var(--accent-evidence-soft)] transition-all text-center cursor-pointer space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence)]/25 flex items-center justify-center text-[var(--accent-evidence)]  mx-auto group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-normal text-[var(--text-primary)]">
                  Drag &amp; Drop Batch Resumes (PDF)
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Select up to 100 candidate PDF resumes (max 5MB each). Magic bytes verified.
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-[var(--accent-evidence)] bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence)]/25 group-hover:bg-[var(--accent-evidence)]/20 transition-colors"
              >
                Browse Files
              </button>
            </div>

            {/* Upload Queue */}
            {queue.length > 0 && (
              <div className="merix-card p-6 rounded-3xl border border-[var(--border-hairline)] space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[var(--border-hairline)]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--accent-evidence)]" />
                    <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                      Batch Ingestion Queue ({queue.length} files)
                    </span>
                  </div>

                  <button
                    onClick={handleUploadAll}
                    disabled={isUploading || !consentConfirmed}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-[var(--accent-evidence)] hover:opacity-90 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
                  >
                    {isUploading ? "Uploading..." : `Upload ${queue.filter((q) => q.status === "idle").length} Files`}
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)] dark:border-white/5 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        <div className="truncate">
                          <div className="font-mono text-[var(--text-primary)] text-xs truncate">
                            {item.file.name}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {(item.status === "uploading" || item.status === "processing") && (
                          <div className="flex items-center gap-1.5 text-sm text-[var(--accent-evidence)] font-mono">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{item.status === "uploading" ? "Uploading" : "AI Processing"}</span>
                          </div>
                        )}
                        {item.status === "success" && (
                          <div className="flex items-center gap-1.5 text-sm text-[var(--accent-evidence)] font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </div>
                        )}
                        {item.status === "error" && (
                          <div className="flex items-center gap-1.5 text-sm text-orange-700 dark:text-orange-400 font-mono" title={item.errorMessage}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </div>
                        )}

                        {item.status === "idle" && (
                          <button
                            onClick={() => handleRemoveFile(item.id)}
                            className="text-[var(--text-muted)] hover:text-[var(--accent-danger)] p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: DPDP Consent Gate & Matching Trigger */}
          <div className="lg:col-span-5 space-y-4">
            {/* DPDP Consent Gate Card */}
            <div
              className="merix-card p-6 sm:p-7 rounded-3xl border space-y-5"
              style={{
                borderColor: consentConfirmed ? "rgba(22,163,74,0.4)" : undefined,
                background: consentConfirmed ? "rgba(22,163,74,0.04)" : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence-border)] flex items-center justify-center text-[var(--accent-evidence)] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-normal text-[var(--text-primary)]">
                    DPDP Consent Affirmation
                  </h3>
                  <div className="text-xs font-mono text-[var(--accent-evidence)] font-semibold">
                    DIGITAL PERSONAL DATA PROTECTION ACT 2023
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/50 border border-[var(--border-hairline)] dark:border-white/5 text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
                <p>
                  As an authorized recruiter or placement officer, you must confirm that all candidates uploaded in this batch have given explicit, informed consent for their personal data to be processed for job matching.
                </p>
                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  Server will automatically timestamp consent and enforce org-wide 90-day retention purging.
                </div>
              </div>

              {/* Consent Toggle */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  consentConfirmed
                    ? "bg-[var(--accent-evidence-soft)] border-[var(--accent-evidence)]/40"
                    : "bg-[var(--bg-subtle)] dark:bg-black/40 border-[var(--border-hairline)] hover:border-[var(--border-strong)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[var(--accent-evidence)] cursor-pointer"
                />
                <span className="text-sm text-[var(--text-primary)] font-medium leading-snug">
                  I confirm that all candidate resumes uploaded comply with DPDP Act (2023) consent requirements.
                </span>
              </label>
            </div>

            {/* Existing Ingested Resumes Card */}
            <div className="merix-card p-6 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--accent-evidence)]" />
                  <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                    Ingested Resumes ({totalAvailableResumes})
                  </span>
                </div>
                <DPDPBadge variant="row" />
              </div>

              {existingResumes.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)] font-mono">
                  No resumes uploaded for this job yet. Add PDF files to begin.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {existingResumes.map((res) => (
                    <div
                      key={res.id}
                      className="p-2.5 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)] dark:border-white/5 flex items-center justify-between text-sm"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-[var(--text-primary)] text-xs truncate">
                          {res.candidate_name || res.original_filename}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">
                          Consent stamped: {res.consent_timestamp ? new Date(res.consent_timestamp).toLocaleDateString() : "Valid"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {erasingId === res.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-danger)]" />
                        ) : (
                          <button
                            onClick={() =>
                              handleEraseResume(res.id, res.candidate_name || res.original_filename)
                            }
                            title="Erase candidate data (DPDP Right to Erasure)"
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-danger)] hover:bg-[var(--accent-danger-soft)] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-evidence)] shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalAvailableResumes > 0 && (
                <button
                  onClick={handleStartMatching}
                  disabled={isMatching}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
                  style={{
                    background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                  }}
                >
                  {isMatching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initiating Batch Match...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run AI Batch Match ({totalAvailableResumes} Resumes)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
