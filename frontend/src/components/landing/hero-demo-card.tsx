"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ScoreRing } from "@/components/score-ring";
import { SpotlightCard } from "./motion";

const HERO_APPLICANTS = [
  {
    id: "cand-1",
    initials: "AS",
    name: "Aditya Sharma",
    institution: "IIT Bombay",
    degree: "B.Tech Computer Science (2022)",
    experience: "3.5 Years",
    score: 94,
    verd: "Strong",
    verdClass: "verd-strong",
    reqScore: 68,
    evidence:
      "Architected distributed async microservices with FastAPI and PostgreSQL pgvector, processing 5M+ vector queries daily at sub-50ms latency in containerized clusters.",
    matchedSkills: ["Python 3.11+", "FastAPI AsyncIO", "PostgreSQL", "pgvector", "Docker", "Redis"],
    missingSkills: ["Kubernetes Ops"],
  },
  {
    id: "cand-2",
    initials: "PN",
    name: "Priya Nair",
    institution: "NIT Surathkal",
    degree: "B.Tech Information Tech (2023)",
    experience: "2 Years",
    score: 72,
    verd: "Mixed",
    verdClass: "verd-mixed",
    reqScore: 52,
    evidence:
      "Built backend data pipelines using FastAPI and PostgreSQL, implementing vector similarity search for recommendation systems on AWS container services.",
    matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    missingSkills: ["pgvector Tuning", "Redis Cache Tier"],
  },
  {
    id: "cand-3",
    initials: "RV",
    name: "Rohan Verma",
    institution: "BITS Pilani",
    degree: "B.E. Electrical & Electronics",
    experience: "1 Year",
    score: 41,
    verd: "Weak",
    verdClass: "verd-weak",
    reqScore: 28,
    evidence:
      "Developed basic REST APIs using Flask and SQLite for university research portal. Familiar with standard Python scripting and Git version control.",
    matchedSkills: ["Python", "Git"],
    missingSkills: ["FastAPI", "PostgreSQL", "pgvector", "Docker", "Redis"],
  },
];

/**
 * HeroDemoCard — live product mockup with subtle cursor-driven 3D tilt.
 */
export function HeroDemoCard() {
  const [selectedApplicant, setSelectedApplicant] = useState(HERO_APPLICANTS[0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4.5, -4.5]), {
    stiffness: 140,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 140,
    damping: 18,
  });

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <SpotlightCard className="card-glow overflow-hidden text-left">
        <div className="px-5 py-3.5 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-evidence)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">Senior Backend Engineer</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">• 24 Ingested</span>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--accent-evidence)] bg-[var(--accent-evidence-soft)] px-2 py-0.5 rounded border border-[var(--accent-evidence-border)]">
            3 Sample Candidates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)]">
          {/* Candidate Rail */}
          <div className="sm:col-span-5 p-3 space-y-2 bg-[var(--bg-surface)]">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">
              Ranked by Overall Fit:
            </div>
            {HERO_APPLICANTS.map((cand) => {
              const isSelected = selectedApplicant.id === cand.id;
              return (
                <button
                  key={cand.id}
                  onClick={() => setSelectedApplicant(cand)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[var(--brand-soft)] border-[var(--brand-border)] shadow-xs ring-1 ring-[var(--brand-border)]"
                      : "bg-[var(--bg-subtle)] border-transparent hover:border-[var(--border-hairline)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] text-[var(--bg-canvas)] text-xs font-bold flex items-center justify-center shrink-0">
                      {cand.initials}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-bold text-sm text-[var(--text-primary)] truncate">{cand.name}</div>
                      <div className="text-xs font-mono text-[var(--text-muted)] truncate">{cand.institution}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-1.5">
                    <span className={cand.verdClass}>{cand.verd}</span>
                    <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{cand.score}</span>
                  </div>
                </button>
              );
            })}
            <div className="p-2 text-center text-xs font-mono text-[var(--text-muted)] border-t border-[var(--border-hairline)] pt-2">
              +21 more applicants in this drive
            </div>
          </div>

          {/* Dossier */}
          <div className="sm:col-span-7 p-5 space-y-4 bg-[var(--bg-surface)]">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
              <div>
                <div className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                  <span>{selectedApplicant.name}</span>
                  <span className="text-sm font-mono text-[var(--text-muted)]">({selectedApplicant.experience} YOE)</span>
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                  {selectedApplicant.degree} • {selectedApplicant.institution}
                </div>
              </div>
              <ScoreRing score={selectedApplicant.score} size={54} strokeWidth={5} />
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Required Technical (70% wt)</span>
                <span className="font-bold text-[var(--brand-primary)]">{selectedApplicant.reqScore}/70</span>
              </div>
              <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--brand-primary)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(selectedApplicant.reqScore / 70) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Verbatim Resume Quote:
              </div>
              <div className="forensic-citation">&ldquo;{selectedApplicant.evidence}&rdquo;</div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedApplicant.matchedSkills.map((sk) => (
                <span key={sk} className="tag-evidence">✓ {sk}</span>
              ))}
              {selectedApplicant.missingSkills.map((sk) => (
                <span key={sk} className="tag-gap">✕ {sk}</span>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-sm">
              <span className="text-xs font-mono text-[var(--text-muted)]">Recruiter Decision:</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--accent-evidence-soft)] text-[var(--accent-evidence)] border border-[var(--accent-evidence-border)] hover:bg-[var(--accent-evidence)] hover:text-white transition-colors cursor-pointer">✓ Advance</button>
                <button className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-[var(--accent-gap-soft)] text-[var(--accent-gap)] border border-[var(--accent-gap-border)] transition-colors cursor-pointer">Hold</button>
                <button className="px-2 py-1.5 rounded-lg text-sm font-semibold bg-[var(--accent-danger-soft)] text-[var(--accent-danger)] border border-[var(--accent-danger-border)] transition-colors cursor-pointer">Pass</button>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}