export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const supabase = useSupabaseAdmin()

  const { data: existing } = await supabase.from('scoring_config').select('id').single()
  if (!existing) throw createError({ statusCode: 404 })

  const { data, error } = await supabase
    .from('scoring_config')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
