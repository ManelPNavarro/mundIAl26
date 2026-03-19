"use client";

import { useState, useEffect } from "react";
import { usePredictions } from "@/lib/hooks/usePredictions";
import GroupMatchesTab from "@/components/predictions/group-matches-tab";
import GroupStandingsTab from "@/components/predictions/group-standings-tab";
import KnockoutTab from "@/components/predictions/knockout-tab";
import AwardsTab from "@/components/predictions/awards-tab";
import { Save } from "lucide-react";

type TabKey = "partidos" | "clasificacion" | "eliminatoria" | "premios";

const TABS: { key: TabKey; label: string }[] = [
  { key: "partidos", label: "Partidos de Grupos" },
  { key: "clasificacion", label: "Clasificación de Grupos" },
  { key: "eliminatoria", label: "Fase Eliminatoria" },
  { key: "premios", label: "Premios Especiales" },
];

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("partidos");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { state, isLoading, saveMatch, saveGroup, saveAwards, refetch } =
    usePredictions();

  // Fetch deadline from settings
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.predictions_deadline) {
          const d = new Date(data.predictions_deadline);
          setDeadline(d);
          setIsPastDeadline(new Date() > d);
        }
      })
      .catch(() => {
        // Settings API may not exist yet; silently ignore
      });
  }, []);

  // Count filled predictions for progress
  const matchCount = Object.values(state.match_predictions).filter(
    (m) => m.home_score !== null && m.away_score !== null
  ).length;
  const groupCount = Object.keys(state.group_predictions).length;
  const awardsCount = [
    state.tournament_winner_team_id,
    state.mvp_player_id,
    state.top_scorer_player_id,
    state.best_goalkeeper_player_id,
  ].filter(Boolean).length;

  // Total slots: 48 group matches + 16 groups + 4 awards = 68
  const totalSlots = 48 + 16 + 4;
  const filledSlots = matchCount + groupCount + awardsCount;
  const progressPercent = Math.round((filledSlots / totalSlots) * 100);

  const handleSave = async () => {
    setIsSaving(true);
    await refetch();
    setIsSaving(false);
  };

  const handleUpdateMatch = (matchId: string, home: number, away: number) => {
    saveMatch(matchId, home, away);
  };

  const handleUpdateGroup = (
    groupId: string,
    position: "first" | "second" | "third",
    teamId: string | null
  ) => {
    const current = state.group_predictions[groupId] ?? {
      group_id: groupId,
      first_team_id: null,
      second_team_id: null,
      third_team_id: null,
    };
    const updated = {
      first_team_id: position === "first" ? teamId : current.first_team_id,
      second_team_id: position === "second" ? teamId : current.second_team_id,
      third_team_id: position === "third" ? teamId : current.third_team_id,
    };
    saveGroup(
      groupId,
      updated.first_team_id,
      updated.second_team_id,
      updated.third_team_id
    );
  };

  const handleUpdateKnockout = (matchId: string, teamId: string | null) => {
    // Knockout bracket predictions stored as match predictions with a special team field
    // We store winner as home_score placeholder; use awards-style save
    saveAwards(`knockout_${matchId}`, teamId);
  };

  const handleUpdateAward = (field: string, id: string | null) => {
    saveAwards(field, id);
  };

  return (
    <div className="pb-32 md:pb-16">
      {/* Deadline banner */}
      {isPastDeadline && deadline && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <span className="font-bold uppercase tracking-wider">Plazo cerrado — </span>
          Las predicciones estaban abiertas hasta el{" "}
          {deadline.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          . Solo puedes ver tus predicciones.
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display text-[40px] leading-none uppercase tracking-tight text-white mb-4">
          Mi Quiniela
        </h1>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-muted">
              Progreso de Predicciones
            </span>
            <span className="text-xs font-bold text-green-primary">
              {filledSlots} / {totalSlots}
            </span>
          </div>
          <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-green-primary rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                boxShadow: "0 0 10px rgba(0,212,106,0.4)",
              }}
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              "whitespace-nowrap px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors",
              activeTab === tab.key
                ? "bg-green-primary text-black shadow-lg shadow-green-primary/20"
                : "bg-dark-card text-gray-muted hover:bg-dark-card-hover",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === "partidos" && (
            <GroupMatchesTab
              predictions={state}
              onUpdate={handleUpdateMatch}
              readOnly={isPastDeadline}
            />
          )}
          {activeTab === "clasificacion" && (
            <GroupStandingsTab
              predictions={state}
              onUpdate={handleUpdateGroup}
              readOnly={isPastDeadline}
            />
          )}
          {activeTab === "eliminatoria" && (
            <KnockoutTab
              predictions={state}
              onUpdate={handleUpdateKnockout}
              readOnly={isPastDeadline}
            />
          )}
          {activeTab === "premios" && (
            <AwardsTab
              predictions={state}
              onUpdate={handleUpdateAward}
              readOnly={isPastDeadline}
            />
          )}
        </>
      )}

      {/* Sticky save button */}
      {!isPastDeadline && (
        <div className="fixed bottom-24 md:bottom-8 right-8 z-50">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 px-8 py-4 bg-green-primary text-black rounded-full font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(0,212,106,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
          >
            <Save className="size-5" strokeWidth={2.5} />
            <span className="hidden md:inline">
              {isSaving ? "Guardando..." : "Guardar Quiniela"}
            </span>
            <span className="md:hidden">{isSaving ? "..." : "Guardar"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
