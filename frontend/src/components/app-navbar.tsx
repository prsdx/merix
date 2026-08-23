"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, PlusCircle, Settings, LogOut, Building2 } from "lucide-react";
import { DPDPBadge } from "./dpdp-badge";

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
      <div
        className="flex items-center justify-between px-5 py-3 rounded-2xl backdrop-blur-2xl"
        style={{
          background: "rgba(7,7,9,0.82)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-5">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            {/* Merix logomark: M letterform in teal-cyan */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#070709] font-display font-bold text-sm shadow-lg group-hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
              }}
            >
              M
            </div>
            <span className="font-display text-base tracking-tight text-[#E8E6E1]">
              Merix
            </span>
          </Link>

          {user && (
            <div
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#A8A5A0",
              }}
            >
              <Building2 className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span className="font-medium text-[#E8E6E1]">{user.org_name || "Organisation"}</span>
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
                      ? "text-[#E8E6E1]"
                      : "text-[#6B6965] hover:text-[#E8E6E1]"
                  }`}
                  style={
                    active
                      ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }
                      : { border: "1px solid transparent" }
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <DPDPBadge variant="pill" className="hidden lg:inline-flex" />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs text-[#6B6965] max-w-[150px] truncate font-mono">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  color: "#6B6965",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#F87171";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#6B6965";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                }}
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
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: "#A8A5A0" }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#070709] transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
                  boxShadow: "0 4px 16px rgba(0,212,170,0.25)",
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
