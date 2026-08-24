"use client";

import React from "react";
import { AppNavbar } from "@/components/app-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ExplainabilityDemo } from "@/components/landing/explainability-demo";
import { ComplianceTrust } from "@/components/landing/compliance-trust";
import { FaqSection } from "@/components/landing/faq-section";
import { TestimonialsCta } from "@/components/landing/testimonials-cta";

export default function LandingPage() {

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      {/* Top Banner Notice */}
      <div className="w-full bg-[var(--text-primary)] text-[var(--bg-canvas)] text-xs font-mono py-2 px-4 text-center border-b border-[var(--border-hairline)] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-evidence)] animate-pulse" />
        <span>India DPDP Act (2023) Certified Screening Pipeline</span>
        <span className="opacity-60 hidden sm:inline">• Automated 90-Day Purge &amp; Right to Erasure</span>
      </div>

      <AppNavbar />

      {/* Conversion flow: Hero demo -> How it works -> Differentiator -> Trust -> Objections -> Proof -> Final CTA */}
      <HeroSection />
      <HowItWorks />
      <ExplainabilityDemo />
      <ComplianceTrust />
      <FaqSection />
      <TestimonialsCta />

      {/* Minimal Institutional Footer */}
      <footer className="w-full border-t border-[var(--border-hairline)] py-8 bg-[var(--bg-subtle)] text-sm text-[var(--text-muted)] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] font-sans">Merix</span>
            <span>— AI Resume-to-JD Screening Instrument</span>
          </div>
          <div>Compliant with Digital Personal Data Protection Act, 2023</div>
        </div>
      </footer>
    </div>
  );
}
