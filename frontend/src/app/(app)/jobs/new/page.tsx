"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Job } from "@/lib/types";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Wand2,
  ListChecks,
  UploadCloud,
  PencilLine,
  FileText,
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
  const [createdJob, setCreatedJob] = useState<Job | null>(null);

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
      // Fetch full job (with server-parsed rubric) for the review step
      let full = job;
      try {
        full = await api.getJob(job.id);
      } catch {
        /* fall back to create response if refetch fails */
      }
      setCreatedJob(full);
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
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-[var(--accent-danger)] text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[var(--accent-danger)] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ===== Rubric Review Step (after JD is parsed server-side) ===== */}
        {createdJob && (
          <div className="merix-card p-6 sm:p-8 rounded-3xl border border-[var(--border-hairline)] space-y-6 max-w-3xl mx-auto">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent-evidence-soft)] text-[var(--accent-evidence)] text-xs font-mono font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Rubric Extracted — Review Before Screening
              </div>
              <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)] pt-1">
                {createdJob.title}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Merix parsed your JD once into this deterministic scoring rubric. Every candidate
                will be evaluated against exactly this — no re-interpretation, no drift.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  <span>Required Skills</span>
                  <span className="text-[var(--brand-primary)] font-bold">70% weight</span>
                </div>
                {(createdJob.parsed?.required_skills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(createdJob.parsed?.required_skills || []).map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--brand-soft)] text-[var(--brand-primary)] border border-[var(--brand-border)]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--text-muted)] italic">
                    None extracted — candidates will not be scored on required skills.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  <span>Preferred Qualifications</span>
                  <span className="text-[var(--text-secondary)] font-bold">20% weight</span>
                </div>
                {(createdJob.parsed?.preferred_skills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(createdJob.parsed?.preferred_skills || []).map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--text-muted)] italic">None extracted.</div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-hairline)] grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Min Experience · 10%
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {createdJob.parsed?.min_years_experience != null
                      ? `${createdJob.parsed.min_years_experience}+ years`
                      : "Not specified"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Education
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {createdJob.parsed?.education_level || "Not specified"}
                  </div>
                </div>
              </div>
            </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/jobs/${createdJob.id}/upload`)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Rubric Looks Right — Upload Resumes</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedJob(null)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-hairline)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <PencilLine className="w-4 h-4" />
                <span>Edit JD Instead</span>
              </button>
            </div>

            <Link
              href={`/jobs/${createdJob.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Re-open this job's details & original JD anytime"
            >
              <FileText className="w-4 h-4" />
              <span>View Job Details &amp; Original JD (always available from the dashboard too)</span>
            </Link>

            <div className="flex items-start gap-2 text-xs font-mono text-[var(--text-muted)]">
              <ListChecks className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--accent-evidence)]" />
              <span>
                Note: the rubric is cached at creation time for determinism. Editing the JD creates
                a fresh evaluation pipeline.
              </span>
            </div>
          </div>
        )}

        {!createdJob && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="merix-card p-6 sm:p-8 rounded-3xl border border-[var(--border-hairline)] space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-xs font-mono text-[var(--accent-evidence)]  uppercase tracking-wider font-semibold">
                    NEW EVALUATION PIPELINE
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
                    Post a Job Description
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={handleFillSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--accent-evidence)] bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence)]/25 hover:bg-[var(--accent-evidence)]/20 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Insert Sample Technical JD</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer or Campus Software Trainee"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-evidence)] focus:outline-none transition-colors font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                      Job Description (JD) Full Text *
                    </label>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {rawText.length} characters
                    </span>
                  </div>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the full Job Description here including required technical skills, qualifications, and experience expectations..."
                    required
                    rows={14}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-evidence)] focus:outline-none transition-colors font-mono leading-relaxed resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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
            <div className="merix-card p-6 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent-evidence)]" />
                  <span className="text-sm font-mono font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    Structured Extraction Target
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--accent-evidence)] ">EXTRACT ONCE • MATCH ALL</span>
              </div>

              {hasContent ? (
                <div className="space-y-3 text-sm">
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      REQUIRED SKILLS (70% WEIGHT):
                    </span>
                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                      Extracted from your JD on save — list required technologies and tools
                      explicitly for best results.
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      PREFERRED QUALIFICATIONS (20% WEIGHT):
                    </span>
                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                      Nice-to-haves under a &ldquo;Preferred&rdquo; heading are weighted separately
                      from hard requirements.
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                    <span>EXPERIENCE: 10%</span>
                    <span>EDUCATION: from JD</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-[var(--text-muted)] space-y-1 font-mono">
                  <div>Preview updates as you write or paste a Job Description.</div>
                </div>
              )}
            </div>

            {/* DPDP Compliance Card */}
            <DPDPBadge variant="banner" />

            {/* Prompt Best Practice Guide */}
            <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)] dark:border-white/5 space-y-2 text-sm">
              <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-evidence)]" />
                <span>Tips for Maximum Extraction Quality</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed list-disc list-inside">
                <li>Explicitly differentiate &ldquo;Required&rdquo; from &ldquo;Preferred&rdquo; qualifications.</li>
                <li>State minimum years of experience clearly (e.g. 2+ YOE or Freshers).</li>
                <li>Merix extracts the JD once and caches it to guarantee deterministic scoring.</li>
              </ul>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
