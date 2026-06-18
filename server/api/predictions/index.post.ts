export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  const supabase = useSupabaseAdmin()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401 })

  const [{ data: locks }, { data: matches }] = await Promise.all([
    supabase.from('round_locks').select('round, is_open'),
    supabase.from('matches').select('id, round'),
  ])

  const openRounds = new Set((locks ?? []).filter(l => l.is_open).map(l => l.round))
  const matchRound = new Map((matches ?? []).map(m => [m.id, m.round]))

  const body = await readBody<Record<string, { home: number, away: number, homeAdvances?: boolean | null }>>(event)

  const TEMP_UNLOCK_USER_ID = '1a760a50-5eba-45a8-aaa0-696ac404e1b3'
  const isTempUnlocked = user.id === TEMP_UNLOCK_USER_ID

  for (const matchId of Object.keys(body)) {
    const round = matchRound.get(matchId)
    if (!round || (!openRounds.has(round) && !isTempUnlocked)) {
      throw createError({ statusCode: 403, message: 'Esta fase no está abierta para predicciones' })
    }
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
