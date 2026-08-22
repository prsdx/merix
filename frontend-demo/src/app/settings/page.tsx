"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Organisation, AuditEvent } from "@/lib/types";
import { AppNavbar } from "@/components/app-navbar";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  Settings,
  Building2,
  ShieldCheck,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Activity,
  Calendar,
  Lock,
  Layers,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [org, setOrg] = useState<Organisation | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [loading, setLoading] = useState(true);
  const [savingRetention, setSavingRetention] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadSettings();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgData, logsData] = await Promise.all([
        api.getMyOrg(),
        api.listAuditLogs(50),
      ]);
      setOrg(orgData);
      setRetentionDays(orgData.retention_days || 90);
      setAuditLogs(logsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load organisation settings";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRetention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retentionDays < 1 || retentionDays > 3650) {
      setError("Retention period must be between 1 and 3650 days.");
      return;
    }

    setSavingRetention(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await api.updateMyOrg(retentionDays);
      setOrg(updated);
      setSuccessMessage(`Retention policy updated to ${updated.retention_days} days.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update retention policy";
      setError(msg);
    } finally {
      setSavingRetention(false);
    }
  };

  if (loading && !org) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-3" />
        <span className="text-xs text-zinc-400 font-mono">Loading Organisation & DPDP Settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AppNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-violet-400 font-medium">Compliance & Organisation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-violet-400" />
              <span>Organisation & DPDP Compliance</span>
            </h1>
          </div>
          <DPDPBadge variant="subtle" />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Org Profile & Retention Policy Form */}
          <div className="lg:col-span-5 space-y-6">
            {/* Org Profile Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <Building2 className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Organisation Profile</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Organisation Name</span>
                  <span className="font-semibold text-white">{org?.name || user?.org_name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Administrator Email</span>
                  <span className="font-mono text-zinc-300">{user?.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Tenant Organization ID</span>
                  <span className="font-mono text-[11px] text-zinc-400 break-all">{org?.id || user?.org_id}</span>
                </div>
              </div>
            </div>

            {/* DPDP Retention Policy Form */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/15 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  DPDP Data Retention Policy
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Under the India DPDP Act 2023, candidate data must be automatically erased once the recruitment drive purpose expires. Merix defaults to 90 days.
              </p>

              <form onSubmit={handleUpdateRetention} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Data Retention Limit (Days)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(Number(e.target.value))}
                      required
                      className="w-32 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-zinc-400">days before auto-erasure</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingRetention}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md disabled:opacity-50"
                >
                  {savingRetention ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Policy...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Policy</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Future ATS Integrations Placeholder */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">ATS Integrations</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  Coming in v2
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect Merix with external enterprise ATS platforms (Greenhouse, Lever, Workday) for bidirectional candidate synchronization.
              </p>
            </div>
          </div>

          {/* Right Column: Live DPDP Audit Trail */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">Immutable DPDP Audit Trail</h3>
                </div>
                <span className="text-xs text-zinc-500 font-mono">Real-time DB Events</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Every consent timestamp, candidate ingestion, batch evaluation, and erasure action is immutably appended to your organization&apos;s audit log.
              </p>

              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500 font-mono">
                  No audit events recorded yet. Uploading resumes will generate consent audit entries.
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-400 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{log.event_type}</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                        <span>Actor: <strong className="text-zinc-300 capitalize">{log.actor_type}</strong></span>
                        {log.resume_id && (
                          <span>Resume: <strong className="text-zinc-300 font-mono">{log.resume_id.substring(0, 8)}...</strong></span>
                        )}
                      </div>

                      {log.event_metadata && Object.keys(log.event_metadata).length > 0 && (
                        <div className="text-[10px] font-mono text-zinc-500 bg-white/[0.02] p-2 rounded border border-white/5 truncate">
                          {JSON.stringify(log.event_metadata)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
