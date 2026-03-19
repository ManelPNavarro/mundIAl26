"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Calculator } from "lucide-react";

interface TournamentStats {
  totalParticipants: number;
  completions: number;
  matchesSynced: number;
  totalMatches: number;
}

interface SyncStatus {
  lastSyncAt: string | null;
  nextScheduledIn: string;
  operational: boolean;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d
    .toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .toUpperCase();
}

function progressWidth(value: number, total: number): string {
  if (!total) return "0%";
  return `${Math.min(100, Math.round((value / total) * 100))}%`;
}

export default function AdminTournamentPage() {
  const [deadline, setDeadline] = useState({ date: "2026-06-11", time: "18:00" });
  const [savingDeadline, setSavingDeadline] = useState(false);
  const [deadlineSaved, setDeadlineSaved] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; updated: number } | null>(null);
  const [syncError, setSyncError] = useState("");

  const [recalculating, setRecalculating] = useState(false);
  const [recalcResult, setRecalcResult] = useState<{ recalculated: number; durationMs: number } | null>(null);
  const [recalcError, setRecalcError] = useState("");

  const [stats, setStats] = useState<TournamentStats>({
    totalParticipants: 0,
    completions: 0,
    matchesSynced: 0,
    totalMatches: 64,
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncAt: null,
    nextScheduledIn: "15 min",
    operational: true,
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tournament-stats");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats ?? stats);
      setSyncStatus(data.syncStatus ?? syncStatus);
      if (data.deadline) {
        const dt = new Date(data.deadline);
        setDeadline({
          date: dt.toISOString().split("T")[0],
          time: dt.toISOString().split("T")[1].substring(0, 5),
        });
      }
    } catch {
      // Silently fail — stats are non-critical
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleSaveDeadline() {
    setSavingDeadline(true);
    setDeadlineSaved(false);
    try {
      const isoDeadline = `${deadline.date}T${deadline.time}:00.000Z`;
      await fetch("/api/admin/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: isoDeadline }),
      });
      setDeadlineSaved(true);
      setTimeout(() => setDeadlineSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDeadline(false);
    }
  }

  async function handleSyncNow() {
    setSyncing(true);
    setSyncResult(null);
    setSyncError("");
    try {
      const res = await fetch("/api/sync-results", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? "admin-manual"}`,
        },
      });
      if (!res.ok) throw new Error("Error al sincronizar");
      const data = await res.json();
      setSyncResult(data);
      fetchStats();
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : "Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  }

  async function handleRecalculate() {
    setRecalculating(true);
    setRecalcResult(null);
    setRecalcError("");
    try {
      const res = await fetch("/api/recalculate-scores", { method: "POST" });
      if (!res.ok) throw new Error("Error al recalcular");
      const data = await res.json();
      setRecalcResult(data);
    } catch (err: unknown) {
      setRecalcError(err instanceof Error ? err.message : "Error al recalcular");
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-6xl md:text-8xl text-white tracking-tight leading-none mb-4">
          Tournament
          <br />
          <span className="text-green-primary">Configuration</span>
        </h1>
        <div className="h-1 w-24 bg-green-primary" />
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Registration Deadline */}
          <section className="bg-dark-card p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-primary" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-3xl text-white mb-1">Registration Deadline</h2>
                <p className="text-gray-muted text-sm font-medium">
                  ¿Cuándo dejan de aceptarse quinielas?
                </p>
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-green-primary mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={deadline.date}
                    onChange={(e) => setDeadline((d) => ({ ...d, date: e.target.value }))}
                    className="bg-[#0d0d0d] border-none text-white rounded-lg focus:ring-1 focus:ring-green-primary px-4 py-3 font-mono outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-green-primary mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={deadline.time}
                    onChange={(e) => setDeadline((d) => ({ ...d, time: e.target.value }))}
                    className="bg-[#0d0d0d] border-none text-white rounded-lg focus:ring-1 focus:ring-green-primary px-4 py-3 font-mono outline-none"
                  />
                </div>
                <button
                  onClick={handleSaveDeadline}
                  disabled={savingDeadline}
                  className="bg-green-primary hover:bg-green-dim text-[#003918] font-bold px-6 py-3 rounded-lg transition-all uppercase text-xs tracking-widest disabled:opacity-50"
                >
                  {savingDeadline ? "Guardando..." : deadlineSaved ? "Guardado!" : "Guardar"}
                </button>
              </div>
            </div>
          </section>

          {/* API Sync */}
          <section className="bg-dark-card p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="font-display text-3xl text-white mb-1">API Data Sync</h2>
                <p className="text-gray-muted text-sm font-medium">
                  Estado del feed externo de la API del Mundial 2026
                </p>
              </div>
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="bg-green-primary hover:bg-green-dim text-[#003918] font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Sincronizando..." : "Sync Now"}
              </button>
            </div>

            {syncResult && (
              <div className="mb-6 bg-green-primary/10 border border-green-primary/20 rounded-lg px-4 py-3 text-green-primary text-sm font-medium">
                Sincronizados: {syncResult.synced} | Actualizados: {syncResult.updated}
              </div>
            )}
            {syncError && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {syncError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-gray-muted uppercase tracking-widest block mb-2">
                  Estado actual
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      syncStatus.operational ? "bg-green-primary animate-pulse" : "bg-red-500"
                    }`}
                    style={
                      syncStatus.operational
                        ? { boxShadow: "0 0 10px rgba(0,212,106,0.5)" }
                        : undefined
                    }
                  />
                  <span className="font-display text-2xl text-white">
                    {syncStatus.operational ? "Operational" : "Error"}
                  </span>
                </div>
              </div>
              <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-gray-muted uppercase tracking-widest block mb-2">
                  Última sync
                </span>
                <div className="font-display text-xl text-white tracking-tight">
                  {formatDateTime(syncStatus.lastSyncAt)}
                </div>
              </div>
              <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-gray-muted uppercase tracking-widest block mb-2">
                  Próxima sync
                </span>
                <div className="font-display text-2xl text-white tracking-tight">
                  En {syncStatus.nextScheduledIn}
                </div>
              </div>
            </div>
          </section>

          {/* Recalculate section */}
          <section className="bg-dark-card p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-display text-3xl text-white mb-1">Recalcular Puntuaciones</h2>
                <p className="text-gray-muted text-sm font-medium">
                  Recalcula los puntos de todos los usuarios según los resultados actuales.
                </p>
                {recalcResult && (
                  <p className="text-green-primary text-sm mt-2 font-medium">
                    {recalcResult.recalculated} usuarios procesados en {recalcResult.durationMs}ms
                  </p>
                )}
                {recalcError && (
                  <p className="text-red-400 text-sm mt-2">{recalcError}</p>
                )}
              </div>
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
              >
                <Calculator size={16} />
                {recalculating ? "Recalculando..." : "Recalcular"}
              </button>
            </div>
          </section>
        </div>

        {/* Right column: Stats */}
        <div className="lg:col-span-4">
          <section className="bg-dark-card p-8 rounded-xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h2 className="font-display text-3xl text-white mb-8 border-b border-white/10 pb-4">
              Real-Time Stats
            </h2>
            <div className="space-y-10 flex-grow">
              {/* Total participants */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-muted font-semibold text-xs uppercase tracking-widest">
                    Total Participants
                  </span>
                  <span className="font-display text-4xl text-green-primary leading-none">
                    {stats.totalParticipants.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-[#2a2a2a] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-green-primary h-full transition-all duration-700"
                    style={{ width: progressWidth(stats.totalParticipants, stats.totalParticipants || 1) }}
                  />
                </div>
              </div>

              {/* Completions */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-muted font-semibold text-xs uppercase tracking-widest">
                    Completions
                  </span>
                  <span className="font-display text-4xl text-white leading-none">
                    {stats.completions.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-[#2a2a2a] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-700"
                    style={{ width: progressWidth(stats.completions, stats.totalParticipants || 1) }}
                  />
                </div>
              </div>

              {/* Matches synced */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-muted font-semibold text-xs uppercase tracking-widest">
                    Matches Synced
                  </span>
                  <span className="font-display text-4xl text-gold leading-none">
                    {stats.matchesSynced} / {stats.totalMatches}
                  </span>
                </div>
                <div className="w-full bg-[#2a2a2a] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-gold h-full transition-all duration-700"
                    style={{ width: progressWidth(stats.matchesSynced, stats.totalMatches) }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-muted italic">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Datos actualizados cada 15 minutos
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
