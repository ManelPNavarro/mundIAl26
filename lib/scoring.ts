// Scoring engine for mundIAl26
// Calculates user scores based on their predictions vs real match results

export interface ScoreBreakdown {
  exact_score: number;
  correct_winner: number;
  group_position_exact: number;
  knockout_qualifier: number;
  tournament_winner: number;
  mvp: number;
  top_scorer: number;
  best_goalkeeper: number;
  total: number;
}

// Helper: derive outcome from a scoreline
function getOutcome(home: number, away: number): "home" | "away" | "draw" {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

/**
 * Calculate the score breakdown for a single user within a competition.
 * Reads their predictions from the DB and compares against real results.
 */
export async function calculateUserScore(
  userId: string,
  competitionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<ScoreBreakdown> {
  const breakdown: ScoreBreakdown = {
    exact_score: 0,
    correct_winner: 0,
    group_position_exact: 0,
    knockout_qualifier: 0,
    tournament_winner: 0,
    mvp: 0,
    top_scorer: 0,
    best_goalkeeper: 0,
    total: 0,
  };

  // --- 1. Load scoring rules for this competition ---
  const { data: rulesData, error: rulesError } = await supabase
    .from("scoring_rules")
    .select("rule_key, points")
    .eq("competition_id", competitionId);

  if (rulesError) {
    console.error("Error fetching scoring_rules:", rulesError);
    return breakdown;
  }

  const rules: Record<string, number> = {};
  for (const rule of rulesData ?? []) {
    rules[rule.rule_key] = rule.points;
  }

  const pts = (key: string, fallback = 0) => rules[key] ?? fallback;

  // --- 2. Load user's prediction record for this competition ---
  const { data: prediction, error: predError } = await supabase
    .from("predictions")
    .select(
      "id, tournament_winner_team_id, mvp_player_id, top_scorer_player_id, best_goalkeeper_player_id"
    )
    .eq("user_id", userId)
    .eq("competition_id", competitionId)
    .maybeSingle();

  if (predError || !prediction) {
    return breakdown;
  }

  const predictionId: string = prediction.id;

  // --- 3. Load match predictions ---
  const { data: matchPredictions, error: mpError } = await supabase
    .from("match_predictions")
    .select("match_id, home_score, away_score")
    .eq("prediction_id", predictionId);

  if (mpError) {
    console.error("Error fetching match_predictions:", mpError);
  }

  if (matchPredictions && matchPredictions.length > 0) {
    const matchIds = matchPredictions.map(
      (mp: { match_id: string }) => mp.match_id
    );

    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("id, home_score, away_score, status")
      .in("id", matchIds)
      .eq("competition_id", competitionId)
      .eq("status", "finished");

    if (matchError) {
      console.error("Error fetching matches:", matchError);
    }

    if (matches && matches.length > 0) {
      const realResults: Record<
        string,
        { home_score: number; away_score: number }
      > = {};
      for (const m of matches) {
        if (m.home_score !== null && m.away_score !== null) {
          realResults[m.id] = {
            home_score: m.home_score,
            away_score: m.away_score,
          };
        }
      }

      for (const mp of matchPredictions) {
        const real = realResults[mp.match_id];
        if (!real) continue;

        const predHome: number = mp.home_score;
        const predAway: number = mp.away_score;
        const realHome: number = real.home_score;
        const realAway: number = real.away_score;

        if (predHome === realHome && predAway === realAway) {
          breakdown.exact_score += pts("exact_score", 3);
        } else if (getOutcome(predHome, predAway) === getOutcome(realHome, realAway)) {
          breakdown.correct_winner += pts("correct_winner", 1);
        }
      }
    }
  }

  // --- 4. Tournament winner ---
  const { data: winnerSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", `tournament_winner_${competitionId}`)
    .maybeSingle();

  if (
    winnerSetting?.value &&
    prediction.tournament_winner_team_id === winnerSetting.value
  ) {
    breakdown.tournament_winner = pts("tournament_winner", 5);
  }

  // --- 5. MVP ---
  const { data: mvpSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", `actual_mvp_${competitionId}`)
    .maybeSingle();

  if (mvpSetting?.value && prediction.mvp_player_id === mvpSetting.value) {
    breakdown.mvp = pts("mvp", 3);
  }

  // --- 6. Top scorer ---
  const { data: topScorerSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", `actual_top_scorer_${competitionId}`)
    .maybeSingle();

  if (
    topScorerSetting?.value &&
    prediction.top_scorer_player_id === topScorerSetting.value
  ) {
    breakdown.top_scorer = pts("top_scorer", 3);
  }

  // --- 7. Best goalkeeper ---
  const { data: gkSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", `actual_best_goalkeeper_${competitionId}`)
    .maybeSingle();

  if (
    gkSetting?.value &&
    prediction.best_goalkeeper_player_id === gkSetting.value
  ) {
    breakdown.best_goalkeeper = pts("best_goalkeeper", 3);
  }

  // --- 8. Sum total ---
  breakdown.total =
    breakdown.exact_score +
    breakdown.correct_winner +
    breakdown.group_position_exact +
    breakdown.knockout_qualifier +
    breakdown.tournament_winner +
    breakdown.mvp +
    breakdown.top_scorer +
    breakdown.best_goalkeeper;

  // --- 9. Upsert into scores table ---
  const { error: upsertError } = await supabase.from("scores").upsert(
    {
      user_id: userId,
      competition_id: competitionId,
      total_points: breakdown.total,
      breakdown: breakdown as unknown as Record<string, number>,
      last_calculated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,competition_id" }
  );

  if (upsertError) {
    console.error("Error upserting score for user", userId, upsertError);
  }

  return breakdown;
}

/**
 * Recalculate scores for ALL users in a competition.
 * Returns the number of users processed.
 */
export async function recalculateAllScores(
  competitionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<number> {
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id");

  if (usersError || !users) {
    console.error("Error fetching users:", usersError);
    return 0;
  }

  let processed = 0;

  for (const user of users) {
    try {
      await calculateUserScore(user.id, competitionId, supabase);
      processed++;
    } catch (err) {
      console.error(`Error calculating score for user ${user.id}:`, err);
    }
  }

  return processed;
}
