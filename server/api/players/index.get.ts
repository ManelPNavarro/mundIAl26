export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()

  const { data } = await supabase
    .from('players')
    .select('id, name, position, team:team_id(name)')
    .order('name')

  return data ?? []
})
