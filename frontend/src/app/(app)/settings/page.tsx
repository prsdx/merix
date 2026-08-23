"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Organisation, AuditEvent } from "@/lib/types";
import { DPDPBadge } from "@/components/dpdp-badge";
import {
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Link as LinkIcon,
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
      const msg = err instanceof Error ? err.message : "Failed to load settings";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRetention = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRetention(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await api.updateMyOrg(retentionDays);
      setOrg(updated);
      setSuccessMessage(`Retention policy updated to ${updated.retention_days} days.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update retention policy.";
      setError(msg);
    } finally {
      setSavingRetention(false);
    }
  };

  if (authLoading || (loading && !org)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-evidence)] mb-3" />
        <span className="text-xs text-[var(--text-muted)] font-mono">Loading Compliance Settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--accent-evidence)]  uppercase tracking-wider font-semibold">
                COMPLIANCE &amp; GOVERNANCE
              </span>
              <DPDPBadge variant="row" />
            </div>
            <h1 className="font-display text-3xl font-normal text-[var(--text-primary)]">
              Organisation &amp; DPDP Settings
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Manage retention policies, tenant configuration, and immutable compliance audit trails.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[var(--accent-danger-soft)] border border-[var(--accent-danger-border)] text-[var(--accent-danger)] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[var(--accent-danger)] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-[var(--accent-evidence-soft)] border border-[var(--accent-evidence-border)] text-[var(--accent-evidence)] text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-evidence)] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Org Profile & Retention Policy */}
          <div className="lg:col-span-6 space-y-6">
            {/* Organisation Profile Card */}
            <div className="merix-card p-6 sm:p-7 rounded-3xl border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-hairline)]">
                <Building2 className="w-4 h-4 text-[var(--accent-evidence)]" />
                <h2 className="font-display text-lg font-normal text-[var(--text-primary)]">
                  Organisation Profile
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    ORGANISATION NAME
                  </div>
                  <div className="font-semibold text-sm text-[var(--text-primary)] mt-0.5">
                    {org?.name || user?.org_name}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    ORGANISATION ID
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5 select-all">
                    {org?.id}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    ADMINISTRATOR ACCOUNT
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-primary)] mt-0.5">
                    {user?.email}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-hairline)] dark:border-white/5 flex items-center gap-2 text-[11px] text-[var(--accent-evidence)] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PostgreSQL Row-Level Security Enabled</span>
                </div>
              </div>
            </div>

            {/* DPDP Retention Policy Card */}
            <div className="merix-card p-6 sm:p-7 rounded-3xl border border-[var(--accent-evidence-border)] space-y-5 bg-[var(--accent-evidence-soft)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--accent-evidence)]" />
                  <h2 className="font-display text-lg font-normal text-[var(--text-primary)]">
                    DPDP Retention Policy
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[var(--accent-evidence)] font-semibold">INDIA DPDP ACT 2023</span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Configure the automated data lifecycle for your organization. Candidate resumes and extracted vectors will be automatically purged once their retention window expires.
              </p>

              <form onSubmit={handleSaveRetention} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                    Auto-Deletion Window (Days)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(parseInt(e.target.value) || 90)}
                      required
                      className="w-32 px-4 py-2 rounded-xl bg-[var(--bg-subtle)] dark:bg-black/40 border border-[var(--border-hairline)] text-sm font-mono font-bold text-[var(--accent-evidence)]  focus:border-[var(--accent-evidence)] focus:outline-none"
                    />
                    <span className="text-xs text-[var(--text-muted)] font-mono">Days (Default: 90 Days)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingRetention}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-xs text-white transition-all shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #0D9488 0%, #0284C7 100%)",
                  }}
                >
                  {savingRetention ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Policy...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Update Retention Policy</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ATS Integrations Placeholder */}
            <div className="merix-card p-6 rounded-3xl border border-[var(--border-hairline)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[var(--brand-primary)]" />
                  <h3 className="font-semibold text-xs text-[var(--text-primary)]">ATS &amp; HRMS Integrations</h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--brand-primary)] bg-[var(--brand-soft)] px-2 py-0.5 rounded">
                  v2 Roadmap
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Direct export connectors for Greenhouse, Lever, Ashby, Darwinbox, and Keka are scheduled for v2. Currently, ranked shortlists export to universal CSV spreadsheets.
              </p>
            </div>
          </div>

          {/* Right Column: Immutable Compliance Audit Trail */}
          <div className="lg:col-span-6 space-y-6">
            <div className="merix-card p-6 sm:p-7 rounded-3xl border border-[var(--border-hairline)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent-evidence)]" />
                  <h2 className="font-display text-lg font-normal text-[var(--text-primary)]">
                    Compliance Audit Trail
                  </h2>
                </div>
                <DPDPBadge variant="row" />
              </div>

              <p className="text-xs text-[var(--text-muted)]">
                Immutable, append-only log of all data processing, consent recording, and erasure events for your organization.
              </p>

              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] font-mono space-y-1">
                  <div>No audit events recorded yet.</div>
                  <div className="text-[10px]">Events will appear here as resumes are uploaded and processed.</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {auditLogs.map((log) => {
                    const isDeletion = log.event_type.includes("deletion") || log.event_type.includes("erasure");
                    const isConsent = log.event_type.includes("consent");
                    const isMatch = log.event_type.includes("match") || log.event_type.includes("batch");

                    return (
                      <div
                        key={log.id}
                        className="audit-row text-xs space-y-1 bg-[var(--bg-subtle)] dark:bg-black/40 p-3 rounded-r-xl border-y border-r border-[var(--border-hairline)] dark:border-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="font-mono font-bold text-[11px]"
                            style={{
                              color: isDeletion ? "#DC2626" : isConsent ? "#16A34A" : isMatch ? "#0D9488" : "inherit",
                            }}
                          >
                            {log.event_type.toUpperCase()}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          Actor: {log.actor_type} {log.actor_user_id ? `(${log.actor_user_id.slice(0, 8)})` : ""}
                        </div>

                        {log.event_metadata && Object.keys(log.event_metadata).length > 0 && (
                          <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate">
                            {JSON.stringify(log.event_metadata)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
