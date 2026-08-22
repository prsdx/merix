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
  Briefcase,
  Users,
  Lock,
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

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: QueuedFile[] = Array.from(files)
      .filter((f) => f.name.toLowerCase().endsWith(".pdf"))
      .map((f) => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        candidateName: f.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " "),
        status: "idle",
      }));

    if (newItems.length === 0) {
      setError("Please select PDF format resumes only.");
      return;
    }

    setError(null);
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveQueued = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUploadAll = async () => {
    if (!consentConfirmed) {
      setError("DPDP Consent Affirmation is required before uploading candidate personal data.");
      return;
    }

    const idleItems = queue.filter((q) => q.status === "idle" || q.status === "error");
    if (idleItems.length === 0) return;

    setIsUploading(true);
    setError(null);

    for (const item of idleItems) {
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q))
      );

      try {
        const uploaded = await api.uploadResume(
          jobId,
          item.file,
          item.candidateName.trim() || undefined,
          true
        );

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "success", uploadedResume: uploaded }
              : q
          )
        );

        setExistingResumes((prev) => [uploaded, ...prev]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload and extraction failed.";
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "error", errorMessage: msg } : q
          )
        );
      }
    }

    setIsUploading(false);
  };

  const handleStartMatching = async () => {
    if (totalCandidateCount === 0) {
      setError("Please upload at least one candidate resume before initiating batch match.");
      return;
    }

    setIsMatching(true);
    setError(null);
    try {
      const batchJob = await api.startBatchMatch(jobId);
      // Route immediately to the Processing / Status screen
      router.push(`/jobs/${jobId}/status/${batchJob.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start batch match job.";
      setError(msg);
      setIsMatching(false);
    }
  };

  const totalCandidateCount = existingResumes.length + queue.filter((q) => q.status === "success").length;

  if (loading && !job) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-3" />
        <span className="text-xs text-zinc-400 font-mono">Loading Job Details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Jobs
              </Link>
              <span>/</span>
              <span className="text-zinc-200 font-medium truncate max-w-xs">{job?.title}</span>
              <span>/</span>
              <span className="text-violet-400 font-medium">Batch Ingestion</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <UploadCloud className="w-6 h-6 text-violet-400" />
              <span>Batch Resume Upload & Consent</span>
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

        {/* DPDP Consent Gate (High-Presence Compliance Card) */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-2">
                <span>India DPDP Act (2023) Legal Consent Gate</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-emerald-500/20 text-emerald-300">
                  Mandatory
                </span>
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Under the Digital Personal Data Protection Act, candidate resumes contain protected Personal Identifiable Information (PII). Merix automatically performs server-side consent timestamping, PII scrubbing before LLM evaluation, and enforces your organisation&apos;s 90-day auto-erasure schedule.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 hover:border-emerald-500/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={consentConfirmed}
              onChange={(e) => setConsentConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded bg-black border-emerald-500 text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-emerald-100 leading-snug">
              I affirm that candidate consent has been collected for this recruitment drive under DPDP purpose limitation rules. Record server-side consent timestamps for this batch.
            </span>
          </label>
        </div>

        {/* Drag & Drop Ingestion Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="glass-panel rounded-3xl p-8 md:p-12 text-center border-2 border-dashed border-white/20 hover:border-violet-500/50 cursor-pointer transition-all space-y-4 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Drag & Drop PDF Resumes Here (Up to 100 files)
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Drop individual candidate resumes or batch files. Automatic PDF text extraction, PII scrubbing, and Gemini vector embedding.
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Browse Computer Files
          </button>
        </div>

        {/* File Queue List */}
        {queue.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Upload Queue ({queue.length} files)
              </h4>
              <button
                onClick={handleUploadAll}
                disabled={isUploading || !consentConfirmed}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-md"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting & Ingesting...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Process & Upload Queue</span>
                  </>
                )}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                    <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-white truncate block">{item.file.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {(item.file.size / 1024).toFixed(1)} KB • Candidate: {item.candidateName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.status === "uploading" && (
                      <span className="text-violet-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Parsing
                      </span>
                    )}
                    {item.status === "success" && (
                      <span className="text-emerald-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ingested
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="text-rose-400 text-[11px] truncate max-w-xs" title={item.errorMessage}>
                        {item.errorMessage || "Failed"}
                      </span>
                    )}
                    {item.status === "idle" && (
                      <button
                        onClick={() => handleRemoveQueued(item.id)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors"
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

        {/* Existing Ingested Resumes List */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Ingested Candidate Resumes ({existingResumes.length})</span>
              </h3>
              <p className="text-xs text-zinc-400">Ready for semantic vector comparison and AI scoring.</p>
            </div>

            <button
              onClick={handleStartMatching}
              disabled={isMatching || existingResumes.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enqueuing Batch Match...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start AI Match Screening ({existingResumes.length})</span>
                </>
              )}
            </button>
          </div>

          {existingResumes.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500 font-mono">
              No resumes uploaded for this job description yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {existingResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-white truncate">
                        {resume.candidate_name || "Candidate"}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate font-mono">
                        {resume.original_filename}
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-white/5 font-mono">
                    <span>DPDP Consent: Yes</span>
                    <span>90d Retention</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
