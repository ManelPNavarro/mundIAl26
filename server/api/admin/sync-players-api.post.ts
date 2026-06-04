const POSITION_MAP: Record<string, string> = {
  Goalkeeper: 'GK',
  Defence: 'DEF',
  Midfield: 'MID',
  Offence: 'FWD',
}

const TEAM_NAME_MAP: Record<string, string> = {
  'Spain': 'España',
  'Germany': 'Alemania',
  'France': 'Francia',
  'Netherlands': 'Países Bajos',
  'Belgium': 'Bélgica',
  'Brazil': 'Brasil',
  'Mexico': 'México',
  'United States': 'Estados Unidos',
  'South Korea': 'Corea del Sur',
  'Czechia': 'República Checa',
  'South Africa': 'Sudáfrica',
  'Bosnia-Herzegovina': 'Bosnia y Herzegovina',
  'Canada': 'Canadá',
  'Qatar': 'Catar',
  'Switzerland': 'Suiza',
  'Scotland': 'Escocia',
  'Haiti': 'Haití',
  'Morocco': 'Marruecos',
  'Australia': 'Australia',
  'Paraguay': 'Paraguay',
  'Turkey': 'Turquía',
  'Ivory Coast': 'Costa de Marfil',
  'Curaçao': 'Curazao',
  'Ecuador': 'Ecuador',
  'Japan': 'Japón',
  'Sweden': 'Suecia',
  'Tunisia': 'Túnez',
  'Egypt': 'Egipto',
  'Iran': 'Irán',
  'New Zealand': 'Nueva Zelanda',
  'Saudi Arabia': 'Arabia Saudita',
  'Cape Verde Islands': 'Cabo Verde',
  'Uruguay': 'Uruguay',
  'Iraq': 'Irak',
  'Norway': 'Noruega',
  'Senegal': 'Senegal',
  'Algeria': 'Argelia',
  'Argentina': 'Argentina',
  'Austria': 'Austria',
  'Jordan': 'Jordania',
  'Colombia': 'Colombia',
  'Portugal': 'Portugal',
  'Congo DR': 'RD Congo',
  'Uzbekistan': 'Uzbekistán',
  'Croatia': 'Croacia',
  'Ghana': 'Ghana',
  'England': 'Inglaterra',
  'Panama': 'Panamá',
}

interface FdPlayer {
  id: number
  name: string
  position: string | null
  nationality: string | null
  dateOfBirth: string | null
}

interface FdTeam {
  id: number
  name: string
  area: { name: string }
  squad: FdPlayer[]
}

interface FdResponse {
  teams: FdTeam[]
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const apiKey = config.footballDataApiKey
  if (!apiKey) throw createError({ statusCode: 500, message: 'FOOTBALL_DATA_API_KEY not set' })

  const res = await fetch('https://api.football-data.org/v4/competitions/WC/teams?season=2026', {
    headers: { 'X-Auth-Token': apiKey },
  })
  if (!res.ok) throw createError({ statusCode: 502, message: `football-data.org error: ${res.status}` })

  const { teams } = await res.json() as FdResponse

  const supabase = useSupabaseAdmin()
  const { data: dbTeams } = await supabase.from('teams').select('id, name')
  if (!dbTeams) throw createError({ statusCode: 500, message: 'Could not load teams' })

  const teamByName = new Map(dbTeams.map(t => [t.name, t.id]))

  let synced = 0
  let skipped = 0

  for (const team of teams) {
    const dbName = TEAM_NAME_MAP[team.name] ?? team.name
    const teamId = teamByName.get(dbName)
    if (!teamId) {
      skipped++
      continue
    }

    const rows = team.squad.map(p => ({
      external_id: p.id,
      name: p.name,
      team_id: teamId,
      position: POSITION_MAP[p.position ?? ''] ?? null,
      nationality: p.nationality,
      date_of_birth: p.dateOfBirth,
      updated_at: new Date().toISOString(),
    }))

    await supabase
      .from('players')
      .upsert(rows, { onConflict: 'external_id' })

    synced += rows.length
  }

  return { synced, skippedTeams: skipped, totalTeams: teams.length }
})
