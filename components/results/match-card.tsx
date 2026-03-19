"use client";

import { StatusBadge } from "@/components/ui/status-badge";

interface MatchCardProps {
  match: {
    id: string;
    home_team: { name: string; short_name: string; flag_url: string | null };
    away_team: { name: string; short_name: string; flag_url: string | null };
    home_score: number | null;
    away_score: number | null;
    status: "scheduled" | "live" | "finished";
    match_date: string;
    phase: string;
    group_name?: string | null;
  };
}

function FlagImage({
  flagUrl,
  teamName,
}: {
  flagUrl: string | null;
  teamName: string;
}) {
  if (!flagUrl) {
    return (
      <div className="w-10 h-7 bg-dark-border rounded flex items-center justify-center text-gray-muted text-[10px] font-bold shrink-0">
        {teamName.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={flagUrl}
      alt={teamName}
      className="w-10 h-7 object-cover rounded shadow-sm border border-dark-border/50 shrink-0"
    />
  );
}

function formatMatchDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchCard({ match }: MatchCardProps) {
  const { home_team, away_team, home_score, away_score, status, match_date, group_name } =
    match;

  const isScheduled = status === "scheduled";
  const isLive = status === "live";

  return (
    <div className="bg-dark-card rounded-xl p-5 border border-dark-border hover:bg-dark-card-hover transition-all duration-300 flex items-center justify-between gap-2">
      {/* Home team */}
      <div className="flex items-center gap-3 w-[38%]">
        <FlagImage flagUrl={home_team.flag_url} teamName={home_team.name} />
        <span className="font-display text-lg text-white leading-none truncate">
          {home_team.short_name}
        </span>
      </div>

      {/* Center: score or VS + status */}
      <div className="flex flex-col items-center gap-1.5 w-[24%] shrink-0">
        <StatusBadge variant={status} />

        {isScheduled ? (
          <>
            <div className="font-display text-2xl text-gray-muted leading-none">
              VS
            </div>
            <span className="text-[10px] text-gray-muted uppercase tracking-tight">
              {formatMatchDate(match_date)}
            </span>
          </>
        ) : (
          <>
            <div
              className={`font-display text-3xl text-white leading-none ${
                isLive ? "animate-pulse" : ""
              }`}
            >
              {home_score ?? 0} - {away_score ?? 0}
            </div>
            {group_name && (
              <span className="text-[10px] text-gray-muted uppercase font-medium tracking-tight">
                {group_name}
              </span>
            )}
          </>
        )}
      </div>

      {/* Away team */}
      <div className="flex items-center gap-3 justify-end w-[38%]">
        <span className="font-display text-lg text-white leading-none truncate text-right">
          {away_team.short_name}
        </span>
        <FlagImage flagUrl={away_team.flag_url} teamName={away_team.name} />
      </div>
    </div>
  );
}
