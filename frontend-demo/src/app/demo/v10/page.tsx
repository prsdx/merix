"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from "motion/react";
import { FileText, BrainCircuit, ShieldCheck, Zap, ArrowRight, Check, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------

const FEATURES = [
  {
    title: "Explainable Matching",
    desc: "No more black boxes. See exactly which skills matched, the strength of the match, and verbatim evidence from the resume.",
    icon: <BrainCircuit className="w-6 h-6 text-emerald-400" />,
  },
  {
    title: "Batch Processing",
    desc: "Process up to 100 resumes against a single job description in under 30 seconds. Perfect for campus placements.",
    icon: <Zap className="w-6 h-6 text-amber-400" />,
  },
  {
    title: "DPDP Compliant",
    desc: "Built-in consent tracking, automatic 90-day retention policies, and PII scrubbing before AI processing.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
  },
];

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function MerixLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smooth scroll progress for global background effects
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });
  
  const bgOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.5, 0.8, 0.3]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.2]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* Ambient Background */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-50"
        style={{ opacity: bgOpacity, scale: bgScale }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[150px]" />
      </motion.div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 mix-blend-difference backdrop-blur-md border-b border-white/5">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-xl font-bold tracking-tighter text-white flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-emerald-500 rounded-sm" />
          MERIX
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="flex items-center gap-6 text-sm font-medium"
        >
          <Link href="#" className="hidden md:block text-zinc-400 hover:text-white transition-colors">Manifesto</Link>
          <Link href="#" className="hidden md:block text-zinc-400 hover:text-white transition-colors">Features</Link>
          <button className="bg-white text-black px-5 py-2.5 rounded-full hover:bg-emerald-400 hover:text-black transition-all duration-300 font-semibold tracking-wide">
            Request Access
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-24 px-6">
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs md:text-sm font-mono mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            v1.0 Candidate Matching Engine Live
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-white mb-8 leading-[1.1] max-w-5xl">
            <motion.span 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="block text-zinc-400"
            >
              Black-box ATS is dead.
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Know <i className="text-emerald-400">exactly</i> why
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              a candidate fits.
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="text-lg md:text-2xl text-zinc-400 max-w-3xl mb-12 leading-relaxed"
          >
            The first explainable, DPDP-compliant resume matching engine built for Indian campus placements and high-volume staffing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button className="group h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto text-lg">
              Start Matching
              <motion.span 
                className="inline-block"
                group-hover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </button>
            <button className="h-14 px-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 w-full sm:w-auto text-lg">
              View Demo
            </button>
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 w-full max-w-5xl aspect-video md:aspect-[21/9] relative rounded-t-3xl border-t border-l border-r border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden flex items-end justify-center"
        >
          {/* Abstract UI Representation */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
          <div className="w-[80%] h-[80%] relative z-0 flex gap-6 mt-12 p-8">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="flex-1 bg-zinc-900/80 border border-white/5 rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="h-4 w-1/3 bg-white/10 rounded-full" />
              <div className="h-4 w-2/3 bg-white/5 rounded-full" />
              <div className="h-4 w-1/2 bg-white/5 rounded-full" />
              <div className="mt-auto flex items-center justify-between">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><FileText className="w-4 h-4 text-emerald-400"/></div>
                 <div className="text-xs font-mono text-zinc-500">100 Resumes Loaded</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="w-72 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0"
                animate={{ opacity: [0, 1, 0], y: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              />
              <div className="text-6xl font-light text-emerald-400 tabular-nums tracking-tighter">94</div>
              <div className="text-xs tracking-[0.2em] uppercase text-emerald-500/60 font-bold">Match Score</div>
              <div className="w-full mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300"><CheckCircle2 className="w-3 h-3 text-emerald-400"/> Python (Advanced)</div>
                <div className="flex items-center gap-2 text-xs text-zinc-300"><CheckCircle2 className="w-3 h-3 text-emerald-400"/> React (Medium)</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative z-10 py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-4">
              Intelligence you can <span className="text-emerald-400 italic">trust</span>.
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mb-24">
              Merix is built from the ground up to provide transparent, defendable decisions while handling the immense scale of Indian campus recruitment.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <FadeIn key={feat.title} delay={0.2 * i}>
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl h-full flex flex-col hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-medium mb-4">{feat.title}</h3>
                  <p className="text-zinc-400 leading-relaxed font-light">{feat.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Scroll Section - Explainability Demo */}
      <section className="relative z-10 py-48 px-6 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-32">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">See exactly why they matched.</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Click any matched skill to see the exact verbatim evidence extracted from the resume.</p>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
            
            {/* Mock JD */}
            <FadeIn delay={0.2} className="w-full lg:w-1/3 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 sticky top-32">
              <div className="text-xs font-mono text-zinc-500 mb-6 uppercase tracking-wider">Job Description</div>
              <h4 className="text-2xl font-medium mb-4">Frontend Engineer</h4>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                  Required: React.js (3+ years)
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                  Required: TypeScript
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5 text-zinc-400 text-sm">
                  Preferred: Framer Motion
                </div>
              </div>
            </FadeIn>

            {/* Mock Result */}
            <FadeIn delay={0.4} className="w-full lg:w-2/3 space-y-6">
               <motion.div 
                 whileHover={{ scale: 1.01 }}
                 className="bg-zinc-900/80 border border-white/10 rounded-3xl p-8 relative overflow-hidden group cursor-pointer"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b border-white/5">
                   <div>
                     <h3 className="text-3xl font-medium text-white mb-2">Aarav Sharma</h3>
                     <div className="text-sm text-zinc-400 font-mono">resume_aarav_s_2026.pdf</div>
                   </div>
                   <div className="mt-4 sm:mt-0 flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-4xl font-light text-emerald-400 tabular-nums">92</div>
                        <div className="text-[10px] uppercase tracking-widest text-emerald-500/50 font-bold">Score</div>
                      </div>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <div>
                     <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500"/> Matched Requirements
                     </div>
                     <div className="grid gap-3">
                       <div className="bg-black/50 border border-white/5 rounded-xl p-4 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5">
                         <div className="flex justify-between items-center mb-2">
                           <span className="font-medium text-emerald-300">React.js</span>
                           <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Advanced</span>
                         </div>
                         <p className="text-sm text-zinc-400 font-serif italic border-l-2 border-emerald-500/30 pl-3">
                           "Architected and built the core user dashboard using React.js and Next.js, serving 50,000+ daily active users over 3.5 years."
                         </p>
                       </div>
                       <div className="bg-black/50 border border-white/5 rounded-xl p-4 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5">
                         <div className="flex justify-between items-center mb-2">
                           <span className="font-medium text-emerald-300">TypeScript</span>
                           <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Advanced</span>
                         </div>
                         <p className="text-sm text-zinc-400 font-serif italic border-l-2 border-emerald-500/30 pl-3">
                           "Migrated entire legacy JavaScript codebase to strict TypeScript, reducing runtime errors by 40%."
                         </p>
                       </div>
                     </div>
                   </div>

                   <div className="pt-4 border-t border-white/5">
                     <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4 text-amber-500"/> Missing / Gaps
                     </div>
                     <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                       <span className="text-zinc-400 text-sm">Framer Motion</span>
                       <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Not Found</span>
                     </div>
                   </div>
                 </div>
               </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center bg-zinc-900/50 border border-white/10 rounded-3xl p-12 md:p-24 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_50%)]" />
          <FadeIn className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Ready to upgrade your hiring?</h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
              Join the waitlist for Merix v1.0 and get early access to transparent, DPDP-compliant resume matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full transition-all duration-300 text-lg">
                Request Early Access
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6 bg-black text-zinc-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-zinc-300 tracking-tighter">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm" /> MERIX
          </div>
          <div>&copy; {new Date().getFullYear()} Merix Systems. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
