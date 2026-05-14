export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  const supabase = useSupabaseAdmin()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401 })

  const { data, error } = await supabase
    .from('predictions')
    .select('match_id, home_score, away_score, home_advances')
    .eq('user_id', user.id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  // Return as a map keyed by match_id for easy lookup
  return Object.fromEntries(
    (data ?? []).map(p => [p.match_id, {
      home: p.home_score,
      away: p.away_score,
      homeAdvances: p.home_advances,
    }])
  )
})
