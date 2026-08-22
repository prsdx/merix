"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ArrowUpRight } from "lucide-react";

// ─── Typography ────────────────────────────────────────────────────────────────
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// ─── Ambient orbs — static, very subtle ───────────────────────────────────────
const AmbientField = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
    {/* Violet — top-left */}
    <motion.div
      animate={{ x: [0, 40, -20, 0], y: [0, -40, 20, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-5%] h-[65vw] w-[65vw] rounded-full bg-violet-700/[0.07] blur-[140px]"
    />
    {/* Blue — right */}
    <motion.div
      animate={{ x: [0, -50, 30, 0], y: [0, 60, -30, 0] }}
      transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[20%] right-[-10%] h-[55vw] w-[55vw] rounded-full bg-blue-700/[0.06] blur-[160px]"
    />
    {/* Fuchsia — bottom */}
    <motion.div
      animate={{ x: [0, 30, -50, 0], y: [0, 80, -40, 0] }}
      transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-15%] left-[30%] h-[60vw] w-[60vw] rounded-full bg-fuchsia-700/[0.05] blur-[180px]"
    />
  </div>
);

// ─── Feature row — text-only, no cards ────────────────────────────────────────
interface FeatureRowProps {
  index: string;
  headline: string;
  body: string;
  delay?: number;
}

const FeatureRow = ({ index, headline, body, delay = 0 }: FeatureRowProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    className="grid grid-cols-[3rem_1fr] gap-x-8 md:grid-cols-[6rem_1fr_1.4fr] md:gap-x-16 items-start border-t border-white/[0.07] py-12 md:py-16"
  >
    {/* Index */}
    <span className={`text-xs tracking-[0.2em] text-white/20 pt-1.5 ${dmSans.className}`}>
      {index}
    </span>

    {/* Headline */}
    <h3
      className={`text-2xl md:text-[2rem] leading-tight text-white/90 md:col-span-1 mb-4 md:mb-0 ${playfair.className}`}
    >
      {headline}
    </h3>

    {/* Body */}
    <p
      className={`text-[0.9375rem] leading-[1.75] text-white/35 font-light col-start-2 md:col-start-auto ${dmSans.className}`}
    >
      {body}
    </p>
  </motion.div>
);

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function MerixLandingV15() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], ["0%", "8%"]);

  return (
    <div
      className={`relative min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 selection:text-white antialiased ${dmSans.className}`}
    >
      <AmbientField />

      {/* ─── Navigation ──────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-7"
      >
        <span
          className={`text-[1.05rem] font-medium tracking-[0.08em] text-white/90 ${playfair.className}`}
        >
          MERIX
        </span>
        <button
          className={`text-[0.6875rem] font-medium tracking-[0.22em] uppercase text-white/40 hover:text-white/90 transition-colors duration-300 ${dmSans.className}`}
        >
          Request Access
        </button>
      </motion.header>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 flex min-h-screen flex-col justify-center px-8 md:px-16 lg:px-24 pt-32 pb-28"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={`mb-12 text-[0.6875rem] tracking-[0.26em] uppercase text-white/30 ${dmSans.className}`}
        >
          The New Standard of Hiring
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`max-w-4xl text-[3.25rem] leading-[1.04] tracking-tight md:text-[5.5rem] lg:text-[7.5rem] xl:text-[8.5rem] ${playfair.className}`}
        >
          Shortlist{" "}
          <span className="italic font-normal text-white/40">100 resumes</span>
          <br />
          in 10 minutes.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-12 max-w-sm text-[0.9375rem] leading-[1.8] text-white/35 font-light ${dmSans.className}`}
        >
          Merix redefines talent acquisition. Evidence-grounded AI matching for
          placement cells and staffing agencies. DPDP-compliant from day one.
        </motion.p>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16"
        >
          <button
            className={`group inline-flex items-center gap-3 text-[0.6875rem] font-medium tracking-[0.22em] uppercase text-white/80 hover:text-white transition-colors duration-300 ${dmSans.className}`}
          >
            <span className="border-b border-white/25 pb-1 group-hover:border-white/70 transition-colors duration-300">
              Start Free Trial
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
          </button>
          <p
            className={`mt-4 text-[0.6875rem] tracking-[0.1em] text-white/[0.18] ${dmSans.className}`}
          >
            No credit card required — 14-day free trial
          </p>
        </motion.div>
      </motion.section>

      {/* ─── Social proof band ───────────────────────────────────────── */}
      <section className="relative z-10 px-8 md:px-16 lg:px-24 py-8 border-t border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-x-12 gap-y-4"
        >
          <span
            className={`text-[0.6rem] tracking-[0.24em] uppercase text-white/20 ${dmSans.className}`}
          >
            Trusted by
          </span>
          {[
            "IIT Bombay TPO",
            "GlobalStaff",
            "Nexus Hiring",
            "Zenith Inst.",
            "Innovate Edu",
          ].map((name) => (
            <span
              key={name}
              className={`text-[0.8125rem] font-light text-white/[0.18] ${dmSans.className}`}
            >
              {name}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────── */}
      <section className="relative z-10 px-8 md:px-16 lg:px-24 pt-32 pb-0">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className={`mb-2 text-[0.6rem] tracking-[0.26em] uppercase text-white/20 ${dmSans.className}`}
        >
          Architecture of Precision
        </motion.p>

        <FeatureRow
          index="I"
          headline="Explainable matching. No black boxes."
          body="Traditional ATS systems reject resumes with zero explanation. Merix extracts structured evidence and delivers a match score grounded in what the resume actually says — every required skill, every gap, visible at a glance."
          delay={0}
        />
        <FeatureRow
          index="II"
          headline="100 resumes in the time it takes to read one."
          body="Upload your JD and up to 100 resumes in one batch. Merix ranks by fit in under 10 seconds — giving you a shortlist your team can act on immediately, with export to CSV in one click."
          delay={0.05}
        />
        <FeatureRow
          index="III"
          headline="DPDP-compliant, from the ground up."
          body="PII is scrubbed before it touches any LLM provider. Consent workflows, auto-deletion after 90 days, and immutable audit trails ship in the box. Compliance is not a checkbox — it is the architecture."
          delay={0.1}
        />
        <FeatureRow
          index="IV"
          headline="Pure signal. No performative noise."
          body="The modern enterprise suffocates under the weight of irrelevant applications. Merix introduces deterministic candidate matching — relying on verified competencies, not keyword guessing."
          delay={0.15}
        />
      </section>

      {/* ─── Metrics strip ───────────────────────────────────────────── */}
      <section className="relative z-10 px-8 md:px-16 lg:px-24 py-32 border-t border-white/[0.07] mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-16 sm:gap-x-8">
          {[
            { stat: "~4 hrs", label: "Saved per batch", footnote: "100 resumes, 10 minutes" },
            { stat: ">95%", label: "Parse success rate", footnote: "PDFs, DOCX, complex layouts" },
            { stat: "100%", label: "Auditable scores", footnote: "Every decision, evidenced" },
          ].map(({ stat, label, footnote }, i) => (
            <motion.div
              key={stat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className={`text-[3.5rem] md:text-[5rem] leading-none tracking-tighter text-white/90 mb-3 ${playfair.className}`}
              >
                {stat}
              </p>
              <p className={`text-sm text-white/50 ${dmSans.className}`}>{label}</p>
              <p
                className={`mt-1.5 text-[0.6875rem] tracking-[0.1em] text-white/20 ${dmSans.className}`}
              >
                {footnote}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Pull quote ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-8 md:px-16 lg:px-24 py-32 border-t border-white/[0.07]">
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={`max-w-3xl text-[1.75rem] md:text-[2.5rem] leading-[1.25] text-white/60 font-normal ${playfair.className}`}
        >
          &ldquo;Merix has restored elegance to an industry defined by chaos.
          It is the only platform we trust with our most{" "}
          <span className="italic text-white/90">critical hires.</span>&rdquo;
        </motion.blockquote>
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`mt-8 text-[0.6875rem] tracking-[0.2em] uppercase text-white/25 ${dmSans.className}`}
        >
          — Chief Operating Officer, Fortune 50
        </motion.footer>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────────── */}
      <section className="relative z-10 px-8 md:px-16 lg:px-24 pt-24 pb-40 border-t border-white/[0.07]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className={`text-[2.75rem] md:text-[5.5rem] lg:text-[7rem] leading-[1.03] tracking-tight text-white/85 max-w-5xl ${playfair.className}`}
          >
            Enter the{" "}
            <span className="italic font-normal text-white/35">Standard.</span>
          </h2>

          <div className="mt-16 flex flex-col sm:flex-row items-start gap-8">
            <button
              className={`group inline-flex items-center gap-3 text-[0.6875rem] font-medium tracking-[0.22em] uppercase text-white hover:text-white/60 transition-colors duration-300 ${dmSans.className}`}
            >
              <span className="border-b border-white/40 pb-1 group-hover:border-white/20 transition-colors duration-300">
                Start Free Trial
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </button>
            <span
              className={`hidden sm:block self-end text-[0.6875rem] tracking-[0.1em] text-white/[0.18] pb-1 ${dmSans.className}`}
            >
              No credit card · 14-day trial · Cancel anytime
            </span>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 md:px-16 lg:px-24 py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span
          className={`text-[0.8125rem] font-medium tracking-[0.08em] text-white/30 ${playfair.className}`}
        >
          MERIX
        </span>
        <span
          className={`text-[0.6875rem] tracking-[0.1em] text-white/[0.18] ${dmSans.className}`}
        >
          © {new Date().getFullYear()} Merix Technologies. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
