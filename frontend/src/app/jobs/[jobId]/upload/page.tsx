"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job, Resume } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
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
  status: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
  uploadedResume?: Resume;
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && jobId) {
      loadData();
    }
  }, [authLoading, isAuthenticated, jobId, router]);

  const loadData = async () => {
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
  };

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
        const uploaded = await api.uploadResume(jobId, item.file, item.candidateName, true);
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "success", uploadedResume: uploaded } : q))
        );
        setExistingResumes((prev) => [...prev, uploaded]);
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
      const batchJob = await api.startBatchMatch(jobId);
      router.push(`/jobs/${jobId}/status/${batchJob.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger batch matching";
      setError(msg);
      setIsMatching(false);
    }
  };

  if (authLoading || (loading && !job)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400 mb-3" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading Job Workspace...</span>
      </div>
    );
  }

  const totalAvailableResumes = existingResumes.length;

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation & Job Context */}
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
          </div>

          <div className="flex items-center gap-3">
            {totalAvailableResumes > 0 && (
              <button
                onClick={handleStartMatching}
                disabled={isMatching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run AI Matching ({totalAvailableResumes} Resumes)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
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
              className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-teal-500 hover:bg-teal-500/5 transition-all text-center cursor-pointer space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-700 dark:text-teal-400 mx-auto group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-normal text-slate-900 dark:text-slate-100">
                  Drag &amp; Drop Batch Resumes (PDF)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select up to 100 candidate PDF resumes (max 5MB each). Magic bytes verified.
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-500/10 border border-teal-500/25 group-hover:bg-teal-500/20 transition-colors"
              >
                Browse Files
              </button>
            </div>

            {/* Upload Queue */}
            {queue.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                      Batch Ingestion Queue ({queue.length} files)
                    </span>
                  </div>

                  <button
                    onClick={handleUploadAll}
                    disabled={isUploading || !consentConfirmed}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-sm hover:opacity-95 disabled:opacity-40 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                    }}
                  >
                    {isUploading ? "Uploading..." : `Upload ${queue.filter((q) => q.status === "idle").length} Files`}
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-mono text-slate-900 dark:text-slate-100 text-[11px] truncate">
                            {item.file.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.status === "uploading" && (
                          <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-mono">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading</span>
                          </div>
                        )}
                        {item.status === "success" && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </div>
                        )}
                        {item.status === "error" && (
                          <div className="flex items-center gap-1.5 text-xs text-orange-700 dark:text-orange-400 font-mono" title={item.errorMessage}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </div>
                        )}

                        {item.status === "idle" && (
                          <button
                            onClick={() => handleRemoveFile(item.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
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
              className="glass-panel p-6 sm:p-7 rounded-3xl border space-y-5"
              style={{
                borderColor: consentConfirmed ? "rgba(22,163,74,0.4)" : undefined,
                background: consentConfirmed ? "rgba(22,163,74,0.04)" : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-normal text-slate-900 dark:text-slate-100">
                    DPDP Consent Affirmation
                  </h3>
                  <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    DIGITAL PERSONAL DATA PROTECTION ACT 2023
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                <p>
                  As an authorized recruiter or placement officer, you must confirm that all candidates uploaded in this batch have given explicit, informed consent for their personal data to be processed for job matching.
                </p>
                <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                  Server will automatically timestamp consent and enforce org-wide 90-day retention purging.
                </div>
              </div>

              {/* Consent Toggle */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  consentConfirmed
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs text-slate-900 dark:text-slate-100 font-medium leading-snug">
                  I confirm that all candidate resumes uploaded comply with DPDP Act (2023) consent requirements.
                </span>
              </label>
            </div>

            {/* Existing Ingested Resumes Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                    Ingested Resumes ({totalAvailableResumes})
                  </span>
                </div>
                <DPDPBadge variant="row" />
              </div>

              {existingResumes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                  No resumes uploaded for this job yet. Add PDF files to begin.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {existingResumes.map((res) => (
                    <div
                      key={res.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-[11px] truncate">
                          {res.candidate_name || res.original_filename}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          Consent stamped: {res.consent_timestamp ? new Date(res.consent_timestamp).toLocaleDateString() : "Valid"}
                        </div>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {totalAvailableResumes > 0 && (
                <button
                  onClick={handleStartMatching}
                  disabled={isMatching}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
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
