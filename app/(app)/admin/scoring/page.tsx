"use client";

import { useState, useEffect, useCallback } from "react";
import { Target, Trophy, List, ArrowUpRight, Star, Award, Zap, Shield } from "lucide-react";

interface ScoringRule {
  rule_key: string;
  points: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  wide?: boolean;
}

const RULE_DEFINITIONS: Omit<ScoringRule, "points">[] = [
  {
    rule_key: "exact_score",
    label: "Marcador exacto",
    description: "Puntos otorgados por acertar el número exacto de goles de ambos equipos.",
    icon: <Target size={28} />,
    badge: "Popular",
  },
  {
    rule_key: "correct_winner",
    label: "Ganador / empate",
    description: "Puntos por acertar el resultado (1X2) sin necesidad de acertar el marcador.",
    icon: <Trophy size={28} />,
  },
  {
    rule_key: "group_position",
    label: "Posición grupo",
    description: "Acierto de la posición final exacta de una selección en la fase de grupos.",
    icon: <List size={28} />,
  },
  {
    rule_key: "knockout_qualifier",
    label: "Clasificado",
    description: "Puntos por predecir correctamente qué equipo pasa a la siguiente ronda.",
    icon: <ArrowUpRight size={28} />,
  },
  {
    rule_key: "tournament_winner",
    label: "Campeón Mundial",
    description: "El acierto máximo: predecir la selección que levantará la copa.",
    icon: <Star size={28} />,
  },
  {
    rule_key: "mvp",
    label: "MVP del torneo",
    description: "Puntos por acertar al ganador del Balón de Oro del Mundial.",
    icon: <Award size={28} />,
    wide: true,
  },
  {
    rule_key: "top_scorer",
    label: "Máximo goleador",
    description: "Acierto del jugador que obtenga la Bota de Oro.",
    icon: <Zap size={28} />,
    wide: true,
  },
  {
    rule_key: "best_goalkeeper",
    label: "Mejor portero",
    description: "Acierto del Guante de Oro del torneo.",
    icon: <Shield size={28} />,
    wide: true,
  },
];

const DEFAULT_POINTS: Record<string, number> = {
  exact_score: 10,
  correct_winner: 3,
  group_position: 5,
  knockout_qualifier: 2,
  tournament_winner: 25,
  mvp: 15,
  top_scorer: 15,
  best_goalkeeper: 15,
};

export default function AdminScoringPage() {
  const [points, setPoints] = useState<Record<string, number>>(DEFAULT_POINTS);
  const [savedPoints, setSavedPoints] = useState<Record<string, number>>(DEFAULT_POINTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRecalculate, setShowRecalculate] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState("");

  const isDirty = JSON.stringify(points) !== JSON.stringify(savedPoints);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scoring");
      if (!res.ok) throw new Error("Error al cargar reglas");
      const data: { rules: { rule_key: string; points: number }[] } = await res.json();
      const map: Record<string, number> = { ...DEFAULT_POINTS };
      for (const rule of data.rules) {
        map[rule.rule_key] = rule.points;
      }
      setPoints(map);
      setSavedPoints(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function handleSave() {
    setSaving(true);
    try {
      const rules = Object.entries(points).map(([rule_key, pts]) => ({
        rule_key,
        points: pts,
      }));
      const res = await fetch("/api/admin/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSavedPoints({ ...points });
      setShowRecalculate(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setPoints({ ...savedPoints });
  }

  async function handleRecalculate() {
    setRecalculating(true);
    setRecalcMsg("");
    try {
      const res = await fetch("/api/recalculate-scores", { method: "POST" });
      const data = await res.json();
      setRecalcMsg(
        `Recalculado para ${data.recalculated} usuarios en ${data.durationMs}ms`
      );
    } catch (err) {
      console.error(err);
      setRecalcMsg("Error al recalcular");
    } finally {
      setRecalculating(false);
    }
  }

  const narrowRules = RULE_DEFINITIONS.filter((r) => !r.wide);
  const wideRules = RULE_DEFINITIONS.filter((r) => r.wide);

  return (
    <div className="pb-32">
      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="mb-8 bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500 shrink-0"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">CAMBIOS SIN GUARDAR</p>
              <p className="text-gray-muted text-xs">
                Recuerda{" "}
                <span className="text-amber-500 font-semibold">Recalcular puntuaciones</span>{" "}
                después de guardar para que se reflejen en los perfiles de usuario.
              </p>
            </div>
          </div>
          <button
            onClick={handleDiscard}
            className="text-xs font-bold text-amber-500 uppercase tracking-widest hover:bg-amber-500/10 px-3 py-1 rounded transition-colors"
          >
            Ignorar
          </button>
        </div>
      )}

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-display text-5xl md:text-6xl tracking-tight text-white mb-2 leading-none">
          Reglas de <span className="text-green-primary">Puntuación</span>
        </h1>
        <p className="text-gray-muted text-base max-w-2xl font-light italic">
          Define los valores de cada acierto. Ten en cuenta que cualquier ajuste impactará
          globalmente a todos los participantes del torneo activo.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-dark-card p-6 rounded-2xl border border-dark-border animate-pulse h-40"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Narrow cards */}
          {narrowRules.map((rule) => (
            <div
              key={rule.rule_key}
              className="bg-dark-card p-6 rounded-2xl border border-dark-border hover:border-green-primary/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-green-primary">{rule.icon}</span>
                  {rule.badge && (
                    <span className="text-[10px] text-green-primary bg-green-primary/10 px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">
                      {rule.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl text-white tracking-wide">{rule.label}</h3>
                <p className="text-gray-muted text-xs mt-1 leading-relaxed">{rule.description}</p>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div className="text-[10px] uppercase font-bold text-gray-muted tracking-widest">
                  Valor puntos
                </div>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={points[rule.rule_key] ?? 0}
                  onChange={(e) =>
                    setPoints((p) => ({
                      ...p,
                      [rule.rule_key]: Math.max(0, parseInt(e.target.value) || 0),
                    }))
                  }
                  className="bg-[#2a2a2a] border-none rounded-xl text-green-primary font-display text-4xl w-24 text-right focus:ring-1 focus:ring-green-primary/50 py-1 px-4 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          ))}

          {/* Section divider for individual awards */}
          <div className="col-span-full mt-4 mb-2">
            <h2 className="font-display text-3xl text-white border-b border-dark-border pb-2">
              Premios individuales
            </h2>
          </div>

          {/* Wide cards */}
          {wideRules.map((rule) => (
            <div
              key={rule.rule_key}
              className="col-span-1 lg:col-span-3 bg-dark-card p-6 rounded-2xl border border-dark-border hover:border-green-primary/30 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-green-primary/10 rounded-full flex items-center justify-center text-green-primary">
                  {rule.icon}
                </div>
                <div>
                  <h3 className="font-display text-2xl text-white tracking-wide">{rule.label}</h3>
                  <p className="text-gray-muted text-xs">{rule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase font-bold text-gray-muted tracking-widest hidden md:block">
                  Asignación de puntos
                </span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={points[rule.rule_key] ?? 0}
                  onChange={(e) =>
                    setPoints((p) => ({
                      ...p,
                      [rule.rule_key]: Math.max(0, parseInt(e.target.value) || 0),
                    }))
                  }
                  className="bg-[#2a2a2a] border-none rounded-xl text-green-primary font-display text-4xl w-32 text-right focus:ring-1 focus:ring-green-primary/50 py-2 px-4 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recalculate button (shown after save) */}
      {showRecalculate && (
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded-xl uppercase text-xs tracking-[0.2em] shadow-[0px_10px_30px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            {recalculating ? "Recalculando..." : "Recalcular Puntuaciones"}
          </button>
          {recalcMsg && (
            <p className="text-gray-muted text-sm">{recalcMsg}</p>
          )}
        </div>
      )}

      {/* Floating action footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-dark-bg via-dark-bg/90 to-transparent pointer-events-none">
        <div className="max-w-[1200px] mx-auto flex justify-end gap-4 pointer-events-auto">
          <button
            onClick={handleDiscard}
            disabled={!isDirty || saving}
            className="px-8 py-4 rounded-xl font-bold text-gray-muted uppercase text-xs tracking-[0.2em] hover:text-white hover:bg-dark-card transition-all disabled:opacity-30"
          >
            Descartar cambios
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="bg-green-primary hover:bg-green-dim px-12 py-4 rounded-xl font-extrabold text-[#003918] uppercase text-xs tracking-[0.2em] shadow-[0px_20px_40px_rgba(0,212,106,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
