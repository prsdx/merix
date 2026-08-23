"use client";

import React from "react";
import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/** Canonical text input — matches the dashboard search-field styling. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)]",
        "text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
        "focus:outline-none focus:border-[var(--brand-primary)] transition-colors",
        "px-4 py-2",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Label({
  className,
  children,
  htmlFor,
}: {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-[11px] font-semibold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-1.5",
        className
      )}
    >
      {children}
    </label>
  );
}
