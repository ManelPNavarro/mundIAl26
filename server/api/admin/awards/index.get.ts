export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseAdmin()

  const { data } = await supabase
    .from('official_awards')
    .select('winner_team_id, best_player, best_young_player, top_scorer, best_goalkeeper')
    .single()

  return data
})
