export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseAdmin()
  const [{ data: authData, error }, { data: predCounts }, { count: totalMatches }, { data: sideBetsData }] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('predictions').select('user_id').limit(100000),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('side_bets').select('user_id, best_player, best_young_player, top_scorer, best_goalkeeper'),
  ])

  if (error) throw createError({ statusCode: 500, message: error.message })

  const countByUser = new Map<string, number>()
  for (const p of predCounts ?? []) {
    countByUser.set(p.user_id, (countByUser.get(p.user_id) ?? 0) + 1)
  }

  const awardsByUser = new Map<string, number>()
  for (const sb of sideBetsData ?? []) {
    const filled = [sb.best_player, sb.best_young_player, sb.top_scorer, sb.best_goalkeeper].filter(Boolean).length
    awardsByUser.set(sb.user_id, filled)
  }

  return authData.users.sort((a, b) => (a.email ?? '').localeCompare(b.email ?? '')).map(user => ({
    id: user.id,
    email: user.email ?? '',
    last_sign_in_at: user.last_sign_in_at ?? null,
    is_admin: user.user_metadata?.is_admin ?? false,
    predictions_filled: countByUser.get(user.id) ?? 0,
    total_matches: totalMatches ?? 0,
    awards_filled: awardsByUser.get(user.id) ?? 0,
  }))
})
