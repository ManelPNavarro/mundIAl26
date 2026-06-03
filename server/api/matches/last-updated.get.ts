export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()

  const { data, error } = await supabase
    .from('matches')
    .select('updated_at')
    .not('updated_at', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { updated_at: data?.updated_at ?? null }
})