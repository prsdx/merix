import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fontsource/dm-serif-display";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LiquidBackground } from "@/components/liquid-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Merix — AI Resume-to-JD Matching for Indian Recruiters",
  description: "Explainable, DPDP-compliant batch resume screening for campus placement cells, staffing agencies, and enterprise hiring teams across India.",
  keywords: "resume screening, ATS alternative, DPDP compliant, campus placement, batch matching, AI hiring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased bg-[#070709] text-[#E8E6E1] min-h-screen relative selection:bg-teal-600/30 selection:text-teal-100">
        <AuthProvider>
          <LiquidBackground />
          <div className="relative z-10 min-h-screen flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
