"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, PlusCircle, Settings, LogOut, Building2, ArrowRight } from "lucide-react";
import { DPDPBadge } from "./dpdp-badge";
import { ThemeToggle } from "./theme-toggle";
import { MerixLogo } from "./merix-logo";

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
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-hairline)] shadow-xs transition-all">
        {/* Brand with Bespoke Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center group cursor-pointer"
          >
            <MerixLogo size={32} showText={true} />
          </Link>

          {user && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
              <Building2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
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
                      ? "bg-[var(--brand-soft)] text-[var(--brand-primary)] border border-[var(--brand-border)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--text-secondary)]">
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
              How It Works
            </a>
            <a href="/login" className="hover:text-[var(--text-primary)] transition-colors">
              Features
            </a>
            <a href="/signup" className="hover:text-[var(--text-primary)] transition-colors">
              DPDP Compliance
            </a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <DPDPBadge variant="pill" className="hidden lg:inline-flex" />
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline-block text-xs text-[var(--text-muted)] max-w-[130px] truncate font-mono">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-danger)] hover:bg-[var(--accent-danger-soft)] transition-all cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] shadow-xs transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
