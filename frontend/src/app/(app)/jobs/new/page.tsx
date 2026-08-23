"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Wand2,
} from "lucide-react";

const SAMPLE_JD = `Role: Senior Backend Engineer (FastAPI & PostgreSQL)
Location: Bengaluru / Remote (India)
Experience: 3-5 Years

About the Role:
We are seeking a Senior Backend Engineer to architect distributed, low-latency microservices for our AI data platform. You will design async processing pipelines, optimize vector search queries on PostgreSQL (pgvector), and manage caching tiers.

Required Technical Skills:
- Python 3.11+, FastAPI (AsyncIO, Pydantic v2)
- PostgreSQL with vector extensions (pgvector)
- Docker containerization and CI/CD pipelines
- High-throughput asynchronous request handling and concurrency

Preferred Qualifications:
- Redis caching and pub/sub message brokers
- Experience integrating LLM APIs (Groq, Gemini, OpenAI)
- Background in fintech, edtech, or high-volume SaaS backends

Education:
- B.Tech/B.E. or M.Tech in Computer Science or equivalent technical field`;

export default function NewJobPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleFillSample = () => {
    setTitle("Senior Backend Engineer (FastAPI & pgvector)");
    setRawText(SAMPLE_JD);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      setError("Please provide both a job title and description.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const job = await api.createJob(title.trim(), rawText.trim());
      router.push(`/jobs/${job.id}/upload`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create job posting.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasContent = rawText.length > 50;

  return (
    <div className="min-h-screen pb-16">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-[11px] font-mono text-teal-700 dark:text-teal-400 uppercase tracking-wider font-semibold">
                    NEW EVALUATION PIPELINE
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100">
                    Post a Job Description
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={handleFillSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-800 dark:text-teal-300 bg-teal-500/10 border border-teal-500/25 hover:bg-teal-500/20 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Insert Sample Technical JD</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer or Campus Software Trainee"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none transition-colors font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Job Description (JD) Full Text *
                    </label>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {rawText.length} characters
                    </span>
                  </div>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the full Job Description here including required technical skills, qualifications, and experience expectations..."
                    required
                    rows={14}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none transition-colors font-mono leading-relaxed resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing & Storing JD Structure...</span>
                    </>
                  ) : (
                    <>
                      <span>Save JD & Proceed to Resume Upload</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Extraction Preview & Best Practices */}
          <div className="lg:col-span-5 space-y-4">
            {/* Extraction Preview Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Structured Extraction Target
                  </span>
                </div>
                <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400">EXTRACT ONCE • MATCH ALL</span>
              </div>

              {hasContent ? (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      REQUIRED SKILLS (70% WEIGHT):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Python 3.11+", "FastAPI AsyncIO", "PostgreSQL", "pgvector", "Docker"].map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/25"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      PREFERRED QUALIFICATIONS (20% WEIGHT):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Redis Caching", "LLM APIs (Groq/Gemini)", "Fintech/SaaS"].map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>EXPERIENCE: 3-5 Years (10%)</span>
                    <span>EDUCATION: B.Tech/B.E.</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono">
                  <div>Preview updates as you write or paste a Job Description.</div>
                </div>
              )}
            </div>

            {/* DPDP Compliance Card */}
            <DPDPBadge variant="banner" />

            {/* Prompt Best Practice Guide */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2 text-xs">
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Tips for Maximum Extraction Quality</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
                <li>Explicitly differentiate &ldquo;Required&rdquo; from &ldquo;Preferred&rdquo; qualifications.</li>
                <li>State minimum years of experience clearly (e.g. 2+ YOE or Freshers).</li>
                <li>Merix extracts the JD once and caches it to guarantee deterministic scoring.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
