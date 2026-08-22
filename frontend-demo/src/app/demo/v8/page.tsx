"use client";

import React from "react";
import { motion } from "framer-motion";
import { Playfair_Display, Inter } from "next/font/google";
import { ArrowRight } from "lucide-react";

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"] 
});

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500"] 
});

export default function EditorialLandingPage() {
  return (
    <div className={`min-h-screen bg-[#F7F5F0] text-[#111111] selection:bg-[#222] selection:text-[#F7F5F0] ${inter.className}`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-difference text-[#F7F5F0]">
        <div className={`text-xl font-bold tracking-tighter ${playfair.className}`}>MERIX.</div>
        <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-widest">
          <a href="#vision" className="hover:opacity-60 transition-opacity">Vision</a>
          <a href="#method" className="hover:opacity-60 transition-opacity">Method</a>
          <a href="#access" className="hover:opacity-60 transition-opacity">Access</a>
        </div>
        <button className="text-xs font-medium uppercase tracking-widest border-b border-[#F7F5F0] pb-1 hover:opacity-60 transition-opacity">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-end p-6 md:p-12 lg:p-24 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-5 pointer-events-none">
           <div className="w-[120%] h-[120%] rounded-full border-[1px] border-black absolute -top-1/4 -right-1/4"></div>
           <div className="w-[80%] h-[80%] rounded-full border-[1px] border-black absolute bottom-0 left-0"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 lg:col-start-1"
          >
            <h1 className={`text-6xl md:text-8xl lg:text-[10rem] leading-[0.85] tracking-tight ${playfair.className}`}>
              The New <br />
              <span className="italic font-light text-[#4A4A4A]">Standard</span> <br />
              of Hiring
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="lg:col-span-3 lg:col-start-10 mb-4 md:mb-8"
          >
            <p className="text-sm md:text-base font-light leading-relaxed mb-8">
              Merix redefines talent acquisition. By shifting the paradigm from volume to precision, we empower the vanguard of industry to build enduring teams without the noise.
            </p>
            <button className="group flex items-center gap-3 text-xs uppercase tracking-widest font-medium">
              <span className="border-b border-black pb-1">Request Access</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Thesis Section */}
      <section id="vision" className="py-32 px-6 md:px-12 lg:px-24 bg-[#111111] text-[#F7F5F0]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="order-2 md:order-1 relative h-[60vh] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
            <div className="absolute inset-0 bg-[#222222] flex items-center justify-center">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-[#333333] transform -skew-x-12 absolute left-1/4"></div>
              <div className="w-64 h-64 border border-[#F7F5F0] opacity-20 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 border border-[#F7F5F0] opacity-40 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-12">
            <h2 className={`text-4xl md:text-6xl leading-tight ${playfair.className}`}>
              We stripped away the superficial metrics. <span className="text-[#666]">What remains is pure signal.</span>
            </h2>
            <div className="w-16 h-[1px] bg-[#F7F5F0]"></div>
            <p className="text-lg font-light text-gray-400 leading-relaxed max-w-md">
              The modern enterprise is suffocating under the weight of irrelevant applications. Merix introduces a deterministic approach to candidate matching, relying on verified competencies rather than performative resumes.
            </p>
          </div>
        </div>
      </section>

      {/* Structural Features / Method Section */}
      <section id="method" className="py-32 md:py-48 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 md:mb-40 flex justify-between items-end border-b border-black pb-8">
            <h2 className={`text-4xl md:text-5xl ${playfair.className}`}>The Architecture <br />of Precision</h2>
            <p className="text-xs uppercase tracking-widest hidden md:block">01 &mdash; Methodology</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-24 lg:gap-x-12">
            
            <div className="lg:col-span-5 lg:col-start-1 group cursor-default">
              <div className="text-xs uppercase tracking-widest mb-6 opacity-50">I. Verification</div>
              <h3 className={`text-3xl mb-6 ${playfair.className} group-hover:italic transition-all duration-500`}>Cryptographic Truth</h3>
              <p className="font-light leading-relaxed text-[#444]">
                Resumes are fictions. We rely exclusively on verified proofs of work, cryptographic skill endorsements, and immutable work histories. The noise is eliminated before you even search.
              </p>
            </div>

            <div className="lg:col-span-5 lg:col-start-7 lg:mt-32 group cursor-default">
              <div className="text-xs uppercase tracking-widest mb-6 opacity-50">II. Ontology</div>
              <h3 className={`text-3xl mb-6 ${playfair.className} group-hover:italic transition-all duration-500`}>Deep Semantic Mapping</h3>
              <p className="font-light leading-relaxed text-[#444]">
                Roles are no longer defined by generic titles. Our ontology maps the exact structural requirements of your team's current gap, finding the missing piece with mathematical certainty.
              </p>
            </div>

            <div className="lg:col-span-8 lg:col-start-3 lg:mt-32 group cursor-default text-center">
              <div className="text-xs uppercase tracking-widest mb-6 opacity-50">III. Discretion</div>
              <h3 className={`text-4xl md:text-5xl mb-6 ${playfair.className} group-hover:italic transition-all duration-500`}>The Quiet Network</h3>
              <p className="font-light leading-relaxed text-[#444] max-w-2xl mx-auto">
                The best talent is rarely looking. Merix operates a closed, dark-pool network for elite professionals who only wish to be discovered for exact, career-defining matches.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Quote / Authority Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#EAE7DF] border-y border-[#D5D2C9]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <p className={`text-3xl md:text-5xl leading-snug md:leading-snug ${playfair.className}`}>
            &ldquo;Merix has restored elegance to an industry defined by chaos. It is the only platform we trust with our most critical hires.&rdquo;
          </p>
          <div className="text-sm font-medium tracking-wide uppercase">
            &mdash; Chief Operating Officer, <span className="opacity-60">Fortune 50</span>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer id="access" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#111111] text-[#F7F5F0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-16">
          <div className="max-w-2xl">
            <h2 className={`text-5xl md:text-7xl mb-8 leading-tight ${playfair.className}`}>
              Enter the <br/><span className="italic text-[#888]">Standard.</span>
            </h2>
            <form className="flex flex-col md:flex-row gap-6 mt-12 w-full max-w-lg" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Corporate Email" 
                className="bg-transparent border-b border-[#444] pb-4 px-2 focus:outline-none focus:border-[#F7F5F0] transition-colors w-full font-light text-sm"
              />
              <button type="submit" className="shrink-0 uppercase text-xs tracking-widest font-medium border border-[#444] hover:border-[#F7F5F0] hover:bg-[#F7F5F0] hover:text-[#111] transition-all px-8 py-4">
                Request Access
              </button>
            </form>
          </div>
          
          <div className="grid grid-cols-2 gap-12 text-sm font-light text-[#888]">
            <div className="space-y-4 flex flex-col">
              <span className="text-xs uppercase tracking-widest text-[#F7F5F0] mb-2">Platform</span>
              <a href="#" className="hover:text-[#F7F5F0] transition-colors">Enterprise</a>
              <a href="#" className="hover:text-[#F7F5F0] transition-colors">Vanguard</a>
              <a href="#" className="hover:text-[#F7F5F0] transition-colors">Methodology</a>
            </div>
            <div className="space-y-4 flex flex-col">
              <span className="text-xs uppercase tracking-widest text-[#F7F5F0] mb-2">Corporate</span>
              <a href="#" className="hover:text-[#F7F5F0] transition-colors">About</a>
              <a href="#" className="hover:text-[#F7F5F0] transition-colors">Journal</a>
              <a href="#" className="hover:text-[#F7F5F0] transition-colors">Legal</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-32 pt-8 border-t border-[#333] flex justify-between text-xs font-light text-[#666]">
          <p>&copy; {new Date().getFullYear()} Merix Technologies.</p>
          <p>All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
