const DEADLINE = new Date('2026-06-11T00:00:00Z')

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  if (new Date() >= DEADLINE) {
    throw createError({ statusCode: 403, message: 'El plazo de predicciones ha terminado' })
  }

  const supabase = useSupabaseAdmin()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401 })

  const body = await readBody<Record<string, { home: number, away: number, homeAdvances?: boolean | null }>>(event)

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
