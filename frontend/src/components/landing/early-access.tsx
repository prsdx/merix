"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonClasses } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { Reveal } from "./motion";

/**
 * EarlyAccessSection — one-field design-partner signup.
 * Zero friction on purpose: a single email input is the whole form.
 */
export function EarlyAccessSection() {
  const [email, setEmail] = useState("");
  // Honeypot: invisible to humans, bots fill it. Sent to the API, which
  // silently discards non-empty submissions.
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || done) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitInterest(email.trim(), website);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong — please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="early-access" className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 scroll-mt-20">
      <Reveal>
        <div className="merix-card card-glow p-8 sm:p-10 space-y-6 text-center">
          <div className="space-y-3">
            <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
              Early Access · Design Partners
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
              Help shape what we build next.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
              We&apos;re working closely with a small group of campus placement cells and
              staffing teams. If screening hundreds of resumes per drive is your weekly
              reality, leave your email and we&apos;ll reach out.
            </p>
          </div>

          {done ? (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--accent-evidence)] pt-1">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Thanks — you&apos;re in. We&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate={false}>
              {/* Honeypot field — visually hidden and unfocusable for humans */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 pointer-events-none h-0 w-0"
              />
              <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@placementcell.edu.in"
                  aria-label="Work email"
                  disabled={submitting}
                  className="flex-1 text-center sm:text-left"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${buttonClasses("primary", "md")} btn-gradient`}
                >
                  <span>{submitting ? "Sending…" : "Get Early Access"}</span>
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs font-mono text-[var(--accent-danger)]">{error}</p>
              )}
              <p className="text-xs font-mono text-[var(--text-muted)]">
                One email. No spam — just an invitation to try Merix with a real drive.
              </p>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
