import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LiquidBackground } from "@/components/liquid-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Merix — AI Resume-to-JD Matching for Indian Recruiters",
  description:
    "Explainable, DPDP-compliant batch resume screening for campus placement cells, staffing agencies, and enterprise hiring teams across India.",
  keywords:
    "resume screening, ATS alternative, DPDP compliant, campus placement, batch matching, AI hiring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[var(--bg-canvas)] text-[var(--text-primary)] min-h-screen relative selection:bg-teal-500/20 selection:text-teal-900 dark:selection:bg-teal-500/30 dark:selection:text-teal-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <LiquidBackground />
            <div className="relative z-10 min-h-screen flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
