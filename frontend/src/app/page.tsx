"use client";

import React from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/app-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsBand } from "@/components/landing/stats-band";
import { PipelineStory } from "@/components/landing/pipeline-story";
import { BentoGrid } from "@/components/landing/bento-grid";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { FaqSection } from "@/components/landing/faq-section";
import { EarlyAccessSection } from "@/components/landing/early-access";
import { TestimonialsCta } from "@/components/landing/testimonials-cta";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { FloatingCta } from "@/components/landing/floating-cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      <ScrollProgress />
      {/* Top Banner Notice */}
      <div className="w-full bg-[var(--text-primary)] text-[var(--bg-canvas)] text-xs font-mono py-2 px-4 text-center border-b border-[var(--border-hairline)] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-evidence)] animate-pulse" />
        <span>Built for India DPDP Act (2023) Compliance</span>
        <span className="opacity-60 hidden sm:inline">• Configurable Retention &amp; Right-to-Erasure Tooling</span>
      </div>

      <AppNavbar />

      {/* Cinematic conversion narrative:
          Hook -> Proof -> Numbers -> Story -> Capabilities -> Differentiation
          -> Objections -> Social proof -> Ask */}
      <HeroSection />
      <StatsBand />
      <PipelineStory />
      <BentoGrid />
      <ComparisonTable />
      <FaqSection />
      <EarlyAccessSection />
      {/* relative wrapper anchors FloatingCta's footer sentinel */}
      <div className="relative">
        <TestimonialsCta />
        <FloatingCta />
      </div>

      {/* Institutional Footer */}
      <footer className="w-full border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[var(--text-muted)] font-mono">
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)] font-sans">Merix</span>
              <span>— AI Resume-to-JD Screening Instrument</span>
            </div>
            <div className="text-xs opacity-70">
              Compliant with Digital Personal Data Protection Act, 2023
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">Pipeline</a>
            <a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-[var(--brand-primary)] transition-colors">Get Started</Link>
          </nav>

          <div className="flex items-center gap-2 text-xs opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />
            <span>Prototype — building with early users</span>
          </div>
        </div>
      </footer>
    </div>
  );
}