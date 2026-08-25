"use client";

/**
 * Landing motion primitives — Linear/Vercel-grade smoothness.
 * All animations respect prefers-reduced-motion.
 */

import React, { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring, type Variants } from "framer-motion";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/* ------------------------------------------------------------------ */
/* Reveal — scroll-triggered fade + rise                               */
/* ------------------------------------------------------------------ */

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

export function Reveal({ children, className, delay = 0, y = 28, once = true }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-72px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger — orchestrated children cascade                             */
/* ------------------------------------------------------------------ */

const staggerContainer: Variants = {
  hidden: {},
  show: (gap: number) => ({
    transition: { staggerChildren: gap, delayChildren: 0.1 },
  }),
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  gap?: number;
}

export function Stagger({ children, className, gap = 0.09 }: StaggerProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      custom={gap}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-64px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimatedHeadline — word-by-word masked rise (hero)                  */
/* ------------------------------------------------------------------ */

interface HeadlineLine {
  text: string;
  gradient?: boolean;
}

export function AnimatedHeadline({
  lines,
  className,
}: {
  lines: HeadlineLine[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  let wordIndex = 0;

  return (
    <h1 className={className}>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {line.text.split(" ").map((word) => {
            const i = wordIndex++;
            return (
              <span
                key={`${lineIdx}-${i}`}
                className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
              >
                <motion.span
                  className={`inline-block ${line.gradient ? "gradient-text" : ""}`}
                  initial={reduce ? undefined : { y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.85,
                    delay: 0.15 + i * 0.055,
                    ease: EASE,
                  }}
                >
                  {word}
                  {"\u00A0"}
                </motion.span>
              </span>
            );
          })}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </h1>
  );
}

/* ------------------------------------------------------------------ */
/* SpotlightCard — cursor-following radial glow (Aceternity-style)     */
/* ------------------------------------------------------------------ */

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  /** Diameter of the light pool in px */
  size?: number;
}

export function SpotlightCard({ children, className = "", size = 420 }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: -size, y: -size });
  const [visible, setVisible] = useState(false);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [reduce],
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={`spotlight-card group relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: visible && !reduce ? 1 : 0,
          background: `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, var(--spotlight-glow), transparent 65%)`,
        }}
      />
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — infinite proof strip                                      */
/* ------------------------------------------------------------------ */

export function Marquee({
  items,
  duration = 34,
  reverse = false,
}: {
  items: React.ReactNode[];
  duration?: number;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  const row = [...items, ...items];
  return (
    <div className="marquee-mask relative w-full overflow-hidden">
      <div
        className={`marquee-track flex w-max items-center gap-x-10 ${reduce ? "" : "marquee-animate"} ${reverse ? "marquee-reverse" : ""}`}
        style={
          reduce ? undefined : ({ "--marquee-duration": `${duration}s` } as React.CSSProperties)
        }
      >
        {row.map((node, idx) => (
          <div key={idx} className="shrink-0">
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — button leans toward the cursor within its bounds         */
/* ------------------------------------------------------------------ */

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Fraction of cursor offset applied as translation */
  strength?: number;
}

export function Magnetic({ children, className = "", strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );
  const x = useSpring(0, { stiffness: 200, damping: 16, mass: 0.4 });
  const y = useSpring(0, { stiffness: 200, damping: 16, mass: 0.4 });

  if (reduce || !finePointer) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x, y }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((e.clientY - (rect.top + rect.height / 2)) * strength * 0.8);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}