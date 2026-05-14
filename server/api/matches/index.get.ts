export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id, match_no, round, matchday, group_letter,
      home_slot, away_slot,
      home_score, away_score, home_advances, status, kickoff_at,
      home_team:home_team_id (id, name),
      away_team:away_team_id (id, name)
    `)
    .order('match_no')

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
