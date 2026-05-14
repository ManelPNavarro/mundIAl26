export default defineEventHandler(async (event) => {
  const supabase = useSupabaseAdmin()
  const user = await requireUser(event)

  const { data } = await supabase
    .from('side_bets')
    .select('winner_team_id, best_player, best_young_player, top_scorer, best_goalkeeper')
    .eq('user_id', user.id)
    .maybeSingle()

  return data ?? null
})
