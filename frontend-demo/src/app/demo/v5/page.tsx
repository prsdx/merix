"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, FileSearch } from "lucide-react";
import Link from "next/link";

export default function MerixLandingV5() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Merix</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Features</Link>
            <Link href="#roi" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">ROI</Link>
            <Link href="#compliance" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Compliance</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Log in</button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm shadow-indigo-600/20 flex items-center gap-2">
              Book Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Subtle background radial gradient for the "pristine" feel */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
              Introducing Explainable AI Matching
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 mb-8 leading-[1.1]">
              Shortlist <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">100 resumes</span> in 10 minutes.
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop guessing why candidates were rejected. Merix provides evidence-grounded resume matching for placement cells and staffing agencies. DPDP-compliant out of the box.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-sm">
                See How It Works
              </button>
            </div>
            <p className="mt-4 text-sm text-zinc-500">No credit card required. 14-day free trial.</p>
          </motion.div>

          {/* Hero Image/Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-zinc-200/80 bg-white/50 backdrop-blur-sm p-2 shadow-2xl shadow-zinc-200/50">
              <div className="rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 aspect-[16/9] relative flex flex-col text-left">
                {/* Mock UI Header */}
                <div className="h-12 border-b border-zinc-200 bg-white flex items-center px-4 gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-300" />
                    <div className="w-3 h-3 rounded-full bg-zinc-300" />
                    <div className="w-3 h-3 rounded-full bg-zinc-300" />
                  </div>
                  <div className="flex-1 bg-zinc-100 rounded-md h-6 max-w-sm mx-auto flex items-center justify-center text-xs text-zinc-400 font-medium">
                    merix.app/dashboard/senior-frontend
                  </div>
                </div>
                {/* Mock UI Body */}
                <div className="flex-1 p-6 flex gap-6">
                  {/* Sidebar */}
                  <div className="w-64 space-y-4 hidden md:block">
                    <div className="h-8 w-3/4 bg-zinc-200 rounded-md" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-zinc-200 rounded-md" />
                      <div className="h-4 w-5/6 bg-zinc-200 rounded-md" />
                      <div className="h-4 w-full bg-zinc-200 rounded-md" />
                    </div>
                  </div>
                  {/* Main content area */}
                  <div className="flex-1 bg-white rounded-lg border border-zinc-200 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                      <div>
                        <div className="h-5 w-48 bg-zinc-800 rounded-md mb-2" />
                        <div className="h-4 w-32 bg-zinc-200 rounded-md" />
                      </div>
                      <div className="h-8 w-24 bg-indigo-100 rounded-full" />
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Mock list items */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {98 - i * 5}%
                          </div>
                          <div className="flex-1">
                            <div className="h-4 w-32 bg-zinc-800 rounded-md mb-1.5" />
                            <div className="h-3 w-48 bg-zinc-300 rounded-md" />
                          </div>
                          <div className="h-8 w-20 bg-white border border-zinc-200 rounded-md" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Band */}
      <section className="py-12 border-y border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-zinc-500 tracking-wide uppercase mb-8">
            Trusted by top placement cells and forward-thinking recruiters
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale">
            {/* Realistically styled placeholder logos */}
            <div className="flex items-center gap-2 font-bold text-xl text-zinc-800">
              <div className="w-6 h-6 bg-zinc-800 rounded-sm" /> TechCorp
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-zinc-800">
              <div className="w-6 h-6 rounded-full border-4 border-zinc-800" /> GlobalStaff
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-zinc-800">
              <div className="w-6 h-6 bg-zinc-800 rotate-45" /> Innovate Edu
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-zinc-800">
              <div className="w-6 h-6 border-b-4 border-zinc-800" /> Nexus Hiring
            </div>
            <div className="hidden md:flex items-center gap-2 font-bold text-xl text-zinc-800">
              <div className="w-6 h-6 bg-zinc-800 rounded-tl-lg rounded-br-lg" /> Zenith Inst.
            </div>
          </div>
        </div>
      </section>

      {/* Features Zig-Zag */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 lg:pr-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <FileSearch className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                Explainable matching.<br />No more black boxes.
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Traditional ATS systems reject resumes with no explanation. Merix extracts structured data and provides a clear match score grounded in actual evidence from the resume.
              </p>
              <ul className="space-y-4">
                {[
                  "See exactly which skills matched (required vs preferred)",
                  "Read verbatim evidence extracted from the resume",
                  "Identify missing skills instantly",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              {/* Feature 1 Image Placeholder */}
              <div className="aspect-square md:aspect-[4/3] rounded-2xl bg-zinc-50 border border-zinc-100 shadow-xl shadow-zinc-200/50 p-6 flex flex-col">
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-indigo-700">92%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900">Strong Match</h3>
                    <p className="text-sm text-zinc-500">Meets 4/5 required skills</p>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="p-4 rounded-xl border border-green-200 bg-green-50 shadow-sm">
                    <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Matched: React.js</div>
                    <div className="text-sm text-zinc-700 italic border-l-2 border-green-300 pl-3">"Lead frontend developer building responsive UIs using React.js and Next.js..."</div>
                  </div>
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
                    <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Missing: GraphQL</div>
                    <div className="text-sm text-zinc-700">Candidate has extensive REST API experience, but no explicit mention of GraphQL in their recent roles.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 lg:pl-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                Process 100 resumes in the time it takes to read one.
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Upload your job description and a batch of up to 100 resumes (PDF/DOCX). Merix instantly ranks them by fit, saving you hours of manual screening while improving shortlist quality.
              </p>
              <ul className="space-y-4">
                {[
                  "Ranked shortlists with filterable score thresholds",
                  "Export your final shortlist directly to CSV",
                  "Identify risk signals before the first interview",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full relative">
               {/* Feature 2 Image Placeholder */}
               <div className="aspect-square md:aspect-[4/3] rounded-2xl bg-zinc-900 shadow-2xl p-6 md:p-8 flex flex-col relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-white font-medium text-lg">Batch Processing</h3>
                  <div className="text-xs font-medium text-indigo-300 bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-500/30">
                    Done in 9.4s
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  {[95, 88, 82, 74].map((score, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                      <div className="text-indigo-400 font-bold w-12 text-lg">{score}%</div>
                      <div className="h-2.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${score}%` }} />
                      </div>
                      <div className="text-zinc-400 text-xs hidden sm:block">Match</div>
                    </div>
                  ))}
                </div>
               </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 lg:pr-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                DPDP-compliant data handling, built right in.
              </h2>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Protect yourself from compliance risks. Merix handles Indian data protection requirements automatically, so you can focus on finding the right talent.
              </p>
              <ul className="space-y-4">
                {[
                  "Consent workflows and audit trails",
                  "Auto-deletion or anonymization after 90 days",
                  "PII scrubbing before data reaches LLM providers",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full relative">
               {/* Feature 3 Image Placeholder */}
               <div className="aspect-square md:aspect-[4/3] rounded-2xl bg-zinc-50 border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 flex flex-col justify-center items-center text-center">
                 <ShieldCheck className="w-24 h-24 text-indigo-200 mb-8" />
                 <h3 className="text-2xl font-bold text-zinc-900 mb-3">Automated Compliance</h3>
                 <p className="text-zinc-500 mb-8 max-w-sm leading-relaxed">PII is automatically redacted before processing. Resumes are queued for deletion after 90 days.</p>
                 <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-100 px-5 py-2.5 rounded-full border border-emerald-200">
                   <CheckCircle2 className="w-4 h-4" /> System is DPDP Compliant
                 </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* ROI / Metrics Section */}
      <section id="roi" className="py-24 bg-zinc-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Real ROI for Hiring Managers</h2>
            <p className="text-xl text-zinc-400">Stop wasting time manually screening poor-fit candidates. Let Merix handle the heavy lifting while you focus on interviewing the top 10%.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm text-center">
              <div className="text-5xl md:text-6xl font-extrabold text-indigo-400 mb-4 tracking-tighter">~4 hrs</div>
              <div className="text-xl font-medium text-white mb-3">Saved per batch</div>
              <p className="text-zinc-400 text-sm leading-relaxed">Reduce screening time for 100 resumes from 4 hours to just 10 minutes.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm text-center">
              <div className="text-5xl md:text-6xl font-extrabold text-indigo-400 mb-4 tracking-tighter">&gt;95%</div>
              <div className="text-xl font-medium text-white mb-3">Parse Success</div>
              <p className="text-zinc-400 text-sm leading-relaxed">Our advanced extraction handles complex formatting, columns, and custom layouts effortlessly.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm text-center">
              <div className="text-5xl md:text-6xl font-extrabold text-indigo-400 mb-4 tracking-tighter">100%</div>
              <div className="text-xl font-medium text-white mb-3">Auditable Scores</div>
              <p className="text-zinc-400 text-sm leading-relaxed">Every match score includes the exact evidence used, so recruiters rarely need to override.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-indigo-50 rounded-full blur-3xl -z-10 opacity-70" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-zinc-900 mb-6 leading-tight tracking-tight">
            Ready to upgrade your screening process?
          </h2>
          <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the forward-thinking placement cells and staffing agencies using Merix to find the best talent faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-sm">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Merix
          </div>
          <div className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Merix. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <Link href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
