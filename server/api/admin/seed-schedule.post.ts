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

  const results = await Promise.all(
    updates.map(u => supabase.from('matches').update({ kickoff_at: u.kickoff_at }).eq('id', u.id))
  )

  const failed = results.filter(r => r.error)
  if (failed.length) throw createError({ statusCode: 500, message: failed[0]!.error!.message })

  return { updated: updates.length }
})
