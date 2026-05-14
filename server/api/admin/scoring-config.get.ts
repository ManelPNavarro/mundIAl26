export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase.from('scoring_config').select('*').single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
