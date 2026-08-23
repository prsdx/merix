"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
  Layers,
  ShieldCheck,
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

  // Simple heuristic preview chips
  const hasContent = rawText.length > 50;

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[#A8A5A0] hover:text-[#E8E6E1] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <DPDPBadge variant="row" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-[11px] font-mono text-[#00D4AA] uppercase tracking-wider">
                    NEW EVALUATION PIPELINE
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#E8E6E1]">
                    Post a Job Description
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={handleFillSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/25 hover:bg-[#00D4AA]/20 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Insert Sample Technical JD</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer or Campus Software Trainee"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#A8A5A0]/50 focus:border-[#00D4AA] focus:outline-none transition-colors font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                      Job Description (JD) Full Text *
                    </label>
                    <span className="text-[11px] font-mono text-[#A8A5A0]">
                      {rawText.length} characters
                    </span>
                  </div>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the full Job Description here including required technical skills, qualifications, and experience expectations..."
                    required
                    rows={14}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#A8A5A0]/50 focus:border-[#00D4AA] focus:outline-none transition-colors font-mono leading-relaxed resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs text-[#070709] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                    boxShadow: "0 4px 16px rgba(0,212,170,0.25)",
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
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00D4AA]" />
                  <span className="text-xs font-mono font-semibold text-[#E8E6E1] uppercase tracking-wider">
                    Structured Extraction Target
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00D4AA]">EXTRACT ONCE • MATCH ALL</span>
              </div>

              {hasContent ? (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A5A0]">
                      REQUIRED SKILLS (70% WEIGHT):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Python 3.11+", "FastAPI AsyncIO", "PostgreSQL", "pgvector", "Docker"].map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/25"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A5A0]">
                      PREFERRED QUALIFICATIONS (20% WEIGHT):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Redis Caching", "LLM APIs (Groq/Gemini)", "Fintech/SaaS"].map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.04] text-[#E8E6E1] border border-white/10"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#A8A5A0]">
                    <span>EXPERIENCE: 3-5 Years (10%)</span>
                    <span>EDUCATION: B.Tech/B.E.</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#A8A5A0] space-y-1 font-mono">
                  <div>Preview updates as you write or paste a Job Description.</div>
                </div>
              )}
            </div>

            {/* DPDP Compliance Card */}
            <DPDPBadge variant="banner" />

            {/* Prompt Best Practice Guide */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <div className="font-semibold text-[#E8E6E1] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4AA]" />
                <span>Tips for Maximum Extraction Quality</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#A8A5A0] leading-relaxed list-disc list-inside">
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
