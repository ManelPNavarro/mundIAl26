export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { catch_up_mode } = await readBody<{ catch_up_mode: boolean }>(event)

  const supabase = useSupabaseAdmin()
  const { error } = await supabase
    .from('app_settings')
    .update({ catch_up_mode, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { catch_up_mode }
})
