export default defineEventHandler(async (event) => {
  await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID de partido requerido' })

  const supabase = useSupabaseAdmin()

  const [
    { data: match },
    { data: roundLockRows },
    { data: matchPredictions },
    { data: matchPoints },
    { data: users },
    { data: config },
  ] = await Promise.all([
    supabase.from('matches')
      .select('id, match_no, round, group_letter, kickoff_at, status, home_score, away_score, home_advances, home_team:home_team_id(id, name), away_team:away_team_id(id, name)')
      .eq('id', id).single(),
    supabase.from('round_locks').select('round, is_open'),
    supabase.from('predictions')
      .select('user_id, home_score, away_score, home_advances')
      .eq('match_id', id),
    supabase.from('user_match_points')
      .select('user_id, points')
      .eq('match_id', id),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('scoring_config').select('*').single(),
  ])

  if (!match) throw createError({ statusCode: 404, message: 'Partido no encontrado' })

  const locks = new Map((roundLockRows ?? []).map(r => [r.round, r.is_open]))
  if (locks.get(match.round) === true) {
    throw createError({ statusCode: 403, message: 'Las predicciones de esta fase aún están abiertas' })
  }

  const now = Date.now()
  const kickoff = match.kickoff_at ? new Date(match.kickoff_at).getTime() : null
  const in24h = now + 24 * 60 * 60 * 1000
  if (kickoff && kickoff > in24h) {
    throw createError({ statusCode: 403, message: 'Este partido aún no está disponible' })
  }

  const userMap = new Map<string, { name: string, email: string }>()
  for (const u of users?.users ?? []) {
    userMap.set(u.id, {
      name: u.user_metadata?.name ?? u.email ?? '',
      email: u.email ?? '',
    })
  }

  const pointsMap = new Map<string, number>()
  for (const row of matchPoints ?? []) {
    pointsMap.set(row.user_id, row.points)
  }

  const predMap = new Map<string, { home_score: number, away_score: number, home_advances: boolean | null }>()
  for (const p of matchPredictions ?? []) {
    predMap.set(p.user_id, p)
  }

  const isFinished = match.home_score !== null && match.away_score !== null

  type Outcome = 'HOME' | 'DRAW' | 'AWAY'
  function getOutcome(home: number, away: number): Outcome {
    if (home > away) return 'HOME'
    if (away > home) return 'AWAY'
    return 'DRAW'
  }

  const realOutcome = isFinished ? getOutcome(match.home_score!, match.away_score!) : null

  type Category = 'exact' | 'correct' | 'advance' | 'wrong' | 'no_prediction'
  const categoryOrder: Record<Category, number> = { exact: 0, correct: 1, advance: 2, wrong: 3, no_prediction: 4 }
  const outcomeOrder: Record<Outcome | 'NONE', number> = { HOME: 0, DRAW: 1, AWAY: 2, NONE: 3 }

  // Tier point values for this round, used to label each entry from its actual
  // stored points (so the category matches real scoring, incl. the teams gate).
  const ROUND_PREFIX: Record<string, string> = {
    GROUP: 'group', R32: 'r32', R16: 'r16', QF: 'qf', SF: 'sf', THIRD_PLACE: 'third_place', FINAL: 'final',
  }
  const prefix = ROUND_PREFIX[match.round] ?? 'group'
  const exactPts = config?.[`${prefix}_exact`] ?? 0
  const correctPts = config?.[`${prefix}_correct`] ?? 0
  const advancePts = config?.[`${prefix}_advance`] ?? 0

  const entries = [...userMap.entries()].map(([userId, { name, email }]) => {
    const pred = predMap.get(userId)
    const points = pointsMap.get(userId) ?? 0

    let category: Category = 'no_prediction'
    if (pred && isFinished) {
      if (points > 0 && points === exactPts) category = 'exact'
      else if (points > 0 && points === correctPts) category = 'correct'
      else if (points > 0 && points === advancePts) category = 'advance'
      else category = 'wrong'
    } else if (pred) {
      category = 'wrong'
    }

    return {
      userId,
      name,
      email,
      homeScore: pred?.home_score ?? null,
      awayScore: pred?.away_score ?? null,
      homeAdvances: pred?.home_advances ?? null,
      points,
      category,
    }
  })

  entries.sort((a, b) => {
    if (isFinished) {
      if (categoryOrder[a.category] !== categoryOrder[b.category])
        return categoryOrder[a.category] - categoryOrder[b.category]
    }

    const aOutcome = a.homeScore !== null ? getOutcome(a.homeScore, a.awayScore!) : 'NONE'
    const bOutcome = b.homeScore !== null ? getOutcome(b.homeScore, b.awayScore!) : 'NONE'
    if (outcomeOrder[aOutcome] !== outcomeOrder[bOutcome])
      return outcomeOrder[aOutcome] - outcomeOrder[bOutcome]

    const aDiff = (a.homeScore ?? 0) - (a.awayScore ?? 0)
    const bDiff = (b.homeScore ?? 0) - (b.awayScore ?? 0)
    if (Math.abs(aDiff) !== Math.abs(bDiff))
      return Math.abs(bDiff) - Math.abs(aDiff)

    return a.name.localeCompare(b.name)
  })

  return {
    match: {
      id: match.id,
      match_no: match.match_no,
      round: match.round,
      group_letter: match.group_letter,
      kickoff_at: match.kickoff_at,
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
      home_advances: match.home_advances,
      home_team: match.home_team,
      away_team: match.away_team,
    },
    predictions: entries,
  }
})
