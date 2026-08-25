"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress — 2px chai-gradient bar fixed at the top of the viewport,
 * fills horizontally with scroll position (spring-smoothed).
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-[var(--brand-primary)] via-[var(--accent-gap)] to-[var(--brand-primary)]"
      style={{ scaleX }}
    />
  );
}