interface AwardsBody {
  winner_team_id?: string | null
  best_player?: string | null
  best_young_player?: string | null
  top_scorer?: string | null
  best_goalkeeper?: string | null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseAdmin()
  const body = await readBody<AwardsBody>(event)

  const { error } = await supabase
    .from('official_awards')
    .update({
      winner_team_id: body.winner_team_id ?? null,
      best_player: body.best_player?.trim() || null,
      best_young_player: body.best_young_player?.trim() || null,
      top_scorer: body.top_scorer?.trim() || null,
      best_goalkeeper: body.best_goalkeeper?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .not('id', 'is', null)

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
