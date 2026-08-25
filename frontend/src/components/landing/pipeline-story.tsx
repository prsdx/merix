"use client";

import React, { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { ScoreRing } from "@/components/score-ring";
import { Reveal } from "./motion";

interface Stage {
  id: string;
  kicker: string;
  title: string;
  body: string;
  mock: React.ReactNode;
}

const STAGES: Stage[] = [
  {
    id: "rubric",
    kicker: "STEP 01",
    title: "Paste the JD. Get a deterministic rubric.",
    body: "Merix extracts mandatory skills (70%), preferred competencies (20%), and verified experience (10%) — no manual weighting, no ambiguity about what matters.",
    mock: (
      <div className="merix-card card-glow overflow-hidden h-full flex flex-col">
        <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex justify-between items-center text-xs font-mono text-[var(--text-muted)]">
          <span>senior_backend_engineer.jd</span>
          <span className="text-[var(--accent-evidence)] font-bold">✓ PARSED</span>
        </div>
        <div className="p-5 space-y-4 font-mono text-xs">
          <div className="flex justify-between uppercase tracking-wider text-[var(--text-muted)]">
            <span>Extracted Rubric</span>
            <span className="text-[var(--accent-evidence)] font-bold">100% Deterministic</span>
          </div>
          {[
            ["Required (70%)", "FastAPI, SQL, pgvector"],
            ["Preferred (20%)", "Docker, Redis, CI/CD"],
            ["Experience (10%)", "2+ Years Production"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-1"
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{k}</div>
              <div className="font-bold text-[var(--text-primary)] text-sm">{v}</div>
            </div>
          ))}
          <div className="forensic-citation !mt-5">
            Source sentence: &ldquo;Must have deep experience with async Python services and vector
            databases.&rdquo;
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "batch",
    kicker: "STEP 02",
    title: "Drop 100 resumes. DPDP gate runs itself.",
    body: "The entire PDF pile is ingested in parallel — magic bytes validated, PII scrubbed, affirmative consent logged server-side before a single token is read.",
    mock: (
      <div className="merix-card card-glow overflow-hidden h-full flex flex-col">
        <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex justify-between items-center text-xs font-mono text-[var(--text-muted)]">
          <span>batch_upload • 24 files</span>
          <span className="text-[var(--brand-primary)] font-bold">PARALLEL ASYNC</span>
        </div>
        <div className="p-5 space-y-2.5 font-mono text-xs">
          {[
            "Aditya_Sharma_IITB.pdf",
            "Priya_Nair_NITK.pdf",
            "Rohan_Verma_BITSP.pdf",
            "+21 more…",
          ].map((f) => (
            <div
              key={f}
              className="flex justify-between items-center p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)]"
            >
              <span className="text-[var(--text-secondary)]">{f}</span>
              <span className="text-[var(--accent-evidence)] font-bold">
                {f.startsWith("+") ? "QUEUED" : "✓ PII REDACTED"}
              </span>
            </div>
          ))}
          <div className="pt-3 space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <span>Ingestion progress</span>
              <span className="text-[var(--accent-evidence)] font-bold">100%</span>
            </div>
            <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--accent-gap)]"
                initial={{ width: "12%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "inspect",
    kicker: "STEP 03",
    title: "Inspect evidence. Advance with proof.",
    body: "A ranked leaderboard where every score opens into the exact resume sentences behind it. Advance, hold, or purge — your call, fully documented.",
    mock: (
      <div className="merix-card card-glow overflow-hidden h-full flex flex-col">
        <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex justify-between items-center text-xs font-mono text-[var(--text-muted)]">
          <span>Ranked Leaderboard</span>
          <span className="text-[var(--text-primary)] font-bold">CSV READY</span>
        </div>
        <div className="p-5 space-y-4">
          {[94, 72].map((score, i) => (
            <div
              key={score}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]"
            >
              <ScoreRing score={score} size={46} strokeWidth={4.5} />
              <div className="min-w-0">
                <div className="font-bold text-sm text-[var(--text-primary)]">
                  #{i + 1} {i === 0 ? "Aditya Sharma" : "Priya Nair"}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] truncate">
                  {i === 0 ? "IIT Bombay • 3.5 YOE" : "NIT Surathkal • 2 YOE"}
                </div>
              </div>
              <span
                className={`${i === 0 ? "verd-strong" : "verd-mixed"} ml-auto shrink-0`}
              >
                {i === 0 ? "Strong" : "Mixed"}
              </span>
            </div>
          ))}
          <div className="forensic-citation">
            &ldquo;Architected distributed async microservices with FastAPI and PostgreSQL
            pgvector, processing 5M+ vector queries daily at sub-50ms latency.&rdquo;
          </div>
        </div>
      </div>
    ),
  },
];

export function PipelineStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(STAGES.length - 1, Math.floor(v * STAGES.length)));
  });

  return (
    <section ref={ref} id="how-it-works" className="relative lg:h-[340vh] scroll-mt-0">
      <div className="lg:sticky lg:top-0 lg:min-h-screen flex items-center py-16 lg:py-0">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left rail: pinned narrative */}
          <div className="relative lg:pl-8 space-y-8">
            <div className="absolute left-0 top-3 bottom-3 w-px bg-[var(--border-hairline)] hidden lg:block">
              <motion.div
                className="w-full h-full bg-gradient-to-b from-[var(--brand-primary)] to-[var(--accent-gap)] origin-top"
                style={{ scaleY: scrollYProgress }}
              />
            </div>

            <Reveal>
              <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
                The Pipeline · 01
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)] mt-3 leading-tight">
                From raw pile to defensible shortlist.
              </h2>
            </Reveal>

            {STAGES.map((s, i) => (
              <div
                key={s.id}
                className={`transition-opacity duration-500 ${
                  i === active ? "opacity-100" : "lg:opacity-30"
                }`}
              >
                <div className="text-sm font-mono font-bold gradient-text">{s.kicker}</div>
                <h3 className="font-display text-xl sm:text-2xl text-[var(--text-primary)] mt-1.5">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2 max-w-md">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Right: crossfading product mockups */}
          <Reveal delay={0.15}>
            <div className="relative h-[440px] sm:h-[480px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={STAGES[active].id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.99 }}
                  transition={{ duration: 0.38, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  {STAGES[active].mock}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}