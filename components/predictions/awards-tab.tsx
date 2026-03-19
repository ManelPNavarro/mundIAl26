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

interface Team {
  id: string;
  name: string;
  short_name: string;
  flag_url: string | null;
}

interface Player {
  id: string;
  name: string;
  position: string;
  team_id: string;
  team?: Team;
}

interface Props {
  predictions: PredictionState;
  onUpdate: (field: string, id: string | null) => void;
  readOnly?: boolean;
}

function TeamOption({ team }: { team: Team }) {
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

function PlayerOption({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-2">
      {player.team?.flag_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.team.flag_url}
          alt={player.team.name}
          className="w-5 h-5 rounded-full object-cover shrink-0"
        />
      )}
      <span className="flex-1 truncate">{player.name}</span>
      {player.team && (
        <span className="text-gray-muted text-xs shrink-0">
          {player.team.short_name}
        </span>
      )}
    </div>
  );
}

function AwardCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
      <div className="flex items-start gap-4 mb-5">
        <div className="text-3xl">{icon}</div>
        <div>
          <h3 className="font-display text-xl text-white uppercase tracking-wide">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-muted mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AwardsTab({ predictions, onUpdate, readOnly }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goalkeepers, setGoalkeepers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search filters
  const [playerSearch, setPlayerSearch] = useState("");
  const [scorerSearch, setScorerSearch] = useState("");
  const [gkSearch, setGkSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const [{ data: teamsData }, { data: playersData }] = await Promise.all([
        supabase.from("teams").select("id, name, short_name, flag_url").order("name"),
        supabase
          .from("players")
          .select(
            `id, name, position, team_id,
             team:teams(id, name, short_name, flag_url)`
          )
          .order("name"),
      ]);

      if (teamsData) setTeams(teamsData);
      if (playersData) {
        const all = playersData as unknown as Player[];
        setPlayers(all);
        setGoalkeepers(all.filter((p) => p.position === "goalkeeper"));
      }

      setIsLoading(false);
    }

    load();
  }, []);

  const filterPlayers = (list: Player[], search: string) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team?.name.toLowerCase().includes(q) ||
        p.team?.short_name.toLowerCase().includes(q)
    );
  };

  const getTeam = (id: string | null) => teams.find((t) => t.id === id);
  const getPlayer = (id: string | null, list: Player[]) =>
    list.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-52 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Champion */}
      <AwardCard
        title="Campeón del Mundial"
        description="El equipo que ganará el torneo"
        icon="🏆"
      >
        <Select
          value={predictions.tournament_winner_team_id ?? undefined}
          onValueChange={(v) => onUpdate("tournament_winner_team_id", v || null)}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full bg-dark-bg border-dark-border text-sm h-10">
            <SelectValue placeholder="Selecciona el campeón">
              {predictions.tournament_winner_team_id ? (
                <TeamOption team={getTeam(predictions.tournament_winner_team_id)!} />
              ) : (
                <span className="text-gray-muted">Selecciona el campeón</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-dark-card border-dark-border max-h-64 overflow-y-auto">
            {teams.map((team) => (
              <SelectItem
                key={team.id}
                value={team.id}
                className="text-white focus:bg-dark-card-hover"
              >
                <TeamOption team={team} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AwardCard>

      {/* MVP */}
      <AwardCard
        title="MVP del Torneo"
        description="El mejor jugador de la competición"
        icon="⭐"
      >
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            disabled={readOnly}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-muted focus:outline-none focus:border-green-primary transition-colors disabled:opacity-50"
          />
          <Select
            value={predictions.mvp_player_id ?? undefined}
            onValueChange={(v) => onUpdate("mvp_player_id", v || null)}
            disabled={readOnly}
          >
            <SelectTrigger className="w-full bg-dark-bg border-dark-border text-sm h-10">
              <SelectValue placeholder="Selecciona el MVP">
                {predictions.mvp_player_id ? (
                  <PlayerOption
                    player={getPlayer(predictions.mvp_player_id, players)!}
                  />
                ) : (
                  <span className="text-gray-muted">Selecciona el MVP</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-dark-border max-h-64 overflow-y-auto">
              {filterPlayers(players, playerSearch).map((player) => (
                <SelectItem
                  key={player.id}
                  value={player.id}
                  className="text-white focus:bg-dark-card-hover"
                >
                  <PlayerOption player={player} />
                </SelectItem>
              ))}
              {filterPlayers(players, playerSearch).length === 0 && (
                <div className="px-2 py-3 text-sm text-gray-muted text-center">
                  Sin resultados
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </AwardCard>

      {/* Top Scorer */}
      <AwardCard
        title="Máximo Goleador"
        description="El jugador con más goles en el torneo"
        icon="⚽"
      >
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={scorerSearch}
            onChange={(e) => setScorerSearch(e.target.value)}
            disabled={readOnly}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-muted focus:outline-none focus:border-green-primary transition-colors disabled:opacity-50"
          />
          <Select
            value={predictions.top_scorer_player_id ?? undefined}
            onValueChange={(v) => onUpdate("top_scorer_player_id", v || null)}
            disabled={readOnly}
          >
            <SelectTrigger className="w-full bg-dark-bg border-dark-border text-sm h-10">
              <SelectValue placeholder="Selecciona el goleador">
                {predictions.top_scorer_player_id ? (
                  <PlayerOption
                    player={getPlayer(predictions.top_scorer_player_id, players)!}
                  />
                ) : (
                  <span className="text-gray-muted">Selecciona el goleador</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-dark-border max-h-64 overflow-y-auto">
              {filterPlayers(players, scorerSearch).map((player) => (
                <SelectItem
                  key={player.id}
                  value={player.id}
                  className="text-white focus:bg-dark-card-hover"
                >
                  <PlayerOption player={player} />
                </SelectItem>
              ))}
              {filterPlayers(players, scorerSearch).length === 0 && (
                <div className="px-2 py-3 text-sm text-gray-muted text-center">
                  Sin resultados
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </AwardCard>

      {/* Best Goalkeeper */}
      <AwardCard
        title="Mejor Portero"
        description="El guardameta más destacado del torneo"
        icon="🧤"
      >
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Buscar portero..."
            value={gkSearch}
            onChange={(e) => setGkSearch(e.target.value)}
            disabled={readOnly}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-muted focus:outline-none focus:border-green-primary transition-colors disabled:opacity-50"
          />
          <Select
            value={predictions.best_goalkeeper_player_id ?? undefined}
            onValueChange={(v) => onUpdate("best_goalkeeper_player_id", v || null)}
            disabled={readOnly}
          >
            <SelectTrigger className="w-full bg-dark-bg border-dark-border text-sm h-10">
              <SelectValue placeholder="Selecciona el portero">
                {predictions.best_goalkeeper_player_id ? (
                  <PlayerOption
                    player={
                      getPlayer(predictions.best_goalkeeper_player_id, goalkeepers)!
                    }
                  />
                ) : (
                  <span className="text-gray-muted">Selecciona el portero</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-dark-border max-h-64 overflow-y-auto">
              {filterPlayers(goalkeepers, gkSearch).map((player) => (
                <SelectItem
                  key={player.id}
                  value={player.id}
                  className="text-white focus:bg-dark-card-hover"
                >
                  <PlayerOption player={player} />
                </SelectItem>
              ))}
              {filterPlayers(goalkeepers, gkSearch).length === 0 && (
                <div className="px-2 py-3 text-sm text-gray-muted text-center">
                  Sin resultados
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </AwardCard>
    </div>
  );
}
