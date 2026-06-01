export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseAdmin()
  const [{ data: authData, error }, { data: predCounts }, { count: totalMatches }] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('predictions').select('user_id'),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
  ])

  if (error) throw createError({ statusCode: 500, message: error.message })

  const countByUser = new Map<string, number>()
  for (const p of predCounts ?? []) {
    countByUser.set(p.user_id, (countByUser.get(p.user_id) ?? 0) + 1)
  }

  return authData.users.map(user => ({
    id: user.id,
    email: user.email ?? '',
    created_at: user.created_at,
    is_admin: user.user_metadata?.is_admin ?? false,
    predictions_filled: countByUser.get(user.id) ?? 0,
    total_matches: totalMatches ?? 0,
  }))
})
