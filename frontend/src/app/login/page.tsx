"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Lock, Mail, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DPDPBadge } from "@/components/dpdp-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { MerixLogo } from "@/components/merix-logo";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    // Deferred so the effect body performs no synchronous state update
    // (react-hooks/set-state-in-effect); behaviour is unchanged.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        const timer = setTimeout(() => setError(decodeURIComponent(urlError)), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center py-4">
        <Link href="/" className="flex items-center group cursor-pointer">
          <MerixLogo size={34} showText={true} />
        </Link>
        <div className="flex items-center gap-3">
          <DPDPBadge variant="pill" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-4xl mx-auto my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Branding / Trust Pane */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h1 className="font-sans text-3xl font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                Welcome back to your hiring workspace.
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Access your organization&apos;s candidate evaluation pipelines, shortlists, and DPDP-compliant audit trails.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                <span>Explainable 0–100 matching with verbatim evidence quotes</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                <span>Batch screening 100 resumes in &lt;8 minutes</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-evidence)] shrink-0 mt-0.5" />
                <span>Automated 90-day DPDP retention enforcement</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-hairline)] text-xs font-mono text-[var(--text-muted)]">
              Secure Supabase JWT Authentication with Row-Level Security isolation.
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 rounded-3xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] shadow-xl">
              <div className="mb-6 space-y-1">
                <h2 className="font-sans text-2xl font-bold text-[var(--text-primary)]">Sign In</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Choose your preferred authentication method to continue.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-[var(--accent-danger)] text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[var(--accent-danger)]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] font-semibold text-sm transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-hairline)]" />
                </div>
                <span className="relative px-3 bg-[var(--bg-subtle)] text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  or sign in with email
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="recruiter@organisation.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] dark:bg-[var(--brand-primary)] dark:hover:bg-[var(--brand-primary)] shadow-md shadow-md/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[var(--border-hairline)] text-center text-sm text-[var(--text-secondary)]">
                Don&apos;t have an organization account?{" "}
                <Link href="/signup" className="text-[var(--brand-primary)] font-semibold hover:underline">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-4 text-center text-xs font-mono text-[var(--text-muted)]">
        India DPDP Act (2023) Protected • Row-Level Tenant Isolation
      </footer>
    </div>
  );
}
