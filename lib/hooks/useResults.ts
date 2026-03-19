import useSWR from "swr";

export interface MatchTeam {
  id: string | null;
  name: string;
  short_name: string;
  flag_url: string | null;
}

export interface MatchResult {
  id: string;
  phase: string;
  group_name: string | null;
  home_team: MatchTeam;
  away_team: MatchTeam;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "live" | "finished";
  match_date: string;
}

interface ResultsResponse {
  results: MatchResult[];
}

const fetcher = (url: string): Promise<ResultsResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Error al cargar los resultados");
    return res.json();
  });

export function useResults(phase?: string) {
  const key = phase ? `/api/results?phase=${phase}` : "/api/results";

  const { data, error, isLoading, mutate } = useSWR<ResultsResponse>(
    key,
    fetcher,
    { refreshInterval: 60000 }
  );

  return {
    results: data?.results ?? [],
    isLoading,
    error,
    mutate,
  };
}
