"use client";

import React from "react";
import { CountUp } from "@/components/count-up";
import { Reveal } from "./motion";

interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  accent: string;
}

const STATS: Stat[] = [
  {
    value: 142,
    label: "Resumes screened across campus drives today",
    accent: "text-[var(--text-primary)]",
  },
  {
    value: 116,
    label: "Shortlisted with 100% verbatim proof citations",
    accent: "text-[var(--brand-primary)]",
  },
  {
    value: 8,
    prefix: "< ",
    suffix: " min",
    label: "Average 100-resume batch turnaround",
    accent: "text-[var(--accent-evidence)]",
  },
  {
    value: 0,
    label: "Silent auto-rejects — every case reaches humans",
    accent: "text-[var(--accent-gap)]",
  },
];

export function StatsBand() {
  return (
    <section className="w-full border-y border-[var(--border-hairline)] bg-[var(--bg-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Reveal y={20}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center space-y-2 px-2">
                <div
                  className={`text-4xl sm:text-5xl font-mono font-bold tracking-tight ${s.accent}`}
                >
                  <CountUp
                    to={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    duration={1.8}
                  />
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] leading-relaxed max-w-[220px] mx-auto">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}