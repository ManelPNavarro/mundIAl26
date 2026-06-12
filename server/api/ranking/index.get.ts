import { calcAwardPoints } from '../../utils/scoring'

export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()

  const [
    { data: users },
    { data: matchPointRows },
    { data: config },
    { data: officialAwards },
    { data: allSideBets },
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('user_match_points').select('user_id, points'),
    supabase.from('scoring_config').select('*').single(),
    supabase.from('official_awards').select('*').single(),
    supabase.from('side_bets').select('*'),
  ])

  if (!users || !config) throw createError({ statusCode: 500 })

  const matchPointsByUser = new Map<string, number>()
  for (const row of matchPointRows ?? []) {
    matchPointsByUser.set(row.user_id, (matchPointsByUser.get(row.user_id) ?? 0) + row.points)
  }

  const ranking = users.users.map((user) => {
    const matchPoints = matchPointsByUser.get(user.id) ?? 0
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
