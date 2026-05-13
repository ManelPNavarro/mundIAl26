export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data.users.map(user => ({
    id: user.id,
    email: user.email ?? '',
    created_at: user.created_at,
    is_admin: user.user_metadata?.is_admin ?? false,
  }))
})
