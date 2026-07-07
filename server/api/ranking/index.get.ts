import { calcAwardPoints, missedAdvanceGuess } from '../../utils/scoring'
import { teamsMatch } from '../../utils/bracket'

const KNOCKOUT_SCAN_ORDER = ['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL']

// THIRD_PLACE and FINAL are siblings fed by SF, not sequential to each other,
// so this is an explicit dependency map rather than "the previous array entry."
const PREVIOUS_KNOCKOUT_ROUND: Record<string, string | null> = {
  R32: null,
  R16: 'R32',
  QF: 'R16',
  SF: 'QF',
  THIRD_PLACE: 'SF',
  FINAL: 'SF',
}

const ROUND_LABELS: Record<string, string> = {
  R32: 'Dieciseisavos', R16: 'Octavos', QF: 'Cuartos', SF: 'Semifinales', THIRD_PLACE: '3er puesto', FINAL: 'Final',
}

function findPreviousKnockoutRound(
  matches: { round: string, home_score: number | null, away_score: number | null }[],
): string | null {
  const currentRound = KNOCKOUT_SCAN_ORDER.find((round) => {
    const roundMatches = matches.filter(m => m.round === round)
    return roundMatches.length > 0 && roundMatches.some(m => m.home_score === null || m.away_score === null)
  }) ?? 'FINAL' // everything finished — keep attributing to the last round's dependency (SF)
  return PREVIOUS_KNOCKOUT_ROUND[currentRound] ?? null
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
  const previousKnockoutRound = findPreviousKnockoutRound(allMatches ?? [])

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

    let advanceFails = 0
    for (const match of allMatches ?? []) {
      if (!previousKnockoutRound || match.round !== previousKnockoutRound) continue
      if (match.home_score === null || match.away_score === null) continue
      const pred = userPreds.get(match.id)
      if (!pred) continue
      if (!teamsMatch(match, allMatches ?? [], userPreds)) continue
      if (missedAdvanceGuess(pred, { home_score: match.home_score, away_score: match.away_score, home_advances: match.home_advances })) advanceFails++
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
      advanceFailsRound: previousKnockoutRound ? (ROUND_LABELS[previousKnockoutRound] ?? null) : null,
    }
  })

  ranking.sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name))

  return ranking.map((entry, idx) => ({ ...entry, position: idx + 1 }))
})
