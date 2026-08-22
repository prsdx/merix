"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  Briefcase,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

const SAMPLE_JD = `Senior Backend Engineer (Python / FastAPI)
Location: Bengaluru, India (Hybrid)
Experience: 3-6 years

About the Role:
We are looking for an experienced Senior Backend Engineer to lead our core matching engine and API services. You will design high-throughput distributed ingestion pipelines and integrate vector embedding models.

Requirements:
- 3+ years of professional backend development with Python and FastAPI / AsyncIO.
- Strong experience with PostgreSQL, pgvector, or vector search databases.
- Hands-on experience with Redis, background job queues, and Docker.
- Experience building secure, high-concurrency RESTful APIs.
- Understanding of data protection principles (DPDP / GDPR).

Preferred Qualifications:
- Experience integrating LLM APIs (Groq, OpenAI, Anthropic, Gemini).
- Familiarity with Next.js or full-stack web architectures.
- Experience in B2B HR-Tech or high-scale campus placement systems.`;

export default function NewJobPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleUseSample = () => {
    setTitle("Senior Backend Engineer (Python / FastAPI)");
    setRawText(SAMPLE_JD);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      setError("Please provide both a Job Title and Job Description text.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const job = await api.createJob(title.trim(), rawText.trim());
      // Navigate straight to the Resume Upload step for this newly created job
      router.push(`/jobs/${job.id}/upload`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create job posting.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-violet-400" />
              <span>Post New Job Opening</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Step 1 of 2: Ingest Job Description & Extract Semantic Requirements
            </p>
          </div>
          <DPDPBadge variant="subtle" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Job Title & Role Designation *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Full Stack Developer (React / Python)"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-all font-medium"
              />
            </div>

            {/* JD Text */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Full Job Description / Requirements *
                </label>
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Insert Sample Technical JD</span>
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                placeholder="Paste the full job description text here, including requirements, responsibilities, required skills, preferred qualifications, and minimum years of experience..."
                required
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs font-mono leading-relaxed focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          {/* AI Parser Explanation */}
          <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/20 text-xs text-zinc-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-violet-200">Automated Semantic Extraction:</strong>
              <p className="text-zinc-400 leading-relaxed">
                When you submit, Merix uses deterministic AI parsing to extract required skills, preferred skills, and minimum experience thresholds. It generates a 768-dim vector embedding of the JD for similarity indexing.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel & Return to Dashboard
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Requirements & Embedding...</span>
                </>
              ) : (
                <>
                  <span>Create Job & Continue to Resume Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
