import { calcMatchPoints } from '../../utils/scoring'
import { teamsMatch } from '../../utils/bracket'

export default defineEventHandler(async (event) => {
  const supabase = useSupabaseAdmin()
  const user = await requireUser(event)

  const [
    { data: allMatches },
    { data: userPredictions },
    { data: config },
  ] = await Promise.all([
    supabase.from('matches').select('id, match_no, round, group_letter, home_team_id, away_team_id, home_slot, away_slot, home_score, away_score, home_advances').order('match_no'),
    supabase.from('predictions').select('match_id, home_score, away_score, home_advances').eq('user_id', user.id),
    supabase.from('scoring_config').select('*').single(),
  ])

  if (!config) throw createError({ statusCode: 500 })

  const predMap = new Map(
    (userPredictions ?? []).map(p => [p.match_id, p])
  )

  const summary: Record<string, {
    result: { home: number, away: number, home_advances: boolean | null }
    points: number
    isExact: boolean
    isCorrect: boolean
    wrongTeams: boolean
  }> = {}

  for (const match of (allMatches ?? []).filter(m => m.home_score !== null)) {
    if (match.home_score === null || match.away_score === null) continue

    const result = { home: match.home_score, away: match.away_score, home_advances: match.home_advances }
    const pred = predMap.get(match.id)

    if (!pred) {
      summary[match.id] = { result, points: 0, isExact: false, isCorrect: false, wrongTeams: false }
      continue
    }

    // Knockout matches: only score if user predicted the correct teams in this slot
    if (match.round !== 'GROUP' && !teamsMatch(match, allMatches ?? [], predMap)) {
      summary[match.id] = { result, points: 0, isExact: false, isCorrect: false, wrongTeams: true }
      continue
    }

    const points = calcMatchPoints(
      { home_score: pred.home_score, away_score: pred.away_score, home_advances: pred.home_advances },
      { home_score: match.home_score, away_score: match.away_score, home_advances: match.home_advances, round: match.round },
      config,
    )

    const isExact = pred.home_score === match.home_score && pred.away_score === match.away_score
    const isCorrect = points > 0

    summary[match.id] = { result, points, isExact, isCorrect, wrongTeams: false }
  }

  return summary
})
