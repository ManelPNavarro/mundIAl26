"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PredictionState } from "@/lib/hooks/usePredictions";

interface Team {
  id: string;
  name: string;
  short_name: string;
  flag_url: string | null;
}

interface Match {
  id: string;
  phase: string;
  group_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  match_date: string;
  home_team?: Team | null;
  away_team?: Team | null;
}

interface Group {
  id: string;
  name: string;
  matches: Match[];
}

interface Props {
  predictions: PredictionState;
  onUpdate: (matchId: string, home: number, away: number) => void;
  readOnly?: boolean;
}

function FlagCircle({ team }: { team?: Team | null }) {
  return (
    <div className="w-12 h-12 rounded-full bg-dark-border flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-green-primary/30 transition-all shrink-0">
      {team?.flag_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.flag_url}
          alt={`Bandera de ${team.name}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-muted text-xs font-bold">
          {team?.short_name?.slice(0, 3) ?? "?"}
        </span>
      )}
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [localValue, setLocalValue] = useState<string>(
    value !== null ? String(value) : ""
  );

  // Sync when parent value changes (e.g. after load)
  useEffect(() => {
    setLocalValue(value !== null ? String(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "" || (Number(raw) >= 0 && Number(raw) <= 99)) {
      setLocalValue(raw);
      if (raw !== "") {
        onChange(Number(raw));
      }
    }
  };

  return (
    <input
      type="number"
      min={0}
      max={99}
      value={localValue}
      placeholder="0"
      disabled={disabled}
      onChange={handleChange}
      className="w-14 h-14 bg-dark-bg border border-dark-border rounded-lg text-center font-display text-[32px] text-green-primary focus:outline-none focus:border-green-primary focus:ring-2 focus:ring-green-primary/30 transition-all disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

function MatchCard({
  match,
  predictions,
  onUpdate,
  readOnly,
}: {
  match: Match;
  predictions: PredictionState;
  onUpdate: (matchId: string, home: number, away: number) => void;
  readOnly?: boolean;
}) {
  const saved = predictions.match_predictions[match.id];
  const [home, setHome] = useState<number | null>(saved?.home_score ?? null);
  const [away, setAway] = useState<number | null>(saved?.away_score ?? null);

  // Sync when predictions load/change
  useEffect(() => {
    setHome(saved?.home_score ?? null);
    setAway(saved?.away_score ?? null);
  }, [saved?.home_score, saved?.away_score]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (newHome: number | null, newAway: number | null) => {
      if (newHome === null || newAway === null) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(match.id, newHome, newAway);
      }, 500);
    },
    [match.id, onUpdate]
  );

  const handleHomeChange = (v: number) => {
    setHome(v);
    handleChange(v, away);
  };

  const handleAwayChange = (v: number) => {
    setAway(v);
    handleChange(home, v);
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 flex items-center justify-between group transition-all hover:bg-dark-card-hover">
      {/* Home team */}
      <div className="flex flex-col items-center gap-2 w-1/3">
        <FlagCircle team={match.home_team} />
        <span className="text-xs font-bold uppercase tracking-tighter text-center text-white">
          {match.home_team?.short_name ?? "TBD"}
        </span>
      </div>

      {/* Scores */}
      <div className="flex items-center gap-3">
        <ScoreInput value={home} onChange={handleHomeChange} disabled={readOnly} />
        <span className="text-gray-muted font-display text-xl opacity-50">-</span>
        <ScoreInput value={away} onChange={handleAwayChange} disabled={readOnly} />
      </div>

      {/* Away team */}
      <div className="flex flex-col items-center gap-2 w-1/3">
        <FlagCircle team={match.away_team} />
        <span className="text-xs font-bold uppercase tracking-tighter text-center text-white">
          {match.away_team?.short_name ?? "TBD"}
        </span>
      </div>
    </div>
  );
}

export default function GroupMatchesTab({ predictions, onUpdate, readOnly }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const [{ data: groupsData }, { data: matchesData }] = await Promise.all([
        supabase.from("groups").select("id, name").order("name"),
        supabase
          .from("matches")
          .select(
            `id, phase, group_id, home_team_id, away_team_id, match_date,
             home_team:teams!matches_home_team_id_fkey(id, name, short_name, flag_url),
             away_team:teams!matches_away_team_id_fkey(id, name, short_name, flag_url)`
          )
          .eq("phase", "group")
          .order("match_date"),
      ]);

      if (!groupsData || !matchesData) {
        setIsLoading(false);
        return;
      }

      const grouped: Group[] = groupsData.map((g) => ({
        id: g.id,
        name: g.name,
        matches: (matchesData as unknown as Match[]).filter(
          (m) => m.group_id === g.id
        ),
      }));

      setGroups(grouped);
      setIsLoading(false);
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-32 rounded skeleton-shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-28 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-12">
      {groups.map((group) => (
        <div key={group.id}>
          {/* Group header */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-display text-green-primary tracking-wide uppercase">
              {group.name}
            </h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-green-primary/30 to-transparent" />
          </div>

          {group.matches.length === 0 ? (
            <p className="text-gray-muted text-sm">Sin partidos asignados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  predictions={predictions}
                  onUpdate={onUpdate}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
