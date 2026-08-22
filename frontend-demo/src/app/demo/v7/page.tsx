"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Database, Shield, Zap, Layers, BarChart, ChevronRight, Activity, Command } from "lucide-react";
import { useRef } from "react";

const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505] pointer-events-none">
      {/* Dynamic colorful glowing orbs */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] bg-violet-600/30 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 100, -60, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] right-[10%] w-[45vw] h-[45vw] bg-blue-600/20 rounded-full blur-[120px]"
      />
       <motion.div
        animate={{
          x: [0, 60, -80, 0],
          y: [0, 120, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] left-[35%] w-[50vw] h-[50vw] bg-fuchsia-500/20 rounded-full blur-[130px]"
      />
      
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  );
};

const NavBar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
    >
      <div className="flex items-center justify-between px-6 py-3 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
        <div className="flex items-center gap-2 text-white font-medium tracking-tight">
          <Command className="w-5 h-5 text-violet-400" />
          <span>Merix</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Platform</a>
          <a href="#" className="hover:text-white transition-colors">Solutions</a>
          <a href="#" className="hover:text-white transition-colors">Resources</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Log in
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all flex items-center gap-2">
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: any, title: string, description: string, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className="group relative p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 backdrop-blur-3xl overflow-hidden transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white/80 group-hover:text-white group-hover:bg-white/10 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-white/50 leading-relaxed font-light">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function MerixLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-violet-500/30">
      <LiquidBackground />
      <NavBar />

      <main className="relative z-10" ref={containerRef}>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
          <motion.div 
            style={{ y, opacity }}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-sm font-medium text-white/80 mb-8 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Introducing Merix 7.0 — The new standard.</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter mb-8 leading-[1.1]"
            >
              Intelligence,<br />
              <span className="italic font-light">crystallized.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
            >
              A premium data platform designed for teams that demand flawless execution, unbounded scale, and pristine aesthetics.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button className="h-14 px-8 rounded-full bg-white text-black font-medium text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                Start Building
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="h-14 px-8 rounded-full bg-white/[0.05] border border-white/10 text-white font-medium text-lg hover:bg-white/[0.1] backdrop-blur-xl transition-colors flex items-center gap-2">
                View Documentation
              </button>
            </motion.div>
          </motion.div>

          {/* Abstract Glass Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-[21/9] rounded-t-[40px] bg-white/[0.02] border-t border-l border-r border-white/10 backdrop-blur-3xl shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.5)] p-6"
          >
            <div className="w-full h-full rounded-[24px] border border-white/5 bg-black/40 overflow-hidden relative">
              <div className="absolute top-4 left-4 right-4 h-12 border-b border-white/5 flex items-center gap-2 px-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div className="absolute top-20 left-4 bottom-4 w-64 border-r border-white/5 pr-4 flex flex-col gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-8 rounded-lg ${i === 1 ? 'bg-white/10' : 'bg-white/5'} w-full`} />
                ))}
              </div>
              <div className="absolute top-20 left-72 right-4 bottom-4 flex flex-col gap-4">
                 <div className="h-32 rounded-2xl bg-white/5 w-full flex items-end p-4 gap-2">
                    {[40, 70, 30, 90, 50, 80, 20, 60].map((h, i) => (
                      <div key={i} className="w-full bg-violet-500/30 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                 </div>
                 <div className="flex gap-4 h-full">
                    <div className="flex-1 rounded-2xl bg-white/5" />
                    <div className="flex-1 rounded-2xl bg-white/5" />
                 </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-40 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
              >
                Engineered for perfection
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-xl text-white/50 max-w-2xl mx-auto font-light"
              >
                Every pixel, every interaction, meticulously crafted to provide an unparalleled experience.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={Database}
                title="Unified Architecture"
                description="Connect all your data sources instantly. Our intelligent routing layer handles the complexity, leaving you with pristine, queryable data."
                delay={0}
              />
              <FeatureCard 
                icon={Zap}
                title="Sub-millisecond Latency"
                description="Built on a custom edge network. Your queries execute faster than a screen refresh, providing a truly fluid analytical experience."
                delay={0.1}
              />
              <FeatureCard 
                icon={Shield}
                title="Enterprise Grade"
                description="Military-grade encryption at rest and in transit. Granular RBAC controls give you absolute power over who sees what."
                delay={0.2}
              />
              <FeatureCard 
                icon={Layers}
                title="Infinite Scalability"
                description="From a thousand rows to a petabyte. The platform automatically shards and scales to meet your exact demands in real-time."
                delay={0.3}
              />
              <FeatureCard 
                icon={Activity}
                title="Real-time Telemetry"
                description="Monitor your systems with breathtaking clarity. Custom dashboards update with zero delay for absolute situational awareness."
                delay={0.4}
              />
              <FeatureCard 
                icon={BarChart}
                title="Predictive Analytics"
                description="Leverage proprietary models to foresee trends before they happen. Your data, supercharged with tomorrow's intelligence."
                delay={0.5}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 to-transparent pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto relative z-10"
          >
            <div className="p-1 rounded-[40px] bg-gradient-to-b from-white/10 to-transparent">
              <div className="px-8 py-24 md:py-32 rounded-[36px] bg-black/50 backdrop-blur-2xl border border-white/5 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                  Ready to transcend?
                </h2>
                <p className="text-xl text-white/50 max-w-xl mx-auto mb-10 font-light">
                  Join the elite teams building the future with Merix. Start for free, upgrade when you need to.
                </p>
                <button className="h-14 px-10 rounded-full bg-white text-black font-medium text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                  Get Started Now
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Minimal Footer */}
        <footer className="border-t border-white/10 bg-black py-12 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white/70 font-medium">
              <Command className="w-5 h-5 text-violet-400" />
              <span>Merix Inc.</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
