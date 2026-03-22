"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_POINTS: Record<string, number> = {
  exact_score: 10,
  correct_winner: 5,
  goal_difference: 3,
  group_position: 15,
  golden_boot: 50,
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
      if (!res.ok) throw new Error("Failed to load rules");
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
      if (!res.ok) throw new Error("Failed to save");
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
        `Recalculated for ${data.recalculated} users in ${data.durationMs}ms`
      );
    } catch (err) {
      console.error(err);
      setRecalcMsg("Error recalculating scores");
    } finally {
      setRecalculating(false);
    }
  }

  function setPointValue(key: string, val: string) {
    setPoints((p) => ({
      ...p,
      [key]: Math.max(0, parseInt(val) || 0),
    }));
  }

  return (
    <div className="px-6 md:px-12 pt-8 pb-20">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="font-bebas text-5xl md:text-7xl text-white tracking-tight leading-none mb-4">
          Game Scoring <span className="text-primary">Configuration</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl font-medium">
          Establish the mathematical DNA of the World Cup 2026. Set point distributions for match
          results, positional accuracy, and knockout progression.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 h-72 bg-surface-container-low rounded-xl animate-pulse" />
          <div className="md:col-span-4 h-72 bg-surface-container-high rounded-xl animate-pulse" />
          <div className="md:col-span-12 h-48 bg-surface-container-low rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Match Day Rewards (8 cols) */}
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 relative overflow-hidden group">
              {/* Left green accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bebas text-2xl text-white tracking-wide">Match Day Rewards</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Core gameplay points</p>
                </div>
                <span className="material-symbols-outlined text-primary-container/30 text-5xl select-none">
                  sports_score
                </span>
              </div>

              <div className="space-y-2">
                {/* Exact Score */}
                <div className="flex items-center justify-between hover:bg-surface-container-high p-4 rounded-lg transition-colors">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface">Exact Score</label>
                    <span className="text-xs text-gray-500">Correct goals for both teams</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={0}
                      value={points["exact_score"] ?? 10}
                      onChange={(e) => setPointValue("exact_score", e.target.value)}
                      className="w-20 bg-surface-container-lowest border-none rounded-lg text-center font-bold text-primary focus:ring-1 focus:ring-primary/50 py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-gray-600 uppercase">PTS</span>
                  </div>
                </div>

                {/* Outcome W/D/L */}
                <div className="flex items-center justify-between hover:bg-surface-container-high p-4 rounded-lg transition-colors">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface">Outcome (W/D/L)</label>
                    <span className="text-xs text-gray-500">Correct winner or draw result</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={0}
                      value={points["correct_winner"] ?? 5}
                      onChange={(e) => setPointValue("correct_winner", e.target.value)}
                      className="w-20 bg-surface-container-lowest border-none rounded-lg text-center font-bold text-primary focus:ring-1 focus:ring-primary/50 py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-gray-600 uppercase">PTS</span>
                  </div>
                </div>

                {/* Goal Difference */}
                <div className="flex items-center justify-between hover:bg-surface-container-high p-4 rounded-lg transition-colors">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface">Goal Difference</label>
                    <span className="text-xs text-gray-500">Exact spread between scores</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={0}
                      value={points["goal_difference"] ?? 3}
                      onChange={(e) => setPointValue("goal_difference", e.target.value)}
                      className="w-20 bg-surface-container-lowest border-none rounded-lg text-center font-bold text-primary focus:ring-1 focus:ring-primary/50 py-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-gray-600 uppercase">PTS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Tournament Meta (4 cols) */}
            <div className="md:col-span-4 bg-surface-container-high rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bebas text-xl text-white tracking-wide mb-2">Tournament Meta</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Seasonal Bonuses</p>

                <div className="space-y-4">
                  <div className="bg-surface-container-lowest p-4 rounded-lg">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1">
                      Group Position
                    </label>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-white tracking-tight">Top 2 Match</span>
                      <span className="text-primary font-bold">
                        +{points["group_position"] ?? 15}
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-4 rounded-lg">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1">
                      Golden Boot Winner
                    </label>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-white tracking-tight">Exact Player</span>
                      <span className="text-primary font-bold">
                        +{points["golden_boot"] ?? 50}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary rounded-full" />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Complexity Index: High Accuracy</p>
              </div>
            </div>

            {/* Card 3: The Multiplier Logic (12 cols) */}
            <div className="md:col-span-12 bg-surface-container-low rounded-xl p-8 flex flex-col md:flex-row items-center gap-12">
              <div className="shrink-0">
                <div className="w-32 h-32 rounded-full bg-surface-container-high border-4 border-primary/20 flex items-center justify-center relative">
                  <span className="material-symbols-outlined text-primary text-5xl">auto_awesome</span>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-full">
                    AI TIER
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-bebas text-3xl text-white tracking-wide mb-2">The Multiplier Logic</h3>
                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Define dynamic scaling for knockout stages. Points earned in Round of 16,
                  Quarter-Finals, and beyond can be multiplied by a global factor to reward
                  late-stage tournament knowledge.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-3 bg-surface-container-lowest rounded-xl border border-white/5 flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">R16 Factor</span>
                    <span className="text-xl font-bold text-white">x 1.5</span>
                  </div>
                  <div className="px-6 py-3 bg-surface-container-lowest rounded-xl border border-white/5 flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">QF Factor</span>
                    <span className="text-xl font-bold text-white">x 2.0</span>
                  </div>
                  <div className="px-6 py-3 bg-surface-container-lowest rounded-xl border border-white/5 flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Final Factor</span>
                    <span className="text-xl font-bold text-white">x 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recalculate button (shown after save) */}
          {showRecalculate && (
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="bg-secondary hover:opacity-90 text-on-primary font-bold px-8 py-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
              >
                {recalculating ? "Recalculating..." : "Recalculate Scores"}
              </button>
              {recalcMsg && (
                <p className="text-gray-500 text-sm">{recalcMsg}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-12 flex items-center justify-end gap-4">
            <button
              onClick={handleDiscard}
              disabled={!isDirty || saving}
              className="px-8 py-4 rounded-xl font-bold text-sm text-white hover:text-primary transition-colors disabled:opacity-30"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="px-12 py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm tracking-widest uppercase shadow-[0px_20px_40px_rgba(0,212,106,0.15)] hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
