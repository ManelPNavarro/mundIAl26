const GROUP_DEADLINE = new Date('2026-06-11T00:00:00Z')
const ROUND_ORDER = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL']

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  const supabase = useSupabaseAdmin()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401 })

  const { data: matches } = await supabase.from('matches').select('id, round, status')

  const openRound = (() => {
    for (const round of ROUND_ORDER) {
      const roundMatches = matches?.filter(m => m.round === round) ?? []
      if (roundMatches.length === 0) continue
      if (roundMatches.every(m => m.status === 'FINISHED')) continue
      return round
    }
    return null
  })()

  if (!openRound) throw createError({ statusCode: 403, message: 'El torneo ha finalizado' })
  if (openRound === 'GROUP' && new Date() >= GROUP_DEADLINE) {
    throw createError({ statusCode: 403, message: 'El plazo de predicciones de la fase de grupos ha terminado' })
  }

  const body = await readBody<Record<string, { home: number, away: number, homeAdvances?: boolean | null }>>(event)

  const matchById = new Map(matches?.map(m => [m.id, m]) ?? [])
  for (const matchId of Object.keys(body)) {
    const match = matchById.get(matchId)
    if (!match || match.round !== openRound) {
      throw createError({ statusCode: 403, message: 'Solo puedes editar predicciones de la fase actual' })
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
