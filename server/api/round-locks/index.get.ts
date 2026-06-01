export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()
  const { data, error } = await supabase.from('round_locks').select('round, is_open')
  if (error) throw createError({ statusCode: 500, message: error.message })
  return Object.fromEntries((data ?? []).map(r => [r.round, r.is_open])) as Record<string, boolean>
})
