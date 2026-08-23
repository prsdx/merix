"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { setToken } from "@/lib/api";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { MerixLogo } from "@/components/merix-logo";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Authenticating with Google...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        // 1. Check hash fragment for access_token (#access_token=...&refresh_token=...)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        let accessToken = hashParams.get("access_token");

        // 2. Check query params (?access_token=...)
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get("access_token");
          const errorDesc = searchParams.get("error_description") || searchParams.get("error");
          if (errorDesc) {
            throw new Error(errorDesc);
          }
        }

        if (!accessToken) {
          throw new Error("No authentication token received from Google provider.");
        }

        setStatus("Securing organization session...");
        setToken(accessToken);
        await refreshUser();
        setStatus("Redirecting to your workspace...");
        router.push("/dashboard");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Authentication failed";
        setError(msg);
      }
    };

    handleAuth();
  }, [refreshUser, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-[#0A0E1A] text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="flex justify-center">
          <MerixLogo size={42} showText={true} />
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Authentication Failed
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                {error}
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Google Authentication
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {status}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400">
          India DPDP Act (2023) Protected
        </div>
      </div>
    </div>
  );
}
