"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, PlusCircle, Settings, LogOut, Building2 } from "lucide-react";
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
    { href: "/dashboard", label: "Jobs", icon: Briefcase },
    { href: "/jobs/new", label: "Post Job", icon: PlusCircle },
    { href: "/settings", label: "Compliance", icon: Settings },
  ];

  return (
    <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 mb-8">
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl glass-panel backdrop-blur-2xl transition-all">
        {/* Brand */}
        <div className="flex items-center gap-5">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            {/* Merix logomark: M letterform with gradient */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white dark:text-[#0B0F17] font-display font-bold text-sm shadow-md group-hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
              }}
            >
              M
            </div>
            <span className="font-display text-lg tracking-tight font-semibold text-slate-900 dark:text-slate-100">
              Merix
            </span>
          </Link>

          {user && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="font-medium">{user.org_name || "Organisation"}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <DPDPBadge variant="pill" className="hidden lg:inline-flex" />
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400 max-w-[140px] truncate font-mono">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
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
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-95 hover:shadow-md active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
