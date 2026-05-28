import { toSpanish } from '../../../utils/football-data'

interface ApiSportsPlayer {
  id: number
  name: string
  firstname: string
  lastname: string
  birth: { date: string | null }
  nationality: string | null
  position: string | null
}

interface ApiSportsSquadPlayer {
  id: number
  name: string
  age: number
  number: number | null
  position: string | null
  photo: string | null
}

const API_BASE = 'https://v3.football.api-sports.io'
const WC_LEAGUE = 1
const WC_SEASON = 2026

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const supabase = useSupabaseAdmin()
  const headers = { 'x-apisports-key': config.apiSportsKey as string }

  const teamsRes = await fetch(`${API_BASE}/teams?league=${WC_LEAGUE}&season=${WC_SEASON}`, { headers })
  if (!teamsRes.ok) throw createError({ statusCode: 502, message: `api-sports error: ${teamsRes.status}` })

  const { response: apiTeams }: { response: { team: { id: number; name: string } }[] } = await teamsRes.json()

  const { data: dbTeams } = await supabase.from('teams').select('id, name')
  if (!dbTeams) throw createError({ statusCode: 500, message: 'Could not load teams' })

  const teamByName = new Map(dbTeams.map(t => [t.name, t.id]))

  let synced = 0
  let skipped = 0

  for (const { team: apiTeam } of apiTeams) {
    const spanishName = toSpanish(apiTeam.name)
    const teamId = teamByName.get(spanishName)

    if (!teamId) {
      skipped++
      continue
    }

    const squadRes = await fetch(`${API_BASE}/players/squads?team=${apiTeam.id}`, { headers })
    if (!squadRes.ok) continue

    const { response: squadData }: { response: { team: unknown; players: ApiSportsSquadPlayer[] }[] } = await squadRes.json()
    const players = squadData?.[0]?.players ?? []

    if (!players.length) continue

    const rows = players.map(p => ({
      external_id: p.id,
      name: p.name,
      team_id: teamId,
      position: p.position ?? null,
      updated_at: new Date().toISOString(),
    }))

    await supabase.from('players').upsert(rows, { onConflict: 'external_id' })
    synced += rows.length
  }

  return { synced, skippedTeams: skipped, totalTeams: apiTeams.length }
})
