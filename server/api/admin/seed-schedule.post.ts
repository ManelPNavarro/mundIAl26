import schedule from '../../data/schedule'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseAdmin()

  const { data: matches } = await supabase.from('matches').select('id, match_no')
  if (!matches) throw createError({ statusCode: 500, message: 'Could not load matches' })

  const matchById = new Map(matches.map(m => [m.match_no, m.id]))

  let updated = 0
  for (const { match_no, kickoff_at } of schedule) {
    const id = matchById.get(match_no)
    if (!id) continue
    await supabase.from('matches').update({ kickoff_at }).eq('id', id)
    updated++
  }

  return { updated }
})
