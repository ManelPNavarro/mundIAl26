export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de usuario requerido' })
  }

  const body = await readBody<{ is_admin: boolean }>(event)

  if (typeof body?.is_admin !== 'boolean') {
    throw createError({ statusCode: 400, message: 'El campo is_admin es obligatorio' })
  }

  const supabase = useSupabaseAdmin()

  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { is_admin: body.is_admin },
  })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
