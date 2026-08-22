import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LiquidBackground } from "@/components/liquid-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Merix — AI Resume-to-JD Matching Platform",
  description: "Explainable, DPDP-compliant resume matching for Indian recruiters and placement teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased bg-[#050505] text-zinc-100 min-h-screen relative selection:bg-violet-600/40 selection:text-violet-100">
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
