"use client";

import { motion } from "framer-motion";

export function LiquidBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505] pointer-events-none">
      {/* Dynamic colorful glowing orbs (v7 Apple Liquid Glass aesthetic) */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[8%] left-[12%] w-[45vw] h-[45vw] bg-violet-600/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 70, -40, 0],
          scale: [1, 1.15, 0.85, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[35%] right-[8%] w-[40vw] h-[40vw] bg-indigo-600/18 rounded-full blur-[130px]"
      />
      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, 80, -30, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] left-[30%] w-[50vw] h-[50vw] bg-blue-600/15 rounded-full blur-[140px]"
      />
      
      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }} 
      />
    </div>
  );
}
