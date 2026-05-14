export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()
  const { data } = await supabase.from('teams').select('id, name').order('name')
  return data ?? []
})
