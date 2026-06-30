type ScoringConfig = Record<string, number>

type MatchResult = 'HOME' | 'AWAY' | 'DRAW'

function matchResult(home: number, away: number): MatchResult {
  if (home > away) return 'HOME'
  if (away > home) return 'AWAY'
  return 'DRAW'
}

function configKeyForRound(round: string): { correct: string, exact: string, advance: string } {
  const map: Record<string, string> = {
    GROUP: 'group', R32: 'r32', R16: 'r16',
    QF: 'qf', SF: 'sf', THIRD_PLACE: 'third_place', FINAL: 'final',
  }
  const prefix = map[round] ?? 'group'
  return { correct: `${prefix}_correct`, exact: `${prefix}_exact`, advance: `${prefix}_advance` }
}

// Which team advances given a scoreline + penalty tiebreaker. Returns null when
// undeterminable (a predicted draw with no advancing pick).
function advancingSide(home: number, away: number, homeAdvances: boolean | null): 'home' | 'away' | null {
  if (home > away) return 'home'
  if (away > home) return 'away'
  if (homeAdvances === true) return 'home'
  if (homeAdvances === false) return 'away'
  return null
}

export function calcMatchPoints(
  prediction: { home_score: number, away_score: number, home_advances: boolean | null },
  result: { home_score: number, away_score: number, home_advances: boolean | null, round: string },
  config: ScoringConfig,
): number {
  const keys = configKeyForRound(result.round)
  const isExact = prediction.home_score === result.home_score && prediction.away_score === result.away_score
  if (isExact) return config[keys.exact] ?? 0

  const predResult = matchResult(prediction.home_score, prediction.away_score)
  const realResult = matchResult(result.home_score, result.away_score)

  // Correct outcome (who wins / draw). For knockout draws decided by penalties,
  // "correct" also requires guessing the team that advances.
  if (realResult === 'DRAW' && result.home_advances !== null) {
    const predAdvances = prediction.home_score === prediction.away_score
      ? prediction.home_advances
      : predResult === 'HOME' ? true : false
    if (predAdvances === result.home_advances) return config[keys.correct] ?? 0
  } else if (predResult === realResult) {
    return config[keys.correct] ?? 0
  }

  // Advance tier: outcome was wrong, but the predicted advancing team is the one
  // that actually advanced (e.g. predicted a draw + win on pens, real is a win).
  const realAdvances = advancingSide(result.home_score, result.away_score, result.home_advances)
  const predAdvances = advancingSide(prediction.home_score, prediction.away_score, prediction.home_advances)
  if (realAdvances && predAdvances && realAdvances === predAdvances) return config[keys.advance] ?? 0

  return 0
}

export function calcAwardPoints(
  bets: { winner_team_id: string | null, best_player: string | null, best_young_player: string | null, top_scorer: string | null, best_goalkeeper: string | null } | null,
  official: { winner_team_id: string | null, best_player: string | null, best_young_player: string | null, top_scorer: string | null, best_goalkeeper: string | null } | null,
  config: ScoringConfig,
): number {
  if (!bets || !official) return 0
  let pts = 0
  if (bets.best_player && official.best_player && bets.best_player.trim().toLowerCase() === official.best_player.trim().toLowerCase()) pts += config.award_best_player ?? 0
  if (bets.best_young_player && official.best_young_player && bets.best_young_player.trim().toLowerCase() === official.best_young_player.trim().toLowerCase()) pts += config.award_best_young_player ?? 0
  if (bets.top_scorer && official.top_scorer && bets.top_scorer.trim().toLowerCase() === official.top_scorer.trim().toLowerCase()) pts += config.award_top_scorer ?? 0
  if (bets.best_goalkeeper && official.best_goalkeeper && bets.best_goalkeeper.trim().toLowerCase() === official.best_goalkeeper.trim().toLowerCase()) pts += config.award_best_goalkeeper ?? 0
  return pts
}
