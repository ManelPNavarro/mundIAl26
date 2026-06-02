import { calcMatchPoints, calcAwardPoints } from '../../utils/scoring'
import { teamsMatch } from '../../utils/bracket'

export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()

  const [
    { data: users },
    { data: allMatches },
    { data: allPredictions },
    { data: config },
    { data: officialAwards },
    { data: allSideBets },
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('matches').select('id, match_no, round, group_letter, home_team_id, away_team_id, home_slot, away_slot, home_score, away_score, home_advances').order('match_no'),
    supabase.from('predictions').select('user_id, match_id, home_score, away_score, home_advances'),
    supabase.from('scoring_config').select('*').single(),
    supabase.from('official_awards').select('*').single(),
    supabase.from('side_bets').select('*'),
  ])

  if (!users || !config) throw createError({ statusCode: 500 })

  const finishedMatches = (allMatches ?? []).filter(m => m.home_score !== null)

  const predsByUser = new Map<string, Map<string, { home_score: number, away_score: number, home_advances: boolean | null }>>()
  for (const p of allPredictions ?? []) {
    if (!predsByUser.has(p.user_id)) predsByUser.set(p.user_id, new Map())
    predsByUser.get(p.user_id)!.set(p.match_id, {
      home_score: p.home_score,
      away_score: p.away_score,
      home_advances: p.home_advances,
    })
  }

  const ranking = users.users.map((user) => {
    const predMap = predsByUser.get(user.id) ?? new Map()
    let matchPoints = 0

    for (const match of finishedMatches) {
      if (match.home_score === null || match.away_score === null) continue
      const pred = predMap.get(match.id)
      if (!pred) continue

      if (match.round !== 'GROUP' && !teamsMatch(match, allMatches ?? [], predMap)) continue

      matchPoints += calcMatchPoints(
        pred,
        { ...match, home_score: match.home_score!, away_score: match.away_score! },
        config,
      )
    }

    const userBets = (allSideBets ?? []).find(b => b.user_id === user.id) ?? null
    const awardPoints = calcAwardPoints(userBets, officialAwards ?? null, config)

    return {
      id: user.id,
      email: user.email ?? '',
      name: user.user_metadata?.name ?? user.email ?? '',
      totalPoints: matchPoints + awardPoints,
      matchPoints,
      awardPoints,
    }
  })

  ranking.sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name))

  return ranking.map((entry, idx) => ({ ...entry, position: idx + 1 }))
})
