"use client";

import React from "react";

interface MerixLogoProps {
  className?: string;
  size?: number; // Size of icon in px
  showText?: boolean;
  textColor?: string;
  badgeText?: string;
}

/**
 * MerixLogo — Bespoke modern geometric brandmark for Merix.
 * Features an interlocking geometric "M" formed by two dynamic gradient facets
 * and interconnected semantic match nodes (inspired by Graphify & Truffle).
 */
export function MerixLogo({
  className = "",
  size = 32,
  showText = true,
  textColor,
  badgeText,
}: MerixLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="merix-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="merix-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="merix-grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="merix-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer squircle container */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="currentColor"
          className="text-slate-900 dark:text-white"
        />

        {/* Left vertical pillar */}
        <path
          d="M12 36V16C12 14.8954 12.8954 14 14 14H15.5C16.3284 14 17.0784 14.5028 17.382 15.2618L24 31.8066L30.618 15.2618C30.9216 14.5028 31.6716 14 32.5 14H34C35.1046 14 36 14.8954 36 16V36"
          stroke="url(#merix-grad-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white dark:text-slate-900"
        />

        {/* Center vertex connection node */}
        <circle cx="24" cy="32" r="3" fill="#10B981" />
        <circle cx="14" cy="16" r="2.5" fill="#3B82F6" />
        <circle cx="34" cy="16" r="2.5" fill="#10B981" />
      </svg>

      {/* Wordmark Typography */}
      {showText && (
        <div className="flex items-baseline gap-2">
          <span
            className={`font-sans text-xl font-bold tracking-tight ${
              textColor || "text-slate-900 dark:text-white"
            }`}
          >
            Merix
          </span>
          {badgeText && (
            <span className="text-xs font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
