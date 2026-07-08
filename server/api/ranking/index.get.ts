import { calcAwardPoints } from '../../utils/scoring'
import { resolvedTeams } from '../../utils/bracket'

const KNOCKOUT_SCAN_ORDER = ['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL']

const ROUND_LABELS: Record<string, string> = {
  R32: 'Dieciseisavos', R16: 'Octavos', QF: 'Cuartos', SF: 'Semifinales', THIRD_PLACE: '3er puesto', FINAL: 'Final',
}

// The knockout round currently being played/about to be played: the first
// round (bracket order) that still has an unplayed match.
function findCurrentKnockoutRound(
  matches: { round: string, home_score: number | null, away_score: number | null }[],
): string | null {
  return KNOCKOUT_SCAN_ORDER.find((round) => {
    const roundMatches = matches.filter(m => m.round === round)
    return roundMatches.length > 0 && roundMatches.some(m => m.home_score === null || m.away_score === null)
  }) ?? 'FINAL' // everything finished — keep attributing to the last round
}

function resolveWinner(
  match: { id: string, home_team_id: string | null, away_team_id: string | null, home_slot: string | null, away_slot: string | null },
  userPreds: Map<string, { home_score: number, away_score: number, home_advances: boolean | null }>,
  matchBySlot: Map<string, typeof match>,
  depth = 0,
): string | null {
  if (depth > 10) return null
  const pred = userPreds.get(match.id)
  if (!pred) return null

  const winnerIsHome = pred.home_score > pred.away_score
    ? true
    : pred.away_score > pred.home_score
      ? false
      : pred.home_advances

  if (winnerIsHome === null || winnerIsHome === undefined) return null
  if (winnerIsHome) {
    if (match.home_team_id) return match.home_team_id
    if (match.home_slot) {
      const parent = matchBySlot.get(match.home_slot)
      if (parent) return resolveWinner(parent, userPreds, matchBySlot, depth + 1)
    }
  }
  else {
    if (match.away_team_id) return match.away_team_id
    if (match.away_slot) {
      const parent = matchBySlot.get(match.away_slot)
      if (parent) return resolveWinner(parent, userPreds, matchBySlot, depth + 1)
    }
  }
  return null
}

export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()

  const [
    { data: users },
    { data: userScores },
    { data: config },
    { data: officialAwards },
    { data: allSideBets },
    { data: allTeams },
    { data: allMatches },
    { data: allPredictions },
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('user_scores').select('user_id, match_points'),
    supabase.from('scoring_config').select('*').single(),
    supabase.from('official_awards').select('*').single(),
    supabase.from('side_bets').select('*'),
    supabase.from('teams').select('id, name'),
    supabase.from('matches').select('id, match_no, round, group_letter, home_team_id, away_team_id, home_slot, away_slot, home_score, away_score, home_advances'),
    supabase.from('predictions').select('user_id, match_id, home_score, away_score, home_advances'),
  ])

  if (!users || !config) throw createError({ statusCode: 500 })

  const matchPointsByUser = new Map<string, number>()
  for (const row of userScores ?? []) {
    matchPointsByUser.set(row.user_id, row.match_points)
  }

  const teamById = new Map<string, string>()
  for (const team of allTeams ?? []) {
    teamById.set(team.id, team.name)
  }

  // slot "W89" → match with match_no 89
  type Match = NonNullable<typeof allMatches>[number]
  const matchBySlot = new Map<string, Match>()
  for (const m of allMatches ?? []) {
    matchBySlot.set(`W${m.match_no}`, m)
  }

  const theFinal = (allMatches ?? []).find(m => m.match_no === 104)
  const currentKnockoutRound = findCurrentKnockoutRound(allMatches ?? [])

  // group predictions by user
  const predsByUser = new Map<string, Map<string, { home_score: number, away_score: number, home_advances: boolean | null }>>()
  for (const pred of allPredictions ?? []) {
    if (!predsByUser.has(pred.user_id)) predsByUser.set(pred.user_id, new Map())
    predsByUser.get(pred.user_id)!.set(pred.match_id, pred)
  }

  const ranking = users.users.map((user) => {
    const matchPoints = matchPointsByUser.get(user.id) ?? 0
    const userBets = (allSideBets ?? []).find(b => b.user_id === user.id) ?? null
    const awardPoints = calcAwardPoints(userBets, officialAwards ?? null, config)

    const userPreds = predsByUser.get(user.id) ?? new Map()

    let winnerTeam: string | null = null
    if (theFinal) {
      const winnerTeamId = resolveWinner(theFinal, userPreds, matchBySlot)
      winnerTeam = winnerTeamId ? (teamById.get(winnerTeamId) ?? null) : null
    }

    // Count of matches in the CURRENT knockout round that are already
    // guaranteed not to score for this user — either because they've been
    // played and the user's own bracket picks didn't match who actually
    // played, or because they haven't been played yet but the real
    // participants are already known (from earlier results) and differ from
    // this user's predicted path. R32 is excluded — its slots are resolved
    // from group standings, which this rule was never meant to project.
    let advanceFails = 0
    for (const match of allMatches ?? []) {
      if (!currentKnockoutRound || match.round !== currentKnockoutRound || match.round === 'R32') continue
      const { real, predicted } = resolvedTeams(match, allMatches ?? [], userPreds)
      if (!real.home || !real.away) continue
      if (predicted.home === real.home && predicted.away === real.away) continue
      advanceFails++
    }

    return {
      id: user.id,
      email: user.email ?? '',
      name: user.user_metadata?.name ?? user.email ?? '',
      totalPoints: matchPoints + awardPoints,
      matchPoints,
      awardPoints,
      winnerTeam,
      advanceFails,
      advanceFailsRound: currentKnockoutRound ? (ROUND_LABELS[currentKnockoutRound] ?? null) : null,
    }
  })

  ranking.sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name))

  return ranking.map((entry, idx) => ({ ...entry, position: idx + 1 }))
})
