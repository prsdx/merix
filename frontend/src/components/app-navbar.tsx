"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, PlusCircle, Settings, LogOut, Building2, ArrowRight } from "lucide-react";
import { DPDPBadge } from "./dpdp-badge";
import { ThemeToggle } from "./theme-toggle";

export function AppNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Pipeline", icon: Briefcase },
    { href: "/jobs/new", label: "Post JD", icon: PlusCircle },
    { href: "/settings", label: "Compliance & DPDP", icon: Settings },
  ];

  return (
    <header className="sticky top-3 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 mb-6">
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            {/* Merix Cobalt Blue Brand Mark */}
            <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-sans font-bold text-base shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="font-sans text-lg tracking-tight font-bold text-slate-900 dark:text-white">
              Merix
            </span>
          </Link>

          {user && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold">{user.org_name || "Organisation"}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/40"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How it works
            </a>
            <a href="#simulator" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Live Sandbox
            </a>
            <a href="#comparison" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              ATS Comparison
            </a>
            <a href="#calculator" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              ROI Calculator
            </a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <DPDPBadge variant="pill" className="hidden lg:inline-flex" />
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400 max-w-[130px] truncate font-mono">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
