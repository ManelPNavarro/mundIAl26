"use client";

import { useState } from "react";
import { useResults, type MatchResult } from "@/lib/hooks/useResults";
import { MatchCard } from "@/components/results/match-card";
import { SkeletonRows } from "@/components/ui/skeleton-rows";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type PhaseKey =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter"
  | "semi"
  | "final";

const PHASE_TABS: { key: PhaseKey; label: string }[] = [
  { key: "group", label: "Grupos" },
  { key: "round_of_32", label: "R. of 32" },
  { key: "round_of_16", label: "Octavos" },
  { key: "quarter", label: "Cuartos" },
  { key: "semi", label: "Semifinal" },
  { key: "final", label: "Final" },
];

interface FeaturedLiveMatchProps {
  match: MatchResult;
}

function FlagCircle({
  flagUrl,
  teamName,
}: {
  flagUrl: string | null;
  teamName: string;
}) {
  if (!flagUrl) {
    return (
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-border border-4 border-dark-card flex items-center justify-center text-gray-muted font-display text-2xl">
        {teamName.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  return (
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-dark-card shadow-2xl">
      <img
        src={flagUrl}
        alt={teamName}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function FeaturedLiveMatch({ match }: FeaturedLiveMatchProps) {
  return (
    <div className="mb-12 relative overflow-hidden rounded-xl bg-dark-card border border-dark-border p-1">
      <div className="relative bg-dark-card rounded-[11px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Home team */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <FlagCircle
            flagUrl={match.home_team.flag_url}
            teamName={match.home_team.name}
          />
          <span className="font-display text-2xl md:text-4xl text-white tracking-wide">
            {match.home_team.name}
          </span>
        </div>

        {/* Score center */}
        <div className="flex flex-col items-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              En Juego
            </span>
          </div>
          <div className="flex items-center gap-6 md:gap-10">
            <span className="font-display text-7xl md:text-9xl text-white tabular-nums leading-none">
              {match.home_score ?? 0}
            </span>
            <span className="font-display text-3xl md:text-5xl text-gray-muted leading-none">
              -
            </span>
            <span className="font-display text-7xl md:text-9xl text-white tabular-nums leading-none">
              {match.away_score ?? 0}
            </span>
          </div>
          <span className="text-green-primary font-display text-xl md:text-2xl mt-3">
            LIVE
          </span>
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <FlagCircle
            flagUrl={match.away_team.flag_url}
            teamName={match.away_team.name}
          />
          <span className="font-display text-2xl md:text-4xl text-white tracking-wide">
            {match.away_team.name}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [selectedPhase, setSelectedPhase] = useState<PhaseKey>("group");
  const { results, isLoading } = useResults(selectedPhase);

  const liveMatch = results.find((m) => m.status === "live");
  const gridMatches = liveMatch
    ? results.filter((m) => m.id !== liveMatch.id)
    : results;

  return (
    <div className="max-w-5xl mx-auto pt-4 md:pt-8 pb-12">
      {/* Editorial header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <span className="text-green-primary font-semibold tracking-widest text-xs uppercase">
            Temporada 2026
          </span>
          <h1 className="font-display text-6xl md:text-8xl tracking-tight text-white leading-none">
            Resultados
          </h1>
        </div>

        {/* Phase filter tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {PHASE_TABS.map((tab) => {
            const isActive = selectedPhase === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedPhase(tab.key)}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-xs uppercase whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-green-primary text-black"
                    : "bg-dark-card text-gray-muted hover:text-white border border-dark-border"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="skeleton-shimmer rounded-xl h-64 mb-10" />
          <SkeletonRows count={6} columns={3} />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          subtitle="No hay partidos disponibles para esta fase todavía."
        />
      ) : (
        <>
          {/* Featured live match */}
          {liveMatch && <FeaturedLiveMatch match={liveMatch} />}

          {/* Match grid */}
          {gridMatches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gridMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Quote footer */}
      <div className="mt-16 py-10 border-y border-dark-border text-center">
        <h3 className="font-display text-3xl md:text-4xl text-white italic">
          &ldquo;El fútbol es la cosa más importante de las cosas menos importantes.&rdquo;
        </h3>
        <p className="text-gray-muted text-xs uppercase tracking-widest mt-3">
          — Jorge Valdano
        </p>
      </div>
    </div>
  );
}
