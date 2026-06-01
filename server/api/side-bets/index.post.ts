interface SideBetsBody {
  winner_team_id?: string | null
  best_player?: string | null
  best_young_player?: string | null
  top_scorer?: string | null
  best_goalkeeper?: string | null
}

export default defineEventHandler(async (event) => {
  const supabase = useSupabaseAdmin()

  const { data: lock } = await supabase
    .from('round_locks')
    .select('is_open')
    .eq('round', 'GROUP')
    .single()

  if (!lock?.is_open) {
    throw createError({ statusCode: 403, message: 'Los premios están cerrados' })
  }

  const user = await requireUser(event)
  const body = await readBody<SideBetsBody>(event)

  const { error } = await supabase
    .from('side_bets')
    .upsert({
      user_id: user.id,
      winner_team_id: body.winner_team_id ?? null,
      best_player: body.best_player?.trim() || null,
      best_young_player: body.best_young_player?.trim() || null,
      top_scorer: body.top_scorer?.trim() || null,
      best_goalkeeper: body.best_goalkeeper?.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
