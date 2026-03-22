"use client";

import { useState } from "react";
import { useResults, type MatchResult } from "@/lib/hooks/useResults";
import { cn } from "@/lib/utils";

// ─── Phase tabs ──────────────────────────────────────────────────────────────

type PhaseKey =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter"
  | "semi"
  | "final";

const DISPLAY_TABS: { key: PhaseKey; label: string }[] = [
  { key: "group", label: "Grupos" },
  { key: "round_of_32", label: "Octavos" },
  { key: "round_of_16", label: "Cuartos" },
  { key: "quarter", label: "Semis" },
  { key: "final", label: "Final" },
];

// ─── Flag helpers ─────────────────────────────────────────────────────────────

function TeamFlag({
  flagUrl,
  teamName,
}: {
  flagUrl: string | null;
  teamName: string;
}) {
  if (!flagUrl) {
    return (
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5 text-gray-500 font-bebas text-sm">
        {teamName.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  return (
    <div className="w-16 h-16 rounded-full bg-surface-container-high p-3 flex items-center justify-center border border-white/5">
      <img
        src={flagUrl}
        alt={teamName}
        className="w-full h-auto rounded-sm object-contain"
      />
    </div>
  );
}

// ─── Live match card ──────────────────────────────────────────────────────────

function LiveMatchCard({ match }: { match: MatchResult }) {
  return (
    <div className="relative bg-surface-container-low rounded-xl p-8 overflow-hidden group">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />

      {/* Header row */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">
            En Juego
          </span>
        </div>
        {match.group_name && (
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            {match.group_name}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between">
        {/* Home team */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <TeamFlag flagUrl={match.home_team.flag_url} teamName={match.home_team.name} />
          <span className="font-bebas text-2xl tracking-tight uppercase text-white">
            {match.home_team.short_name}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center px-6 md:px-8">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="font-bebas text-7xl text-white tracking-tighter">
              {match.home_score ?? 0}
            </span>
            <span className="font-bebas text-4xl text-gray-700 tracking-tighter">:</span>
            <span className="font-bebas text-7xl text-white tracking-tighter">
              {match.away_score ?? 0}
            </span>
          </div>
          <div className="mt-2 bg-surface-container-high px-3 py-1 rounded-full">
            <span className="text-[10px] font-bold tracking-tighter text-primary">EN VIVO</span>
          </div>
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <TeamFlag flagUrl={match.away_team.flag_url} teamName={match.away_team.name} />
          <span className="font-bebas text-2xl tracking-tight uppercase text-white">
            {match.away_team.short_name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Finished / scheduled match card ─────────────────────────────────────────

function MatchCard({ match }: { match: MatchResult }) {
  const isScheduled = match.status === "scheduled";
  const statusLabel = isScheduled
    ? new Date(match.match_date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Finalizado";

  return (
    <div className="bg-surface-container-low rounded-xl p-8 overflow-hidden group hover:bg-surface-container transition-colors">
      {/* Header row */}
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          {statusLabel}
        </span>
        {match.group_name && (
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            {match.group_name}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div
        className={cn(
          "flex items-center justify-between transition-opacity",
          !isScheduled && "opacity-80 group-hover:opacity-100"
        )}
      >
        {/* Home team */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <TeamFlag flagUrl={match.home_team.flag_url} teamName={match.home_team.name} />
          <span className="font-bebas text-2xl tracking-tight uppercase text-white">
            {match.home_team.short_name}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center px-6 md:px-8">
          {isScheduled ? (
            <span className="font-bebas text-4xl text-gray-600 tracking-tighter">VS</span>
          ) : (
            <div className="flex items-center gap-4 md:gap-6">
              <span className="font-bebas text-7xl text-white tracking-tighter">
                {match.home_score ?? 0}
              </span>
              <span className="font-bebas text-4xl text-gray-800 tracking-tighter">:</span>
              <span className="font-bebas text-7xl text-white tracking-tighter">
                {match.away_score ?? 0}
              </span>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <TeamFlag flagUrl={match.away_team.flag_url} teamName={match.away_team.name} />
          <span className="font-bebas text-2xl tracking-tight uppercase text-white">
            {match.away_team.short_name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return <div className="skeleton-shimmer rounded-xl h-56" />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [selectedPhase, setSelectedPhase] = useState<PhaseKey>("group");
  const { results, isLoading } = useResults(selectedPhase);

  const liveMatches = results.filter((m) => m.status === "live");
  const restMatches = results.filter((m) => m.status !== "live");

  return (
    <div className="pb-24 pt-8">
      {/* ── Header ── */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-bebas text-5xl tracking-tighter text-white leading-none">
              COPA DEL MUNDO 2026
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Sigue el camino a la gloria eterna.
            </p>
          </div>
        </div>

        {/* Phase tabs */}
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl w-fit overflow-x-auto hide-scrollbar">
          {DISPLAY_TABS.map((tab) => {
            const isActive = selectedPhase === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedPhase(tab.key)}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-on-primary-fixed"
                    : "text-gray-500 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
            sports_soccer
          </span>
          <h2 className="font-bebas text-3xl text-white mb-2">Sin resultados</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            No hay partidos disponibles para esta fase todavía.
          </p>
        </div>
      ) : (
        <>
          {/* ── Match grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Live matches first */}
            {liveMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
            {/* Other matches */}
            {restMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {/* ── Standing snippet ── */}
          {selectedPhase === "group" && (
            <section className="mt-16">
              <h4 className="font-bebas text-2xl tracking-tight text-white mb-6">
                POSICIONES — GRUPO A
              </h4>
              <div className="bg-surface-container-low rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm border-separate border-spacing-0">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-gray-400 uppercase">
                        Pos
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-gray-400 uppercase">
                        Equipo
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-gray-400 uppercase">
                        PJ
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-gray-400 uppercase">
                        GF
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-gray-400 uppercase">
                        GC
                      </th>
                      <th className="px-6 py-4 font-bold text-[10px] tracking-widest text-gray-400 uppercase text-right">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Derive group standings from current phase results */}
                    {Array.from(
                      results
                        .reduce((acc, m) => {
                          for (const side of ["home", "away"] as const) {
                            const team =
                              side === "home" ? m.home_team : m.away_team;
                            const gs =
                              side === "home" ? m.home_score : m.away_score;
                            const gc =
                              side === "home" ? m.away_score : m.home_score;
                            if (!team.id) continue;
                            const prev = acc.get(team.id) ?? {
                              name: team.name,
                              short_name: team.short_name,
                              flag_url: team.flag_url,
                              pj: 0,
                              gf: 0,
                              gc: 0,
                              pts: 0,
                            };
                            if (m.status === "finished" && gs !== null && gc !== null) {
                              const pts =
                                gs > gc ? 3 : gs === gc ? 1 : 0;
                              acc.set(team.id, {
                                ...prev,
                                pj: prev.pj + 1,
                                gf: prev.gf + gs,
                                gc: prev.gc + gc,
                                pts: prev.pts + pts,
                              });
                            } else {
                              acc.set(team.id, prev);
                            }
                          }
                          return acc;
                        }, new Map<string, { name: string; short_name: string; flag_url: string | null; pj: number; gf: number; gc: number; pts: number }>())
                        .entries()
                    )
                      .sort((a, b) => b[1].pts - a[1].pts)
                      .slice(0, 4)
                      .map(([id, team], idx) => (
                        <tr key={id} className="hover:bg-surface-container transition-colors">
                          <td className="px-6 py-4 border-b border-white/5 font-bebas text-lg">
                            {String(idx + 1).padStart(2, "0")}
                          </td>
                          <td className="px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                              {team.flag_url ? (
                                <img
                                  src={team.flag_url}
                                  alt={team.name}
                                  className="w-5 h-auto rounded-sm"
                                />
                              ) : (
                                <div className="w-5 h-4 bg-surface-container-highest rounded-sm flex items-center justify-center text-[8px] text-gray-500">
                                  {team.short_name.slice(0, 2)}
                                </div>
                              )}
                              <span className="font-bold tracking-tight">{team.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-white/5 text-gray-400">
                            {team.pj}
                          </td>
                          <td className="px-6 py-4 border-b border-white/5 text-gray-400">
                            {team.gf}
                          </td>
                          <td className="px-6 py-4 border-b border-white/5 text-gray-400">
                            {team.gc}
                          </td>
                          <td className="px-6 py-4 border-b border-white/5 text-right font-bold text-primary">
                            {team.pts}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="p-4 flex justify-center bg-surface-container/30">
                  <button className="text-[10px] font-bold tracking-widest text-gray-500 hover:text-white uppercase transition-colors">
                    VER TABLA COMPLETA
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
