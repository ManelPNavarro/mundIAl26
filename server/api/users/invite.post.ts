export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ email: string }>(event)

  if (!body?.email?.trim()) {
    throw createError({ statusCode: 400, message: 'El correo es obligatorio' })
  }

  const supabase = useSupabaseAdmin()

  const { error } = await supabase.auth.admin.inviteUserByEmail(body.email.trim())

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
