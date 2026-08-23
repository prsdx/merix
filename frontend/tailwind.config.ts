import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ['"DM Serif Display"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      colors: {
        /* Primary background */
        ink: {
          DEFAULT: "#070709",
          50: "#0E0E12",
          100: "#12121A",
          200: "#1A1A24",
          300: "#222230",
        },
        /* Text */
        parchment: {
          DEFAULT: "#E8E6E1",
          dim: "#A8A5A0",
          muted: "#6B6965",
        },
        /* Data / teal-cyan */
        data: {
          DEFAULT: "#00D4AA",
          dim: "rgba(0,212,170,0.12)",
          faint: "rgba(0,212,170,0.05)",
        },
        /* Compliance / emerald */
        compliance: {
          DEFAULT: "#22C55E",
          dim: "rgba(34,197,94,0.12)",
          faint: "rgba(34,197,94,0.05)",
        },
        /* Score spectrum */
        score: {
          high: "#22C55E",
          mid: "#F59E0B",
          low: "#F97316",
        },
        /* Interactive accent */
        iris: {
          DEFAULT: "#818CF8",
          dim: "rgba(129,140,248,0.15)",
        },
      },
      animation: {
        "score-fill": "score-fill 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "reveal-up": "reveal-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "score-fill": {
          from: { width: "0%" },
          to: { width: "var(--score-width)" },
        },
        "reveal-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "ink-gradient": "linear-gradient(135deg, #070709 0%, #0D0D14 50%, #070709 100%)",
        "data-gradient": "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
        "score-gradient": "linear-gradient(90deg, #F59E0B 0%, #22C55E 100%)",
      },
      boxShadow: {
        "glow-teal": "0 0 20px rgba(0,212,170,0.2), 0 0 60px rgba(0,212,170,0.08)",
        "glow-emerald": "0 0 20px rgba(34,197,94,0.2), 0 0 60px rgba(34,197,94,0.08)",
        "glass": "0 8px 32px 0 rgba(0,0,0,0.55), inset 0 1px 0 0 rgba(255,255,255,0.10)",
        "glass-hover": "0 16px 48px 0 rgba(0,0,0,0.65), inset 0 1px 0 0 rgba(255,255,255,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
