"use client";

import useSWR from "swr";
import { useState } from "react";

interface SyncLog {
  id: string;
  competition_id: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "error";
  matches_updated: number;
  error_message: string | null;
  triggered_by: "cron" | "manual";
  competitions: {
    name: string;
    api_competition_code: string;
  } | null;
}

interface CompetitionHealth {
  competition_id: string;
  competition_name: string;
  api_competition_code: string;
  competition_status: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  matches_updated: number;
  success_rate: number;
}

interface SystemLogsResponse {
  logs: SyncLog[];
  total: number;
  page: number;
  limit: number;
  active_syncs: number;
  sync_failures_24h: number;
  competition_health: CompetitionHealth[];
}

const LIMIT = 10;
const BAR_HEIGHTS = ["40%", "60%", "30%", "80%", "50%", "90%", "40%"];

function fetcher(url: string) {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

function StatusCell({ status }: { status: SyncLog["status"] }) {
  if (status === "success") return <span className="text-primary font-bold">SUCCESS</span>;
  if (status === "running") return <span className="text-secondary font-bold">RETRYING</span>;
  return <span className="text-error font-bold">FLAGGED</span>;
}

function HealthBadge({ status, successRate }: { status: string | null; successRate: number }) {
  if (status === "error" || successRate < 90) {
    return (
      <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase">
        Degraded
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
        Syncing
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
      Healthy
    </span>
  );
}

export default function AdminSystemPage() {
  const [page, setPage] = useState(1);

  const url = `/api/admin/system/logs?page=${page}&limit=${LIMIT}`;

  const { data, error, isLoading, mutate } = useSWR<SystemLogsResponse>(url, fetcher, {
    refreshInterval: 30_000,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const activeSyncs = data?.active_syncs ?? 0;
  const syncFailures = data?.sync_failures_24h ?? 0;
  const competitionHealth = data?.competition_health ?? [];
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const allHealthy = competitionHealth.length > 0 && competitionHealth.every(
    (c) => c.last_sync_status !== "error" && c.success_rate >= 90
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-bebas text-5xl text-white tracking-tight uppercase">
            System Monitoring
          </h1>
          <p className="text-gray-400 text-sm mt-2">API Health &amp; Competition Sync Logs</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
            <span
              className={`w-2 h-2 rounded-full ${
                allHealthy || competitionHealth.length === 0 ? "bg-primary animate-pulse" : "bg-secondary animate-pulse"
              }`}
            />
            {allHealthy || competitionHealth.length === 0 ? "All Systems Operational" : "Degraded Performance"}
          </span>
          <button
            onClick={() => mutate()}
            className="bg-surface-container-high text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg border border-white/5 hover:bg-surface-container-highest transition-colors"
          >
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* API Response — 2 cols */}
        <div className="col-span-1 md:col-span-2 bg-surface-container-low rounded-xl p-6 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              Global API Response
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-bebas text-6xl text-white">—</span>
              <span className="text-primary font-bebas text-2xl">ms</span>
            </div>
            <div className="mt-4 h-12 flex items-end gap-1">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm ${i === 5 ? "bg-primary" : "bg-primary/20"}`}
                  style={{ height: h }}
                />
              ))}
            </div>
          </div>
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>
              speed
            </span>
          </div>
        </div>

        {/* Active Syncs */}
        <div className="bg-surface-container-low rounded-xl p-6 border-l-2 border-primary">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Active Syncs
          </span>
          <div className="mt-4">
            <span className="font-bebas text-6xl text-white">
              {String(activeSyncs).padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Competitions tracking</p>
        </div>

        {/* Sync Failures */}
        <div className="bg-surface-container-low rounded-xl p-6 border-l-2 border-secondary">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Sync Failures
          </span>
          <div className="mt-4">
            <span className="font-bebas text-6xl text-white">
              {String(syncFailures).padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
        </div>
      </div>

      {/* Competition Health Grid */}
      <section className="space-y-4">
        <h3 className="font-bebas text-2xl text-white uppercase tracking-wider">Competition Health</h3>
        {competitionHealth.length === 0 && !isLoading ? (
          <p className="text-gray-500 text-sm">No competitions found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface-container-high rounded-xl p-5 border border-white/5 animate-pulse h-36"
                  />
                ))
              : competitionHealth.map((comp) => (
                  <div
                    key={comp.competition_id}
                    className="bg-surface-container-high rounded-xl p-5 border border-white/5 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-white font-bold text-sm">{comp.competition_name}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                          API-END: /competitions/{comp.api_competition_code.toLowerCase()}
                        </p>
                      </div>
                      <HealthBadge
                        status={comp.last_sync_status}
                        successRate={comp.success_rate}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400">Last Sync</span>
                        <span className="text-white">{timeAgo(comp.last_sync_at)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="text-white">{comp.success_rate}%</span>
                      </div>
                      <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${comp.success_rate >= 90 ? "bg-primary" : "bg-secondary"}`}
                          style={{ width: `${comp.success_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </section>

      {/* Logs Table Section */}
      <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
          <h3 className="font-bebas text-xl text-white tracking-widest uppercase">
            Real-time Activity Logs
          </h3>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-white p-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
            <button className="text-gray-400 hover:text-white p-2">
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="px-6 py-8 text-center text-error text-sm">
            Failed to load logs. Please refresh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-lowest text-gray-500 font-bold uppercase tracking-tighter">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">User / Source</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4" colSpan={6}>
                          <div className="h-4 bg-surface-container-high rounded w-full" />
                        </td>
                      </tr>
                    ))
                  : logs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-high transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-mono whitespace-nowrap">
                          {formatTimestamp(log.started_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-surface-container-highest px-2 py-1 rounded uppercase">
                            {log.triggered_by === "cron" ? "CRON" : "API_SYNC"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">
                          {log.competitions?.name ?? log.competition_id}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {log.status === "success"
                            ? `Synced ${log.matches_updated} match${log.matches_updated !== 1 ? "es" : ""} — ${log.competitions?.api_competition_code ?? ""}`
                            : log.status === "running"
                            ? `Sync in progress — ${log.competitions?.api_competition_code ?? ""}`
                            : log.error_message ?? "Sync failed"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusCell status={log.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-500 hover:text-white">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                {!isLoading && logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-gray-500 text-[10px] uppercase">
            Showing {logs.length > 0 ? (page - 1) * LIMIT + 1 : 0}–{Math.min(page * LIMIT, total)} of{" "}
            {total.toLocaleString()} logs
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-surface-container-high rounded text-white text-[10px] disabled:opacity-40 hover:bg-surface-container-highest transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-surface-container-high rounded text-white text-[10px] disabled:opacity-40 hover:bg-surface-container-highest transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
