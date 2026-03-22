"use client";

import { useState, useEffect } from "react";
import { usePredictions } from "@/lib/hooks/usePredictions";
import GroupMatchesTab from "@/components/predictions/group-matches-tab";
import KnockoutTab from "@/components/predictions/knockout-tab";

type TabKey = "group_stage" | "round_of_16" | "quarter_finals" | "semi_finals" | "final";

const TABS: { key: TabKey; label: string }[] = [
  { key: "group_stage", label: "GROUP STAGE" },
  { key: "round_of_16", label: "ROUND OF 16" },
  { key: "quarter_finals", label: "QUARTER FINALS" },
  { key: "semi_finals", label: "SEMI FINALS" },
  { key: "final", label: "FINAL" },
];

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("group_stage");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { state, isLoading, saveMatch, saveAwards, refetch } =
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

  const handleUpdateKnockout = (matchId: string, teamId: string | null) => {
    saveAwards(`knockout_${matchId}`, teamId);
  };

  return (
    <div className="pb-32">
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

      {/* Hero Title Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-2">
              Personal Dashboard
            </span>
            <h1 className="text-5xl md:text-7xl font-bebas text-white leading-none tracking-tight">
              MI QUINIELA
            </h1>
            <p className="text-gray-400 mt-4 max-w-md">
              Predice los resultados del Mundial 2026 y compite por el título mundial.
              Apuestas de alto nivel, excelencia editorial pura.
            </p>
          </div>
          {/* Global Rank card */}
          <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center justify-center min-w-[200px] border border-white/5">
            <span className="text-gray-500 uppercase text-[10px] tracking-[0.2em] font-bold mb-2">
              Global Rank
            </span>
            <span className="font-bebas text-5xl text-white leading-none">
              #{(1000 + matchCount * 10).toLocaleString()}
            </span>
            <div className="mt-2 flex items-center gap-1 text-primary text-xs font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+{matchCount} today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Progress and Action Buttons */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm font-bold uppercase tracking-tighter">
                Completion Progress
              </span>
              <span className="text-primary font-bebas text-xl">
                {matchCount}/48 MATCHES
              </span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end gap-2">
            <button
              className="bg-surface-container-high text-white p-3 rounded-xl hover:bg-surface-container-highest transition-colors border border-white/5"
              aria-label="Share"
            >
              <span className="material-symbols-outlined">share</span>
            </button>
            <button
              className="bg-surface-container-high text-white p-3 rounded-xl hover:bg-surface-container-highest transition-colors border border-white/5"
              aria-label="Settings"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>

        {/* Phase Tabs */}
        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-8 py-3 whitespace-nowrap font-bebas text-xl tracking-wide transition-colors",
                activeTab === tab.key
                  ? "bg-[#2a2a2a] text-[#00D46A] border-b-2 border-[#00D46A]"
                  : "text-gray-500 hover:text-white",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tab content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === "group_stage" && (
            <GroupMatchesTab
              predictions={state}
              onUpdate={handleUpdateMatch}
              readOnly={isPastDeadline}
            />
          )}
          {activeTab === "round_of_16" && (
            <KnockoutTab
              predictions={state}
              onUpdate={handleUpdateKnockout}
              readOnly={isPastDeadline}
              phaseFilter="round_of_16"
            />
          )}
          {activeTab === "quarter_finals" && (
            <KnockoutTab
              predictions={state}
              onUpdate={handleUpdateKnockout}
              readOnly={isPastDeadline}
              phaseFilter="quarter_finals"
            />
          )}
          {activeTab === "semi_finals" && (
            <KnockoutTab
              predictions={state}
              onUpdate={handleUpdateKnockout}
              readOnly={isPastDeadline}
              phaseFilter="semi_finals"
            />
          )}
          {activeTab === "final" && (
            <KnockoutTab
              predictions={state}
              onUpdate={handleUpdateKnockout}
              readOnly={isPastDeadline}
              phaseFilter="final"
            />
          )}
        </>
      )}

      {/* Sticky FAB */}
      {!isPastDeadline && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-tr from-primary to-primary-container text-on-primary-fixed font-bold px-10 py-4 rounded-full uppercase tracking-widest text-sm shadow-[0px_20px_40px_rgba(0,212,106,0.3)] flex items-center gap-3 active:scale-95 transition-transform disabled:opacity-70"
          >
            {isSaving ? "Guardando..." : "Guardar Quiniela"}
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      )}
    </div>
  );
}
