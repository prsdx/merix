import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
        /* Theme-aware primary background & text */
        background: "var(--background)",
        foreground: {
          DEFAULT: "var(--foreground)",
          muted: "var(--foreground-muted)",
        },
        /* Surface cards */
        surface: {
          DEFAULT: "var(--color-surface)",
          hover: "var(--color-surface-hover)",
          solid: "var(--color-surface-solid)",
          border: "var(--color-border)",
          "border-strong": "var(--color-border-strong)",
        },
        /* Ink palette (slate scale) */
        ink: {
          DEFAULT: "#0F172A",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#0B0F17",
        },
        /* Parchment text tokens */
        parchment: {
          DEFAULT: "var(--foreground)",
          dim: "var(--foreground-muted)",
          muted: "var(--foreground-muted)",
        },
        /* Data / teal-cyan */
        data: {
          DEFAULT: "var(--color-data)",
          dim: "var(--color-data-dim)",
          faint: "var(--color-data-faint)",
        },
        /* Compliance / emerald */
        compliance: {
          DEFAULT: "var(--color-compliance)",
          dim: "var(--color-compliance-dim)",
          faint: "var(--color-compliance-faint)",
        },
        /* Score spectrum */
        score: {
          high: "var(--color-score-high)",
          mid: "var(--color-score-mid)",
          low: "var(--color-score-low)",
        },
        /* Interactive accent */
        iris: {
          DEFAULT: "var(--color-interactive)",
          dim: "var(--color-interactive-dim)",
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
      boxShadow: {
        "glow-teal": "0 0 20px rgba(0,212,170,0.2), 0 0 60px rgba(0,212,170,0.08)",
        "glow-emerald": "0 0 20px rgba(34,197,94,0.2), 0 0 60px rgba(34,197,94,0.08)",
        "glass": "var(--panel-shadow)",
        "glass-hover": "var(--panel-shadow-hover)",
      },
    },
  },
  plugins: [],
};
export default config;
