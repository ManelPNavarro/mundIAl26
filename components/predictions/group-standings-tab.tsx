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
  group_id: string | null;
}

interface Group {
  id: string;
  name: string;
  teams: Team[];
}

interface Props {
  predictions: PredictionState;
  onUpdate: (
    groupId: string,
    position: "first" | "second" | "third",
    teamId: string | null
  ) => void;
  readOnly?: boolean;
}

const POSITION_LABELS: { key: "first" | "second" | "third"; label: string }[] = [
  { key: "first", label: "1°" },
  { key: "second", label: "2°" },
  { key: "third", label: "3°" },
];

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

function GroupCard({
  group,
  predictions,
  onUpdate,
  readOnly,
}: {
  group: Group;
  predictions: PredictionState;
  onUpdate: Props["onUpdate"];
  readOnly?: boolean;
}) {
  const saved = predictions.group_predictions[group.id];

  const getValue = (position: "first" | "second" | "third") => {
    const teamId = saved?.[`${position}_team_id`] ?? null;
    return teamId ?? undefined;
  };

  const getTeamName = (teamId: string | null | undefined) => {
    if (!teamId) return undefined;
    return group.teams.find((t) => t.id === teamId)?.name;
  };

  return (
    <div className="bg-dark-card rounded-xl p-5 border border-dark-border">
      {/* Group title */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-display text-lg text-green-primary uppercase tracking-wide">
          {group.name}
        </h3>
        <div className="h-px flex-grow bg-dark-border" />
      </div>

      {/* Position selectors */}
      <div className="space-y-3">
        {POSITION_LABELS.map(({ key, label }) => {
          const value = getValue(key);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="font-display text-base text-gray-muted w-6 shrink-0">
                {label}
              </span>
              <Select
                value={value}
                onValueChange={(v) => onUpdate(group.id, key, v || null)}
                disabled={readOnly}
              >
                <SelectTrigger className="flex-1 bg-dark-bg border-dark-border text-sm h-9">
                  <SelectValue placeholder="Selecciona un equipo">
                    {value ? (
                      <TeamOption
                        team={group.teams.find((t) => t.id === value)!}
                      />
                    ) : (
                      <span className="text-gray-muted">Selecciona un equipo</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-border">
                  {group.teams.map((team) => (
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
            </div>
          );
        })}
      </div>

      {/* Current selection summary */}
      {saved && (
        <div className="mt-3 pt-3 border-t border-dark-border flex gap-2 flex-wrap">
          {(["first", "second", "third"] as const).map((pos) => {
            const name = getTeamName(saved[`${pos}_team_id`]);
            if (!name) return null;
            return (
              <span
                key={pos}
                className="text-xs bg-green-primary/10 text-green-primary rounded px-2 py-0.5 font-medium"
              >
                {pos === "first" ? "1°" : pos === "second" ? "2°" : "3°"} {name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GroupStandingsTab({ predictions, onUpdate, readOnly }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const { data: teamsData } = await supabase
        .from("teams")
        .select("id, name, short_name, flag_url, group_id")
        .not("group_id", "is", null)
        .order("name");

      const { data: groupsData } = await supabase
        .from("groups")
        .select("id, name")
        .order("name");

      if (!teamsData || !groupsData) {
        setIsLoading(false);
        return;
      }

      const grouped: Group[] = groupsData.map((g) => ({
        id: g.id,
        name: g.name,
        teams: teamsData.filter((t) => t.group_id === g.id),
      }));

      setGroups(grouped);
      setIsLoading(false);
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="h-52 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          predictions={predictions}
          onUpdate={onUpdate}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
