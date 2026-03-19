"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PredictionState } from "@/lib/hooks/usePredictions";
import type { MatchPhase } from "@/types/database";

interface Team {
  id: string;
  name: string;
  short_name: string;
  flag_url: string | null;
}

interface KnockoutMatch {
  id: string;
  phase: MatchPhase;
  match_date: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_team?: Team | null;
  away_team?: Team | null;
}

interface Props {
  predictions: PredictionState;
  onUpdate: (matchId: string, teamId: string | null) => void;
  readOnly?: boolean;
}

const PHASE_ORDER: MatchPhase[] = [
  "round_of_32",
  "round_of_16",
  "quarter",
  "semi",
  "third_place",
  "final",
];

const PHASE_LABELS: Record<MatchPhase, string> = {
  group: "Fase de Grupos",
  round_of_32: "Ronda de 32",
  round_of_16: "Octavos de Final",
  quarter: "Cuartos de Final",
  semi: "Semifinal",
  third_place: "Tercer Puesto",
  final: "Final",
};

function TeamSelectItem({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2">
      {team.flag_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.flag_url}
          alt={team.name}
          className="w-5 h-5 rounded-full object-cover shrink-0"
        />
      )}
      <span>{team.name}</span>
    </div>
  );
}

function KnockoutMatchSlot({
  match,
  allTeams,
  currentWinnerId,
  onUpdate,
  readOnly,
}: {
  match: KnockoutMatch;
  allTeams: Team[];
  currentWinnerId: string | null;
  onUpdate: (matchId: string, teamId: string | null) => void;
  readOnly?: boolean;
}) {
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  // If home/away are known, restrict options; otherwise show all teams
  const options =
    homeTeam && awayTeam ? [homeTeam, awayTeam] : allTeams;

  const selectedTeam = allTeams.find((t) => t.id === currentWinnerId);

  return (
    <div className="bg-dark-card rounded-xl p-4 border border-dark-border flex flex-col gap-3">
      {/* Teams involved */}
      {(homeTeam || awayTeam) && (
        <div className="flex items-center justify-between text-xs text-gray-muted">
          <span className="font-medium">{homeTeam?.name ?? "TBD"}</span>
          <span className="opacity-40">vs</span>
          <span className="font-medium">{awayTeam?.name ?? "TBD"}</span>
        </div>
      )}

      {/* Winner picker */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-muted font-bold">
          ¿Quién pasa?
        </span>
        <Select
          value={currentWinnerId ?? undefined}
          onValueChange={(v) => onUpdate(match.id, v || null)}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full bg-dark-bg border-dark-border text-sm h-9">
            <SelectValue placeholder="Selecciona equipo">
              {selectedTeam ? (
                <TeamSelectItem team={selectedTeam} />
              ) : (
                <span className="text-gray-muted">Selecciona equipo</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-dark-card border-dark-border max-h-60 overflow-y-auto">
            {options.map((team) => (
              <SelectItem
                key={team.id}
                value={team.id}
                className="text-white focus:bg-dark-card-hover"
              >
                <TeamSelectItem team={team} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function KnockoutTab({ predictions, onUpdate, readOnly }: Props) {
  const [matchesByPhase, setMatchesByPhase] = useState<
    Record<string, KnockoutMatch[]>
  >({});
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const [{ data: matchesData }, { data: teamsData }] = await Promise.all([
        supabase
          .from("matches")
          .select(
            `id, phase, match_date, home_team_id, away_team_id,
             home_team:teams!matches_home_team_id_fkey(id, name, short_name, flag_url),
             away_team:teams!matches_away_team_id_fkey(id, name, short_name, flag_url)`
          )
          .neq("phase", "group")
          .order("match_date"),
        supabase
          .from("teams")
          .select("id, name, short_name, flag_url")
          .order("name"),
      ]);

      if (teamsData) setAllTeams(teamsData);

      if (matchesData) {
        const grouped: Record<string, KnockoutMatch[]> = {};
        for (const m of matchesData as unknown as KnockoutMatch[]) {
          if (!grouped[m.phase]) grouped[m.phase] = [];
          grouped[m.phase].push(m);
        }
        setMatchesByPhase(grouped);
      }

      setIsLoading(false);
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-7 w-48 rounded skeleton-shimmer" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-28 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasMatches = PHASE_ORDER.some(
    (phase) => matchesByPhase[phase]?.length > 0
  );

  if (!hasMatches) {
    return (
      <div className="text-center py-20 text-gray-muted">
        <p className="text-lg font-display uppercase tracking-wide mb-2">
          Brackets no disponibles aún
        </p>
        <p className="text-sm">
          Los partidos de la fase eliminatoria se configurarán próximamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {PHASE_ORDER.filter((phase) => matchesByPhase[phase]?.length > 0).map(
        (phase) => (
          <div key={phase}>
            {/* Phase header */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-display text-green-primary uppercase tracking-wide">
                {PHASE_LABELS[phase]}
              </h2>
              <div className="h-[2px] flex-grow bg-gradient-to-r from-green-primary/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {matchesByPhase[phase].map((match) => {
                // Winner stored via onUpdate as a "match" – we look up from predictions
                const winnerId =
                  predictions.match_predictions[match.id]?.home_score !== null
                    ? null // Not applicable for knockout winner
                    : null;
                // Actually we store knockout winners via saveAwards with key `knockout_${matchId}`
                // But the API stores them in predictions – for now we show null until backend supports it
                return (
                  <KnockoutMatchSlot
                    key={match.id}
                    match={match}
                    allTeams={allTeams}
                    currentWinnerId={winnerId}
                    onUpdate={onUpdate}
                    readOnly={readOnly}
                  />
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}
