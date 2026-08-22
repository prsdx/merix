"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BrainCircuit, Code2, Cpu, GitPullRequest, Search, Zap, ChevronRight, CheckCircle2 } from "lucide-react";

export default function MerixLandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-neutral-800 selection:text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-mono font-semibold tracking-wider text-white">MERIX</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Enterprise</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors hidden sm:block">
              Log in
            </button>
            <button className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Book Demo
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 relative z-10 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-mono tracking-widest text-neutral-300 uppercase">Merix AI Engine v2.0 Live</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tight text-white mb-8 leading-tight">
              Hire engineering talent with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-400">
                superhuman precision.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Merix autonomously evaluates GitHub repos, system design chops, and architecture decisions to give you actionable hiring dossiers. Skip the noise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                Start Hiring Now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 text-white rounded-full font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                <Code2 className="w-4 h-4 text-neutral-400" />
                View Technical Demo
              </button>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[320px]">
          {/* Card 1: Large Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 row-span-1 rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-8 relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col justify-between min-h-[320px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="z-10 relative">
              <BrainCircuit className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-3">Semantic Code Analysis</h3>
              <p className="text-neutral-400 max-w-md">
                We don't look for keywords. Merix parses pull requests and architecture documents to evaluate candidates on actual software engineering principles.
              </p>
            </div>
            
            <div className="absolute bottom-[-10px] right-8 w-64 md:w-80 h-40 border border-white/10 rounded-t-xl bg-black/80 backdrop-blur-md p-4 flex flex-col gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                <GitPullRequest className="w-3 h-3" /> PR #142 Analyzed
              </div>
              <div className="space-y-2 mt-2">
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[85%]" />
                </div>
                <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Architecture Score: 85/100</div>
              </div>
              <div className="space-y-2 mt-1">
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[92%]" />
                </div>
                <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Clean Code: 92/100</div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Small Square */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-8 flex flex-col justify-between group hover:border-white/20 transition-colors relative overflow-hidden min-h-[320px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="z-10 relative">
              <Zap className="w-8 h-8 text-blue-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Instant Dossiers</h3>
              <p className="text-sm text-neutral-400">
                Within minutes of applying, receive a detailed report on the candidate's strengths and exact skill matches.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs font-mono text-blue-400 z-10 relative bg-blue-500/10 w-fit px-3 py-1.5 rounded-full border border-blue-500/20">
              <CheckCircle2 className="w-4 h-4" />
              GENERATION COMPLETE
            </div>
          </motion.div>

          {/* Card 3: Small Square */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-8 flex flex-col justify-between group hover:border-white/20 transition-colors relative overflow-hidden min-h-[320px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="z-10 relative">
              <Search className="w-8 h-8 text-cyan-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Unbiased Evidence</h3>
              <p className="text-sm text-neutral-400">
                Every AI assertion is backed by cited code commits or portfolio references. No hallucination, just facts.
              </p>
            </div>
            <div className="z-10 relative border-l-2 border-cyan-500/30 pl-4 py-1 mt-6">
               <p className="text-xs font-mono text-neutral-500 italic">"Candidate implemented a resilient retry strategy in src/network.ts lines 45-60."</p>
            </div>
          </motion.div>

          {/* Card 4: Large Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 row-span-1 rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-8 relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col md:flex-row items-center justify-between gap-8 min-h-[320px]"
          >
            <div className="flex-1 z-10">
              <Cpu className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-3">Automated Tech Screens</h3>
              <p className="text-neutral-400 mb-6 max-w-md">
                Replace your 1-hour engineering screen with our interactive AI agent. It conducts a dynamic, system-design focused chat interview.
              </p>
              <button className="text-sm font-medium text-white hover:text-emerald-400 transition-colors flex items-center gap-2">
                See How It Works <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Decorative element */}
            <div className="w-full md:w-72 h-48 border border-white/10 rounded-xl bg-black/50 p-4 font-mono text-xs text-neutral-500 flex flex-col justify-end relative shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/30 transition-colors">
               <div className="absolute top-4 left-4 flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                 <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                 <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
               </div>
               <div className="mt-8 space-y-3">
                 <div className="flex gap-2">
                   <span className="text-emerald-400 shrink-0">AI:</span>
                   <span className="text-neutral-300">"How would you scale this?"</span>
                 </div>
                 <div className="flex gap-2 bg-white/5 p-2 rounded">
                   <span className="text-neutral-500 shrink-0">User:</span>
                   <span className="text-neutral-400">"I'd use Redis for caching and read replicas."</span>
                 </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Closing CTA */}
        <section className="mt-32 text-center pb-12 pt-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
          
          <h2 className="text-3xl font-bold text-white mb-6">Ready to upgrade your hiring?</h2>
          <p className="text-neutral-400 mb-10 max-w-lg mx-auto">Join elite engineering teams using Merix to find the top 1% of talent automatically.</p>
          <button className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Get Early Access
          </button>
        </section>
      </main>
    </div>
  );
}
