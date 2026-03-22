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

function FlagSquare({ team }: { team?: Team | null }) {
  return (
    <div className="w-20 h-20 bg-surface-container-highest rounded-2xl flex items-center justify-center p-4 shrink-0">
      {team?.flag_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.flag_url}
          alt={team.name}
          className="w-full h-auto object-contain"
        />
      ) : (
        <span className="text-gray-500 text-sm font-bold font-bebas">
          {team?.short_name?.slice(0, 3) ?? "?"}
        </span>
      )}
    </div>
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
  const isSaved = saved?.home_score !== null && saved?.away_score !== null;

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

  const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "" || (Number(raw) >= 0 && Number(raw) <= 99)) {
      const v = raw === "" ? null : Number(raw);
      setHome(v);
      handleChange(v, away);
    }
  };

  const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "" || (Number(raw) >= 0 && Number(raw) <= 99)) {
      const v = raw === "" ? null : Number(raw);
      setAway(v);
      handleChange(home, v);
    }
  };

  const matchDate = new Date(match.match_date);
  const formattedDate = matchDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const inputClass = [
    "w-16 h-20 bg-surface-container-high border-none rounded-xl text-center font-bebas text-5xl focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    isSaved ? "text-primary" : "text-white",
    readOnly ? "opacity-60 cursor-not-allowed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden group relative border border-white/5">
      {/* Left hover accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-8">
        {/* Card header */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            {match.group_id ? `Group • ` : ""}{formattedDate}
          </span>
          {isSaved ? (
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-sm text-gray-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Guess Saved
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Open for Guess
              </span>
            </div>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-4 flex-1">
            <FlagSquare team={match.home_team} />
            <span className="font-bebas text-2xl tracking-wide text-white">
              {match.home_team?.short_name ?? "TBD"}
            </span>
          </div>

          {/* Score inputs */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={99}
              value={home !== null ? String(home) : ""}
              placeholder="0"
              disabled={readOnly}
              onChange={handleHomeChange}
              className={inputClass}
            />
            <span className="font-bebas text-3xl text-gray-600">VS</span>
            <input
              type="number"
              min={0}
              max={99}
              value={away !== null ? String(away) : ""}
              placeholder="0"
              disabled={readOnly}
              onChange={handleAwayChange}
              className={inputClass}
            />
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-4 flex-1">
            <FlagSquare team={match.away_team} />
            <span className="font-bebas text-2xl tracking-wide text-white">
              {match.away_team?.short_name ?? "TBD"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
          {isSaved ? (
            <>
              <div className="text-xs text-gray-500 font-medium">
                Points Potential: <span className="text-white">500 XP</span>
              </div>
              <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
                Edit Prediction
              </button>
            </>
          ) : (
            <>
              <div className="text-xs text-gray-500 font-medium">
                Predicted by your friends
              </div>
              <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
                Expert Analysis
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendingPicksBento() {
  return (
    <div className="bg-surface-container-high rounded-2xl p-8 border border-white/5 md:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bebas text-3xl text-white">Trending Picks</h3>
        <div className="flex -space-x-3">
          {["A", "B", "C"].map((letter) => (
            <div
              key={letter}
              className="w-10 h-10 rounded-full border-2 border-background bg-surface-container-highest flex items-center justify-center text-xs font-bold text-gray-400"
            >
              {letter}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-background bg-primary-container text-on-primary-fixed flex items-center justify-center text-[10px] font-bold">
            +2k
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">
            Most Predicted Winner
          </p>
          <p className="text-2xl font-bebas text-white">ARGENTINA (62%)</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">
            Hot Score Prediction
          </p>
          <p className="text-2xl font-bebas text-white">2 - 1 OVERALL</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">
            Underdog Alert
          </p>
          <p className="text-2xl font-bebas text-secondary">MOROCCO (12%)</p>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-64 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-12">
      {groups.map((group, groupIndex) => (
        <div key={group.id}>
          {/* Group header */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-bebas text-2xl text-primary tracking-wide uppercase">
              {group.name}
            </h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          {group.matches.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin partidos asignados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  predictions={predictions}
                  onUpdate={onUpdate}
                  readOnly={readOnly}
                />
              ))}
              {/* Trending Picks bento after the first group */}
              {groupIndex === 0 && group.matches.length > 0 && (
                <TrendingPicksBento />
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
