"use client";

import React from "react";
import { AppNavbar } from "@/components/app-navbar";

/**
 * Authenticated app shell. Provides the navbar and page canvas exactly once
 * for every screen inside the (app) route group. Screens render only their
 * own <main> content.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      <AppNavbar />
      {children}
    </div>
  );
}
