import useSWR from "swr";

export interface RankingEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  breakdown: Record<string, number>;
}

interface RankingResponse {
  ranking: RankingEntry[];
  last_calculated_at: string | null;
}

const fetcher = (url: string): Promise<RankingResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Error al cargar el ranking");
    return res.json();
  });

export function useRanking() {
  const { data, error, isLoading, mutate } = useSWR<RankingResponse>(
    "/api/ranking",
    fetcher,
    { refreshInterval: 60000 }
  );

  return {
    ranking: data?.ranking ?? [],
    lastCalculatedAt: data?.last_calculated_at ?? null,
    isLoading,
    error,
    mutate,
  };
}
