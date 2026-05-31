import squads from '../../../data/squads'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseAdmin()

  const { data: dbTeams } = await supabase.from('teams').select('id, name')
  if (!dbTeams) throw createError({ statusCode: 500, message: 'Could not load teams' })

  const teamByName = new Map(dbTeams.map(t => [t.name, t.id]))

  let synced = 0
  let skipped = 0

  for (const [teamName, players] of Object.entries(squads)) {
    const teamId = teamByName.get(teamName)

    if (!teamId) {
      skipped++
      continue
    }

    const rows = players.map(name => ({
      name,
      team_id: teamId,
      updated_at: new Date().toISOString(),
    }))

    await supabase
      .from('players')
      .upsert(rows, { onConflict: 'name,team_id' })

    synced += rows.length
  }

  return { synced, skippedTeams: skipped, totalTeams: Object.keys(squads).length }
})
