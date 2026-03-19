"use client";

import { useEffect, useState } from "react";
import { useRanking, type RankingEntry } from "@/lib/hooks/useRanking";
import { createClient } from "@/lib/supabase/client";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { SkeletonRows } from "@/components/ui/skeleton-rows";
import { EmptyState } from "@/components/ui/empty-state";

const ROWS_INITIAL = 10;

function formatMinutesAgo(isoDate: string | null): string {
  if (!isoDate) return "hace un momento";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "hace un momento";
  if (minutes === 1) return "hace 1 minuto";
  if (minutes < 60) return `hace ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "hace 1 hora";
  return `hace ${hours} horas`;
}

interface PodiumCardProps {
  entry: RankingEntry;
  position: 1 | 2 | 3;
  isCurrentUser: boolean;
}

function PodiumCard({ entry, position, isCurrentUser }: PodiumCardProps) {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  const borderClass = isFirst
    ? "ring-2 ring-gold shadow-[0_0_40px_rgba(245,166,35,0.2)]"
    : isSecond
    ? "ring-2 ring-silver/60"
    : "ring-2 ring-bronze/60";

  const pointsColorClass = isFirst ? "text-gold" : "text-white";
  const rankBgClass = isFirst
    ? "bg-gold text-black"
    : isSecond
    ? "bg-silver/20 text-silver border border-silver/40"
    : "bg-bronze/20 text-bronze border border-bronze/40";

  const avatarSize = isFirst ? "xl" : "lg";
  const nameSizeClass = isFirst ? "text-lg md:text-xl" : "text-sm md:text-base";
  const pointsSizeClass = isFirst
    ? "text-4xl md:text-[48px]"
    : "text-2xl md:text-[36px]";
  const subtitleClass = isFirst ? "text-gold text-xs" : "text-gray-muted text-[10px]";
  const subtitleText = isFirst ? "Líder Global" : "Puntos";

  const podiumHeightClass = isFirst
    ? "h-40"
    : isSecond
    ? "h-24"
    : "h-20";

  const podiumBgClass = isFirst
    ? "bg-gradient-to-b from-dark-card to-dark-bg"
    : "bg-dark-card opacity-40";

  return (
    <div className="flex flex-col items-center">
      {/* Avatar */}
      <div className="relative mb-4">
        {isFirst && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-gold text-2xl z-10">
            ★
          </div>
        )}
        <div className={`rounded-full ${borderClass} ${isFirst ? "p-0.5" : ""}`}>
          <AvatarWithFallback
            name={entry.name}
            avatarUrl={entry.avatar_url}
            size={avatarSize}
            className={isFirst ? "border-2 border-dark-bg" : ""}
          />
        </div>
        {/* Rank badge */}
        <div
          className={`absolute -bottom-2 ${isFirst ? "right-1" : "-right-1"} text-[10px] font-bold px-2 py-0.5 rounded-full ${rankBgClass}`}
        >
          {position}º
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className={`font-semibold ${nameSizeClass} text-white mb-1`}>
          {entry.name.split(" ")[0]}{" "}
          {entry.name.split(" ")[1]?.charAt(0)}.
          {isCurrentUser && (
            <span className="text-green-primary ml-1 text-xs">(Tú)</span>
          )}
        </p>
        <p className={`font-display ${pointsSizeClass} leading-none ${pointsColorClass}`}>
          {entry.total_points.toLocaleString("es-ES")}
        </p>
        <p className={`${subtitleClass} uppercase font-bold tracking-widest mt-1`}>
          {subtitleText}
        </p>
      </div>

      {/* Podium bar */}
      <div className={`w-full ${podiumHeightClass} ${podiumBgClass} rounded-t-xl mt-4`} />
    </div>
  );
}

export default function RankingPage() {
  const { ranking, lastCalculatedAt, isLoading } = useRanking();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const visibleRest = showAll ? rest : rest.slice(0, ROWS_INITIAL - 3);

  // Reorder podium: 2nd | 1st | 3rd
  const podiumOrder: (RankingEntry | undefined)[] = [top3[1], top3[0], top3[2]];
  const podiumPositions: (1 | 2 | 3)[] = [2, 1, 3];

  return (
    <div className="max-w-3xl mx-auto pt-4 md:pt-8 pb-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-display text-[40px] leading-none tracking-tight text-white mb-1 uppercase">
          Clasificación
        </h1>
        <p className="text-gray-muted text-sm uppercase tracking-wider">
          Mundial 2026 · Actualizado {formatMinutesAgo(lastCalculatedAt)}
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {/* Podium skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-12 h-64">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton-shimmer rounded-xl"
                style={{ height: i === 1 ? "260px" : "200px" }}
              />
            ))}
          </div>
          <SkeletonRows count={7} columns={3} />
        </div>
      ) : ranking.length === 0 ? (
        <EmptyState
          title="Sin puntuaciones"
          subtitle="Aún no hay puntuaciones. ¡El torneo no ha comenzado!"
        />
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <section className="grid grid-cols-3 items-end gap-2 md:gap-6 mb-14">
              {podiumOrder.map((entry, idx) => {
                if (!entry) return <div key={idx} />;
                return (
                  <PodiumCard
                    key={entry.user_id}
                    entry={entry}
                    position={podiumPositions[idx]}
                    isCurrentUser={entry.user_id === currentUserId}
                  />
                );
              })}
            </section>
          )}

          {/* Rankings table (4th place onwards) */}
          {rest.length > 0 && (
            <section className="space-y-2">
              {/* Table header */}
              <div className="flex items-center px-4 py-3 text-gray-muted text-[10px] font-bold uppercase tracking-[0.2em]">
                <div className="w-10">#</div>
                <div className="flex-1">Jugador</div>
                <div className="w-24 text-right">Puntos</div>
              </div>

              {/* Rows */}
              {visibleRest.map((entry) => {
                const isMe = entry.user_id === currentUserId;
                return (
                  <div
                    key={entry.user_id}
                    className={`group flex items-center rounded-xl p-4 transition-all cursor-pointer ${
                      isMe
                        ? "bg-green-primary/10 border-l-4 border-green-primary shadow-lg"
                        : "bg-dark-card hover:bg-dark-card-hover border-l-4 border-transparent"
                    }`}
                    style={{ minHeight: "56px" }}
                  >
                    <div
                      className={`w-10 font-display text-xl ${
                        isMe ? "text-green-primary" : "text-gray-muted group-hover:text-white"
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <AvatarWithFallback
                        name={entry.name}
                        avatarUrl={entry.avatar_url}
                        size="sm"
                        className={isMe ? "ring-2 ring-green-primary/30" : ""}
                      />
                      <div>
                        <p className="font-medium text-white text-sm">
                          {entry.name}
                          {isMe && (
                            <span className="text-green-primary ml-2 text-xs font-semibold">
                              (Tú)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <p
                        className={`font-display text-2xl ${
                          isMe ? "text-white" : "text-white/80 group-hover:text-white"
                        }`}
                      >
                        {entry.total_points.toLocaleString("es-ES")}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Show more button */}
              {!showAll && rest.length > ROWS_INITIAL - 3 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-6 text-gray-muted text-[10px] font-bold uppercase tracking-[0.3em] hover:text-green-primary transition-colors"
                >
                  Ver clasificación completa
                </button>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
