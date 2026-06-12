import { toSpanish, mapStatus } from '../../utils/football-data'
import type { ApiMatch } from '../../utils/football-data'
import { recalculateMatchPoints } from '../../utils/points'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const supabase = useSupabaseAdmin()

  // Fetch all WC 2026 matches from football-data.org
  const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': config.footballDataApiKey as string },
  })

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      message: `football-data.org error: ${response.status} ${response.statusText}`,
    })
  }

  const { matches: apiMatches }: { matches: ApiMatch[] } = await response.json()

  // Load our matches with team names for matching
  const { data: dbMatches, error: dbError } = await supabase
    .from('matches')
    .select('id, match_no, round, home_team:home_team_id(name), away_team:away_team_id(name), home_slot, away_slot')

  if (dbError) throw createError({ statusCode: 500, message: dbError.message })

  let updated = 0
  let skipped = 0

  for (const apiMatch of apiMatches) {
    const homeEs = toSpanish(apiMatch.homeTeam.name)
    const awayEs = toSpanish(apiMatch.awayTeam.name)

    // Find matching DB row by team names
    const dbMatch = dbMatches?.find((m) => {
      const home = (m.home_team as { name: string } | null)?.name
      const away = (m.away_team as { name: string } | null)?.name
      return home === homeEs && away === awayEs
    })

    if (!dbMatch) {
      skipped++
      continue
    }

    const status = mapStatus(apiMatch.status)
    const isFinished = status === 'FINISHED'
    const isPenalties = apiMatch.score.duration === 'PENALTY_SHOOTOUT'

    const update: Record<string, unknown> = {
      kickoff_at: apiMatch.utcDate,
      status,
    }

    if (isFinished && apiMatch.score.fullTime.home !== null) {
      update.home_score = apiMatch.score.fullTime.home
      update.away_score = apiMatch.score.fullTime.away
      if (isPenalties) {
        update.home_advances = apiMatch.score.winner === 'HOME_TEAM'
      }
    }

    await supabase.from('matches').update(update).eq('id', dbMatch.id)
    if (isFinished && update.home_score !== undefined) {
      await recalculateMatchPoints(dbMatch.id, supabase)
    }
    updated++
  }

  return { updated, skipped, total: apiMatches.length }
})
