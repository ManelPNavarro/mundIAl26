import { calcMatchPoints } from '../../utils/scoring'

export default defineEventHandler(async (event) => {
  const supabase = useSupabaseAdmin()
  const user = await requireUser(event)

  const [
    { data: finishedMatches },
    { data: userPredictions },
    { data: config },
  ] = await Promise.all([
    supabase.from('matches').select('id, round, home_score, away_score, home_advances').eq('status', 'FINISHED'),
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
  }> = {}

  for (const match of finishedMatches ?? []) {
    if (match.home_score === null || match.away_score === null) continue

    const pred = predMap.get(match.id)
    const result = { home: match.home_score, away: match.away_score, home_advances: match.home_advances }

    if (!pred) {
      summary[match.id] = { result, points: 0, isExact: false, isCorrect: false }
      continue
    }

    const points = calcMatchPoints(
      { home_score: pred.home_score, away_score: pred.away_score, home_advances: pred.home_advances },
      { home_score: match.home_score, away_score: match.away_score, home_advances: match.home_advances, round: match.round },
      config,
    )

    const isExact = pred.home_score === match.home_score && pred.away_score === match.away_score
    const isCorrect = points > 0

    summary[match.id] = { result, points, isExact, isCorrect }
  }

  return summary
})
