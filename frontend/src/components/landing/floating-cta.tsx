"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

/**
 * FloatingCta — slim pill that pops in after the visitor scrolls past the hero
 * and politely disappears once the footer CTA panel is on screen.
 * Dismissable; desktop-focused (hidden below sm to avoid nav clutter).
 */
export function FloatingCta() {
  const [pastHero, setPastHero] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const ctaSentinelRef = useRef<HTMLDivElement>(null);
  const footerCtaVisible = useInView(ctaSentinelRef, { margin: "-15% 0px -15% 0px" });

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-25% 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const visible = pastHero && !footerCtaVisible && !dismissed;

  return (
    <>
      {/* Sentinel placed above the final CTA section */}
      <div ref={ctaSentinelRef} aria-hidden="true" className="absolute bottom-0 h-px w-full" />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="hidden sm:flex fixed bottom-5 right-5 z-50 items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full glass-nav glass-nav-scrolled shadow-lg"
          >
            <span className="text-xs font-mono text-[var(--text-muted)] whitespace-nowrap">
              100 resumes • &lt;8 min
            </span>
            <Link
              href="/signup"
              className="btn-gradient flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white cursor-pointer"
            >
              Start Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}