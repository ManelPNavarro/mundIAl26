import useSWR from "swr";
import { useCallback } from "react";

export interface MatchPrediction {
  match_id: string;
  home_score: number | null;
  away_score: number | null;
}

export interface GroupPrediction {
  group_id: string;
  first_team_id: string | null;
  second_team_id: string | null;
  third_team_id: string | null;
}

export interface PredictionState {
  prediction_id: string | null;
  match_predictions: Record<string, MatchPrediction>;
  group_predictions: Record<string, GroupPrediction>;
  tournament_winner_team_id: string | null;
  mvp_player_id: string | null;
  top_scorer_player_id: string | null;
  best_goalkeeper_player_id: string | null;
}

interface ApiResponse {
  prediction: {
    id: string;
    tournament_winner_team_id: string | null;
    mvp_player_id: string | null;
    top_scorer_player_id: string | null;
    best_goalkeeper_player_id: string | null;
  } | null;
  match_predictions: Record<string, MatchPrediction>;
  group_predictions: Record<string, GroupPrediction>;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePredictions() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    "/api/predictions",
    fetcher,
    { revalidateOnFocus: false }
  );

  const state: PredictionState = {
    prediction_id: data?.prediction?.id ?? null,
    match_predictions: data?.match_predictions ?? {},
    group_predictions: data?.group_predictions ?? {},
    tournament_winner_team_id: data?.prediction?.tournament_winner_team_id ?? null,
    mvp_player_id: data?.prediction?.mvp_player_id ?? null,
    top_scorer_player_id: data?.prediction?.top_scorer_player_id ?? null,
    best_goalkeeper_player_id: data?.prediction?.best_goalkeeper_player_id ?? null,
  };

  const saveMatch = useCallback(
    async (matchId: string, homeScore: number, awayScore: number) => {
      // Optimistic update
      await mutate(
        async (current) => {
          await fetch("/api/predictions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "match",
              data: { match_id: matchId, home_score: homeScore, away_score: awayScore },
            }),
          });
          return current
            ? {
                ...current,
                match_predictions: {
                  ...current.match_predictions,
                  [matchId]: {
                    match_id: matchId,
                    home_score: homeScore,
                    away_score: awayScore,
                  },
                },
              }
            : current;
        },
        { revalidate: false }
      );
    },
    [mutate]
  );

  const saveGroup = useCallback(
    async (
      groupId: string,
      firstTeamId: string | null,
      secondTeamId: string | null,
      thirdTeamId: string | null
    ) => {
      await mutate(
        async (current) => {
          await fetch("/api/predictions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "group",
              data: {
                group_id: groupId,
                first_team_id: firstTeamId,
                second_team_id: secondTeamId,
                third_team_id: thirdTeamId,
              },
            }),
          });
          return current
            ? {
                ...current,
                group_predictions: {
                  ...current.group_predictions,
                  [groupId]: {
                    group_id: groupId,
                    first_team_id: firstTeamId,
                    second_team_id: secondTeamId,
                    third_team_id: thirdTeamId,
                  },
                },
              }
            : current;
        },
        { revalidate: false }
      );
    },
    [mutate]
  );

  const saveAwards = useCallback(
    async (field: string, id: string | null) => {
      await mutate(
        async (current) => {
          await fetch("/api/predictions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "awards",
              data: { [field]: id },
            }),
          });
          if (!current) return current;
          return {
            ...current,
            prediction: current.prediction
              ? { ...current.prediction, [field]: id }
              : current.prediction,
          };
        },
        { revalidate: false }
      );
    },
    [mutate]
  );

  const refetch = useCallback(() => mutate(), [mutate]);

  return {
    state,
    isLoading,
    error,
    saveMatch,
    saveGroup,
    saveAwards,
    refetch,
  };
}
