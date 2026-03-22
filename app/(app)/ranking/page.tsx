"use client";

import { useEffect, useState } from "react";
import { useRanking, type RankingEntry } from "@/lib/hooks/useRanking";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";

// ─── Podium card ────────────────────────────────────────────────────────────

interface PodiumCardProps {
  entry: RankingEntry;
  position: 1 | 2 | 3;
  isCurrentUser: boolean;
}

function PodiumCard({ entry, position, isCurrentUser }: PodiumCardProps) {
  const isFirst = position === 1;
  const isThird = position === 3;

  const displayName =
    `${entry.name.split(" ")[0]} ${entry.name.split(" ")[1]?.charAt(0) ?? ""}`.trim() +
    (entry.name.split(" ")[1] ? "." : "");

  if (isFirst) {
    return (
      <div className="order-1 md:order-2 scale-105 z-10">
        <div className="relative group bg-gradient-to-b from-surface-container-high to-surface-container-low rounded-xl p-10 pt-20 flex flex-col items-center shadow-[0px_40px_80px_rgba(0,0,0,0.6)] border-b-4 border-primary">
          {/* Avatar */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-[0_0_30px_rgba(66,241,131,0.3)]">
            <AvatarWithFallback
              name={entry.name}
              avatarUrl={entry.avatar_url}
              size="xl"
              className="w-full h-full rounded-full"
            />
          </div>
          {/* Trophy icon */}
          <div className="absolute top-4 right-4 text-primary">
            <span className="material-symbols-outlined text-4xl">workspace_premium</span>
          </div>
          {/* Rank */}
          <span className="font-bebas text-6xl text-primary mb-1 leading-none">01</span>
          {/* Name */}
          <h3 className="font-extrabold text-white text-2xl tracking-tight">
            {displayName}
            {isCurrentUser && (
              <span className="text-primary ml-2 text-sm font-bold">(Tú)</span>
            )}
          </h3>
          {/* Points */}
          <div className="flex items-center gap-3 mt-6 bg-primary/10 border border-primary/20 px-6 py-2 rounded-full">
            <span className="text-primary font-bebas text-4xl leading-none">
              {entry.total_points.toLocaleString("es-ES")}
            </span>
            <span className="text-xs text-primary/70 uppercase font-bold">PTS</span>
          </div>
          {/* Streak / trend */}
          <div className="mt-6 flex items-center gap-2 text-primary bg-primary/5 px-4 py-1 rounded-full text-sm font-bold">
            <span className="material-symbols-outlined text-base">trending_up</span>
            LÍDER GLOBAL
          </div>
        </div>
      </div>
    );
  }

  // Rank 2 and 3
  const orderClass = position === 2 ? "order-2 md:order-1" : "order-3";
  const borderClass = isThird ? "border-orange-900/30" : "border-white/10";

  return (
    <div className={orderClass}>
      <div
        className={`relative group bg-surface-container-low rounded-xl p-8 pt-16 flex flex-col items-center transition-all duration-500 hover:bg-surface-container-high border-b-4 ${borderClass}`}
      >
        {/* Avatar */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container shadow-2xl">
          <AvatarWithFallback
            name={entry.name}
            avatarUrl={entry.avatar_url}
            size="lg"
            className="w-full h-full rounded-full"
          />
        </div>
        {/* Rank */}
        <span className="font-bebas text-4xl text-gray-400 mb-1 leading-none">
          {String(position).padStart(2, "0")}
        </span>
        {/* Name */}
        <h3 className="font-bold text-white text-lg">
          {displayName}
          {isCurrentUser && (
            <span className="text-primary ml-1 text-xs font-bold">(Tú)</span>
          )}
        </h3>
        {/* Points */}
        <div className="flex items-center gap-2 mt-4 bg-surface-container-highest px-4 py-1 rounded-full">
          <span className="text-primary font-bebas text-2xl leading-none">
            {entry.total_points.toLocaleString("es-ES")}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">PTS</span>
        </div>
        {/* Trend */}
        <div
          className={`mt-4 flex items-center gap-1 text-xs font-bold ${
            isThird ? "text-error" : "text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isThird ? "trending_down" : "trending_up"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonPodium() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-20">
      {[2, 1, 3].map((pos) => (
        <div
          key={pos}
          className={`skeleton-shimmer rounded-xl ${
            pos === 1 ? "h-72 scale-105" : "h-56"
          }`}
        />
      ))}
    </section>
  );
}

function SkeletonTableRows({ count = 7 }: { count?: number }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="skeleton-shimmer w-8 h-6 rounded" />
          <div className="flex items-center gap-3 flex-1">
            <div className="skeleton-shimmer w-8 h-8 rounded-full" />
            <div className="skeleton-shimmer h-4 w-32 rounded" />
          </div>
          <div className="skeleton-shimmer h-3 w-24 rounded-full" />
          <div className="skeleton-shimmer h-5 w-14 rounded" />
          <div className="skeleton-shimmer h-5 w-5 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function RankingPage() {
  const { ranking, lastCalculatedAt, isLoading } = useRanking();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Lazy import to avoid SSR issues
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setCurrentUserId(data.user?.id ?? null);
      });
    });
  }, []);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const lastRank = ranking.length;
  const visibleRest = showAll ? rest : rest.slice(0, 10);

  // Podium order: 2nd (left) | 1st (center) | 3rd (right)
  const podiumOrder: Array<{ entry: RankingEntry | undefined; pos: 1 | 2 | 3 }> = [
    { entry: top3[1], pos: 2 },
    { entry: top3[0], pos: 1 },
    { entry: top3[2], pos: 3 },
  ];

  return (
    <div className="pb-24 px-0 md:px-0 pt-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-[2px] bg-primary inline-block" />
            <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">
              Season 2026
            </span>
          </div>
          <h1 className="font-bebas text-6xl md:text-8xl text-white leading-none tracking-tighter">
            GLOBAL LEADERBOARD
          </h1>
          <p className="text-gray-400 mt-4 max-w-xl text-sm leading-relaxed border-l border-white/10 pl-6">
            Seguimiento de los mejores predictores de la campaña 2026. Las puntuaciones
            se calculan en base a la precisión del resultado, diferencia de goles y
            rendimiento en predicciones de alto riesgo.
            {lastCalculatedAt && (
              <span className="block mt-1 text-xs text-gray-600">
                Actualizado{" "}
                {new Date(lastCalculatedAt).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </p>
        </header>

        {/* ── Loading ── */}
        {isLoading ? (
          <>
            <SkeletonPodium />
            <section className="mb-20">
              <div className="flex justify-between items-end mb-8">
                <div className="skeleton-shimmer h-10 w-64 rounded" />
                <div className="flex gap-2">
                  <div className="skeleton-shimmer h-9 w-20 rounded-lg" />
                  <div className="skeleton-shimmer h-9 w-20 rounded-lg" />
                </div>
              </div>
              <div className="overflow-hidden bg-surface-container-low/30 rounded-xl backdrop-blur-sm">
                <SkeletonTableRows count={7} />
              </div>
            </section>
          </>
        ) : ranking.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
              emoji_events
            </span>
            <h2 className="font-bebas text-3xl text-white mb-2">
              Aún no hay puntuaciones
            </h2>
            <p className="text-gray-500 text-sm max-w-xs">
              El torneo todavía no ha comenzado. ¡Vuelve pronto!
            </p>
          </div>
        ) : (
          <>
            {/* ── Podium ── */}
            {top3.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-20 mt-16">
                {podiumOrder.map(({ entry, pos }) => {
                  if (!entry) return <div key={pos} />;
                  return (
                    <PodiumCard
                      key={entry.user_id}
                      entry={entry}
                      position={pos}
                      isCurrentUser={entry.user_id === currentUserId}
                    />
                  );
                })}
              </section>
            )}

            {/* ── Rankings table ── */}
            {rest.length > 0 && (
              <section className="mb-20">
                {/* Table header row */}
                <div className="flex justify-between items-end mb-8">
                  <h2 className="font-bebas text-4xl text-white tracking-tight">
                    Rankings 04 — {String(lastRank).padStart(2, "0")}
                  </h2>
                  <div className="flex gap-2">
                    <button className="bg-surface-container-high px-4 py-2 rounded-lg text-xs font-bold text-white hover:bg-primary hover:text-on-primary transition-all">
                      WEEKLY
                    </button>
                    <button className="bg-surface-container-high px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-all">
                      ALL TIME
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-surface-container-low/30 rounded-xl backdrop-blur-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                          Rank
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                          Jugador
                        </th>
                        <th className="hidden md:table-cell px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                          Precisión
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">
                          Puntos
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">
                          Tendencia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {visibleRest.map((entry) => {
                        const isMe = entry.user_id === currentUserId;
                        // Derive a pseudo-accuracy from breakdown if available
                        const accuracyPct = Math.min(
                          100,
                          Math.max(
                            0,
                            Math.round(
                              (entry.total_points / Math.max(1, ranking[0]?.total_points ?? 1)) *
                                100
                            )
                          )
                        );
                        // Simple trend: top-half = up, mid = flat, bottom = down
                        const trendIcon =
                          entry.rank <= Math.ceil(ranking.length / 3)
                            ? "trending_up"
                            : entry.rank <= Math.ceil((2 * ranking.length) / 3)
                            ? "trending_flat"
                            : "trending_down";
                        const trendColor =
                          trendIcon === "trending_up"
                            ? "text-primary"
                            : trendIcon === "trending_flat"
                            ? "text-gray-500"
                            : "text-error";

                        return (
                          <tr
                            key={entry.user_id}
                            className={`group hover:bg-white/5 transition-colors ${
                              isMe ? "bg-primary/5" : ""
                            }`}
                          >
                            {/* Rank */}
                            <td className="px-6 py-4 font-bebas text-2xl text-gray-500">
                              {String(entry.rank).padStart(2, "0")}
                            </td>
                            {/* Player */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 overflow-hidden flex-shrink-0">
                                  <AvatarWithFallback
                                    name={entry.name}
                                    avatarUrl={entry.avatar_url}
                                    size="sm"
                                    className="w-full h-full"
                                  />
                                </div>
                                <span className="font-bold text-white text-sm tracking-tight">
                                  {entry.name.toUpperCase().replace(" ", "_")}
                                  {isMe && (
                                    <span className="text-primary ml-2 text-xs font-bold">
                                      (Tú)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </td>
                            {/* Accuracy */}
                            <td className="hidden md:table-cell px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                  <div
                                    className="bg-primary h-full rounded-full"
                                    style={{ width: `${accuracyPct}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-400">
                                  {accuracyPct}%
                                </span>
                              </div>
                            </td>
                            {/* Points */}
                            <td className="px-6 py-4 text-right font-bebas text-xl text-white">
                              {entry.total_points.toLocaleString("es-ES")}
                            </td>
                            {/* Trend */}
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`material-symbols-outlined ${trendColor}`}
                              >
                                {trendIcon}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Show more */}
                {!showAll && rest.length > 10 && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setShowAll(true)}
                      className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                        Show Full Leaderboard
                      </span>
                      <span className="material-symbols-outlined text-sm group-hover:translate-y-1 transition-transform">
                        expand_more
                      </span>
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
