"use client";

import React from "react";
import { ArrowRight, Zap, Users, Shield, Smile } from "lucide-react";

export default function NeoBrutalistLanding() {
  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-[#FFD93D] selection:text-black overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="border-b-2 border-black bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_0_0_#000]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ff6b6b] border-2 border-black shadow-[2px_2px_0px_0px_#000]" />
          <span className="text-3xl font-black uppercase tracking-tighter">Merix</span>
        </div>
        <div className="hidden md:flex gap-8 font-black uppercase tracking-widest text-sm">
          <a href="#features" className="hover:bg-[#FFD93D] px-3 py-2 transition-colors border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#000]">Features</a>
          <a href="#pricing" className="hover:bg-[#4D96FF] hover:text-white px-3 py-2 transition-colors border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#000]">Pricing</a>
          <a href="#about" className="hover:bg-[#6BCB77] hover:text-white px-3 py-2 transition-colors border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#000]">About</a>
        </div>
        <button className="hidden md:block bg-[#4D96FF] text-white px-8 py-3 font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-8">
          <div className="inline-block bg-[#6BCB77] text-white px-4 py-2 font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000] w-max text-sm transform -rotate-2">
            #1 HR Tool for Cool Companies
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-black">
            Stop pretending you love your HR software.
          </h1>
          <div className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_#000]">
            <p className="text-xl md:text-2xl font-bold leading-relaxed">
              Merix makes people ops suck less. Manage payroll, benefits, and team vibes without the 90s enterprise headache.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            <button className="bg-[#FFD93D] flex items-center gap-3 text-black px-10 py-5 text-xl font-black uppercase tracking-widest border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all group">
              Start for Free <ArrowRight size={28} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white flex items-center gap-2 text-black px-10 py-5 text-xl font-black uppercase tracking-widest border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all">
              Book Demo
            </button>
          </div>
        </div>
        
        <div className="relative w-full max-w-lg mx-auto lg:ml-auto mt-12 lg:mt-0">
          {/* Abstract Hero Image/Graphic */}
          <div className="bg-[#ff6b6b] border-2 border-black aspect-square w-full shadow-[16px_16px_0px_0px_#000] relative flex items-center justify-center p-8">
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-[#FFD93D] border-2 border-black rounded-full shadow-[8px_8px_0px_0px_#000] animate-[bounce_4s_infinite]" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#4D96FF] border-2 border-black shadow-[8px_8px_0px_0px_#000] transform rotate-12" />
            
            <div className="w-full max-w-[340px] bg-white border-2 border-black shadow-[12px_12px_0px_0px_#000] p-8 flex flex-col gap-6 transform rotate-3 hover:rotate-0 transition-transform duration-300 relative z-10">
              <div className="flex justify-between items-center border-b-2 border-black pb-4">
                <span className="font-black text-2xl uppercase tracking-tight">Payroll Run</span>
                <span className="bg-[#6BCB77] px-3 py-1 text-sm font-black border-2 border-black uppercase text-black shadow-[4px_4px_0px_0px_#000] transform -skew-x-6">Success</span>
              </div>
              <div className="space-y-4 py-2">
                <div className="h-6 bg-gray-200 border-2 border-black w-3/4" />
                <div className="h-6 bg-gray-200 border-2 border-black w-1/2" />
                <div className="h-6 bg-gray-200 border-2 border-black w-5/6" />
              </div>
              <button className="mt-4 bg-black text-white py-4 text-lg font-black uppercase tracking-widest hover:bg-[#FFD93D] hover:text-black hover:border-black hover:border-2 transition-colors border-2 border-transparent">
                Approve All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#FFD93D] border-y-2 border-black py-6 overflow-hidden flex whitespace-nowrap mt-20 relative z-10 shadow-[0_8px_0_0_#000]">
        <div className="animate-marquee flex gap-12 font-black uppercase text-3xl md:text-4xl tracking-widest">
          <span>★ NO HIDDEN FEES</span>
          <span>★ 24/7 SUPPORT</span>
          <span>★ ACTUALLY FUN TO USE</span>
          <span>★ BYE BYE SPREADSHEETS</span>
          <span>★ NO HIDDEN FEES</span>
          <span>★ 24/7 SUPPORT</span>
          <span>★ ACTUALLY FUN TO USE</span>
          <span>★ BYE BYE SPREADSHEETS</span>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="px-6 py-40 max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col items-center text-center">
          <div className="bg-white border-2 border-black px-6 py-3 shadow-[8px_8px_0px_0px_#000] transform -rotate-2 mb-10">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              Features that don't put you to sleep.
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "Lightning Payroll",
              desc: "Run payroll in 3 clicks. Not 30. We actually counted them.",
              color: "bg-[#4D96FF]",
              icon: Zap
            },
            {
              title: "Team Directory",
              desc: "Finally, a directory where people actually add their profile pictures.",
              color: "bg-[#ff6b6b]",
              icon: Users
            },
            {
              title: "Bulletproof Compliance",
              desc: "We handle the legal mumbo-jumbo so you can focus on building.",
              color: "bg-[#6BCB77]",
              icon: Shield
            }
          ].map((feat, i) => (
            <div 
              key={i}
              className={`${feat.color} p-10 border-2 border-black shadow-[12px_12px_0px_0px_#000] flex flex-col gap-8 text-black hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_#000] transition-all group`}
            >
              <div className="bg-white w-20 h-20 border-2 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000] group-hover:rotate-12 transition-transform">
                <feat.icon size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-4xl font-black uppercase mt-2 text-white drop-shadow-[2px_2px_0px_#000] leading-[1.1]">{feat.title}</h3>
              <p className="font-bold text-xl leading-relaxed text-black bg-white p-5 border-2 border-black mt-auto shadow-[4px_4px_0px_0px_#000]">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-black text-white px-6 py-40 border-y-2 border-black relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#333 2px, transparent 2px), linear-gradient(90deg, #333 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
        
        <div className="max-w-6xl mx-auto text-center space-y-20 relative z-10">
          <div className="inline-block bg-[#ff6b6b] text-black border-2 border-black px-6 py-2 font-black uppercase text-2xl shadow-[6px_6px_0px_0px_#FFD93D] transform -rotate-3">
            Don't just take our word for it
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase text-[#FFD93D] drop-shadow-[4px_4px_0px_#fff] leading-tight">
            "Merix is the only HR tool that doesn't make me want to quit my job."
          </h2>
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 bg-[#4D96FF] rounded-full border-4 border-black shadow-[8px_8px_0px_0px_#FFD93D] flex items-center justify-center overflow-hidden transform hover:scale-110 transition-transform">
              <Smile size={72} className="text-black" />
            </div>
            <div className="bg-white text-black border-2 border-black p-4 shadow-[6px_6px_0px_0px_#000]">
              <p className="font-black text-3xl uppercase tracking-wide">Sarah Jenkins</p>
              <p className="text-[#ff6b6b] font-black uppercase text-xl tracking-widest mt-1">Head of People, TechCorp</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-48 max-w-6xl mx-auto text-center flex flex-col items-center gap-12">
        <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9]">
          Ready to join <br /><span className="text-[#ff6b6b] drop-shadow-[4px_4px_0px_#000]">the future?</span>
        </h2>
        <div className="bg-white p-8 border-2 border-black shadow-[12px_12px_0px_0px_#000] max-w-3xl transform rotate-1">
          <p className="text-2xl md:text-3xl font-bold">
            Get started for free today. No credit card required. No annoying sales calls unless you specifically ask for one.
          </p>
        </div>
        <button className="bg-[#FFD93D] text-black px-16 py-8 text-3xl font-black uppercase tracking-widest border-2 border-black shadow-[12px_12px_0px_0px_#000] hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[16px_16px_0px_0px_#000] active:translate-x-[12px] active:translate-y-[12px] active:shadow-none transition-all mt-8 group flex items-center gap-4">
          Create Account <ArrowRight size={36} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-black px-6 py-16 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#ff6b6b] border-2 border-black shadow-[4px_4px_0px_0px_#000]" />
            <span className="text-4xl font-black uppercase tracking-tighter">Merix</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 font-black uppercase text-xl tracking-widest">
            <a href="#" className="hover:text-[#4D96FF] hover:underline underline-offset-8 transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#4D96FF] hover:underline underline-offset-8 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[#ff6b6b] hover:underline underline-offset-8 transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#ff6b6b] hover:underline underline-offset-8 transition-colors">Terms</a>
          </div>
          <div className="bg-black text-white px-4 py-2 font-black text-lg uppercase shadow-[4px_4px_0px_0px_#FFD93D]">
            © {new Date().getFullYear()} Merix Inc.
          </div>
        </div>
      </footer>

      {/* Global Styles for marquee animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}} />
    </div>
  );
}
