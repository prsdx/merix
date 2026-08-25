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
      <head>
        {/* Apply the persisted theme before first paint — without this, a
            dark-mode user sees a white flash on every load because the
            ThemeProvider only restores the preference after hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("merix_theme");if(t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");document.documentElement.setAttribute("data-theme","dark")}else{document.documentElement.classList.add("light");document.documentElement.setAttribute("data-theme","light")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[var(--bg-canvas)] text-[var(--text-primary)] min-h-screen relative selection:bg-[var(--accent-evidence)]/20 selection:text-[var(--text-primary)] dark:selection:bg-[var(--accent-evidence)]/30 dark:selection:text-[var(--text-primary)] transition-colors duration-200">
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
