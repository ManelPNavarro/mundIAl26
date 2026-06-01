import schedule from '../../data/schedule'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseAdmin()

  const { data: matches } = await supabase.from('matches').select('id, match_no')
  if (!matches) throw createError({ statusCode: 500, message: 'Could not load matches' })

  const matchById = new Map(matches.map(m => [m.match_no, m.id]))

  const updates = schedule
    .map(({ match_no, kickoff_at }) => {
      const id = matchById.get(match_no)
      return id ? { id, kickoff_at } : null
    })
    .filter((u): u is { id: string, kickoff_at: string } => u !== null)

  const { error } = await supabase.from('matches').upsert(updates, { onConflict: 'id' })
  if (error) throw createError({ statusCode: 500, message: error.message })

  return { updated: updates.length }
})
