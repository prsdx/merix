"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AnimatedHeadline, Reveal, Marquee, Magnetic } from "./motion";
import { HeroDemoCard } from "./hero-demo-card";

const AUDIENCE_SEGMENTS = [
  "CAMPUS PLACEMENT CELLS",
  "T&P OFFICES",
  "STAFFING AGENCIES",
  "HIRING COMMITTEES",
  "RECRUITMENT OPS TEAMS",
  "VOLUME HIRING DESKS",
];

const TRUST_CHIPS = [
  "DPDP Act 2023 Compliant",
  "Zero auto-rejects",
  "Designed for <8 min per 100-resume batches",
];

export function HeroSection() {
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );

  // Mouse-parallax: backdrop drifts gently opposite to cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-0.5, 0.5], [18, -18]), { stiffness: 55, damping: 20 });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 55, damping: 20 });

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      onMouseMove={(e) => {
        if (!finePointer) return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* Cinematic beam backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div className="absolute inset-0" style={{ x: px, y: py }}>
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
          }}
        />
        <div className="beam-sweep-a absolute -top-48 left-[18%] w-[420px] h-[130%] bg-gradient-to-b from-[var(--brand-primary)]/15 to-transparent blur-3xl" />
        <div className="beam-sweep-b absolute -top-48 right-[15%] w-[360px] h-[130%] bg-gradient-to-b from-[var(--accent-gap)]/10 to-transparent blur-3xl" />
        </motion.div>
      </div>

      {/* Centered cinematic content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-12 lg:pt-28 flex flex-col items-center text-center gap-6">
        <Reveal y={16}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-semibold uppercase tracking-wider bg-[var(--brand-soft)] text-[var(--brand-primary)] border border-[var(--brand-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-evidence)]" />
              <span>Candidate Screening Instrument</span>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-semibold uppercase tracking-wider bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
              Prototype · Building with Early Users
            </div>
          </div>
        </Reveal>

        <AnimatedHeadline
          className="font-display text-5xl sm:text-6xl lg:text-[76px] leading-[1.04] tracking-tight text-[var(--text-primary)]"
          lines={[
            { text: "Stop skimming resumes." },
            { text: "See the evidence.", gradient: true },
          ]}
        />

        <Reveal delay={0.7} y={18}>
          <p className="max-w-2xl text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans">
            Merix is built to screen 100 candidate resumes in minutes against your exact
            70/20/10 rubric — citing the verbatim quote behind every point, so you can defend
            every decision.
          </p>
        </Reveal>

        <Reveal delay={0.85} y={18}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Magnetic strength={0.25}>
              <Link
                href="/signup"
                className="btn-gradient cta-halo flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm text-white cursor-pointer"
              >
                <span>Start Batch Screening Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Magnetic>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <span>Watch It Work</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)] pt-3">
            Free during early access — no credit card, no setup call required.
          </p>
        </Reveal>

        <Reveal delay={1} y={14}>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 text-xs font-mono text-[var(--text-muted)]">
            {TRUST_CHIPS.map((chip) => (
              <span key={chip} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[var(--accent-evidence)] shrink-0" />
                {chip}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Live product demo with 3D tilt */}
      <div
        className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-8"
        style={{ perspective: 1400 }}
      >
        <HeroDemoCard />
      </div>

      {/* Audience segments marquee */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-6 space-y-5">
        <p className="text-center text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
          Built for India&apos;s campus placement &amp; staffing pipelines
        </p>
        <div className="relative">
          {/* Warm shimmer band that brightens names passing center */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-1/3 bg-gradient-to-r from-transparent via-[var(--brand-primary)]/[0.08] to-transparent z-10"
          />
          <Marquee
            duration={30}
            items={AUDIENCE_SEGMENTS.map((name) => (
              <span
                key={name}
                className="flex items-center gap-x-10 text-sm font-mono font-bold text-[var(--text-secondary)] opacity-60 whitespace-nowrap"
              >
                {name}
                <span aria-hidden="true" className="opacity-40">•</span>
              </span>
            ))}
          />
        </div>
      </div>
    </section>
  );
}