"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Lock, Mail, Building2, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();

  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signup(orgName, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create organization account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#070709] font-display font-bold text-sm shadow-lg group-hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
              boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
            }}
          >
            M
          </div>
          <span className="font-display text-lg tracking-tight text-[#E8E6E1]">Merix</span>
        </Link>
        <DPDPBadge variant="pill" />
      </header>

      {/* Main Signup Form */}
      <main className="w-full max-w-4xl mx-auto my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Trust/Benefit Pane (Visible on lg+) */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-bold text-[#E8E6E1] leading-tight">
                Hire smarter. Stay compliant.
              </h1>
              <p className="text-xs text-[#A8A5A0] leading-relaxed">
                Create a dedicated organization workspace for your placement cell or recruiting agency in seconds.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-[#E8E6E1]">
                <CheckCircle2 className="w-4 h-4 text-[#00D4AA] shrink-0 mt-0.5" />
                <span>Dedicated PostgreSQL Row-Level Security tenant isolation</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#E8E6E1]">
                <CheckCircle2 className="w-4 h-4 text-[#00D4AA] shrink-0 mt-0.5" />
                <span>Instant batch resume parsing with verbatim skill quotes</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#E8E6E1]">
                <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span>Configurable DPDP 90-day auto-purge retention policy</span>
              </div>
            </div>

            <DPDPBadge variant="banner" />
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
              <div className="mb-6 space-y-1">
                <h2 className="font-display text-2xl font-bold text-[#E8E6E1]">
                  Create Organization Account
                </h2>
                <p className="text-xs text-[#A8A5A0]">
                  Get started with free batch resume screening for your team.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                    Organisation / College Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#A8A5A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. IIT Bombay Placement Cell or Apex Staffing"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#A8A5A0]/50 focus:border-[#00D4AA] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                    Admin Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A8A5A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@organisation.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#A8A5A0]/50 focus:border-[#00D4AA] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8A5A0]">
                    Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A8A5A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#A8A5A0]/50 focus:border-[#00D4AA] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs text-[#070709] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                    boxShadow: "0 4px 16px rgba(0,212,170,0.25)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-[#A8A5A0]">
                Already have an organization workspace?{" "}
                <Link href="/login" className="text-[#00D4AA] font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-4 text-center text-[11px] font-mono text-[#A8A5A0]/60">
        India DPDP Act (2023) Protected • Explicit Consent & Retention Enforced
      </footer>
    </div>
  );
}
