import { toSpanish } from '../../../utils/football-data'

interface ApiPlayer {
  id: number
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  nationality: string | null
  position: string | null
}

interface ApiTeam {
  id: number
  name: string
  squad: ApiPlayer[]
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const supabase = useSupabaseAdmin()

  const response = await fetch('https://api.football-data.org/v4/competitions/WC/teams?season=2026', {
    headers: { 'X-Auth-Token': config.footballDataApiKey as string },
  })

  if (!response.ok) {
    throw createError({ statusCode: 502, message: `football-data.org error: ${response.status}` })
  }

  const { teams: apiTeams }: { teams: ApiTeam[] } = await response.json()

  const { data: dbTeams } = await supabase.from('teams').select('id, name')
  if (!dbTeams) throw createError({ statusCode: 500, message: 'Could not load teams' })

  const teamByName = new Map(dbTeams.map(t => [t.name, t.id]))

  let synced = 0
  let skipped = 0

  for (const apiTeam of apiTeams) {
    const spanishName = toSpanish(apiTeam.name)
    const teamId = teamByName.get(spanishName)

    if (!teamId) {
      skipped++
      continue
    }

    if (!apiTeam.squad?.length) continue

    const rows = apiTeam.squad.map(p => ({
      external_id: p.id,
      name: p.name,
      team_id: teamId,
      position: p.position ?? null,
      nationality: p.nationality ?? null,
      date_of_birth: p.dateOfBirth ?? null,
      updated_at: new Date().toISOString(),
    }))

    await supabase
      .from('players')
      .upsert(rows, { onConflict: 'external_id' })

    synced += rows.length
  }

  return { synced, skippedTeams: skipped, totalTeams: apiTeams.length }
})
