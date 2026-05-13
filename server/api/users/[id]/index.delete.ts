export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de usuario requerido' })
  }

  const supabase = useSupabaseAdmin()

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
