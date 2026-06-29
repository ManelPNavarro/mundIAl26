export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  const supabase = useSupabaseAdmin()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401 })

  const [{ data: locks }, { data: matches }] = await Promise.all([
    supabase.from('round_locks').select('round, is_open'),
    supabase.from('matches').select('id, round, home_score, kickoff_at'),
  ])

  const openRounds = new Set((locks ?? []).filter(l => l.is_open).map(l => l.round))
  const matchById = new Map((matches ?? []).map(m => [m.id, m]))

  const body = await readBody<Record<string, { home: number, away: number, homeAdvances?: boolean | null }>>(event)

  const TEMP_UNLOCK_USER_ID = '1a760a50-5eba-45a8-aaa0-696ac404e1b3'
  const isTempUnlocked = user.id === TEMP_UNLOCK_USER_ID

  const now = Date.now()
  const closedRounds = new Set<string>()
  const startedMatches = new Set<string>()

  for (const matchId of Object.keys(body)) {
    const m = matchById.get(matchId)
    if (!m) { closedRounds.add('desconocida'); continue }
    // A match can never be edited once it has started or has a result — applies to everyone.
    if (m.home_score !== null || (m.kickoff_at && new Date(m.kickoff_at).getTime() <= now)) {
      startedMatches.add(matchId)
      continue
    }
    if (!isTempUnlocked && !openRounds.has(m.round)) closedRounds.add(m.round ?? 'desconocida')
  }

  if (startedMatches.size > 0) {
    throw createError({
      statusCode: 403,
      message: 'No puedes editar predicciones de partidos que ya han empezado o finalizado.',
    })
  }
  if (closedRounds.size > 0) {
    throw createError({
      statusCode: 403,
      message: `Estas fases no están abiertas para predicciones: ${[...closedRounds].join(', ')}`,
    })
  }

  const rows = Object.entries(body).map(([match_id, p]) => ({
    user_id: user.id,
    match_id,
    home_score: p.home,
    away_score: p.away,
    home_advances: p.homeAdvances ?? null,
  }))

  const { error } = await supabase
    .from('predictions')
    .upsert(rows, { onConflict: 'user_id,match_id' })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { saved: rows.length }
})
