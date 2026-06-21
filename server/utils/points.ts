import { calcMatchPoints } from './scoring'
import { teamsMatch } from './bracket'

type SupabaseAdmin = ReturnType<typeof useSupabaseAdmin>

export async function recalculateMatchPoints(matchId: string, supabase: SupabaseAdmin): Promise<void> {
  const [
    { data: match },
    { data: allMatches },
    { data: matchPredictions },
    { data: config },
  ] = await Promise.all([
    supabase.from('matches')
      .select('id, match_no, round, group_letter, home_team_id, away_team_id, home_slot, away_slot, home_score, away_score, home_advances')
      .eq('id', matchId).single(),
    supabase.from('matches')
      .select('id, match_no, round, group_letter, home_team_id, away_team_id, home_slot, away_slot, home_score, away_score, home_advances')
      .order('match_no'),
    supabase.from('predictions')
      .select('user_id, home_score, away_score, home_advances')
      .eq('match_id', matchId),
    supabase.from('scoring_config').select('*').single(),
  ])

  if (!match || !config) return

  if (match.home_score === null || match.away_score === null) {
    const { data: affected } = await supabase.from('user_match_points').select('user_id').eq('match_id', matchId)
    await supabase.from('user_match_points').delete().eq('match_id', matchId)
    if (affected?.length) await syncUserScores(affected.map(r => r.user_id), supabase)
    return
  }

  if (!matchPredictions?.length) return

  const result = { home_score: match.home_score, away_score: match.away_score, home_advances: match.home_advances, round: match.round }
  const rows: { user_id: string, match_id: string, points: number }[] = []

  if (match.round === 'GROUP') {
    for (const pred of matchPredictions) {
      rows.push({
        user_id: pred.user_id,
        match_id: matchId,
        points: calcMatchPoints(pred, result, config),
      })
    }
  } else {
    const { data: allPredictions } = await supabase
      .from('predictions')
      .select('user_id, match_id, home_score, away_score, home_advances')
      .in('user_id', matchPredictions.map(p => p.user_id))

    const predsByUser = new Map<string, Map<string, { home_score: number, away_score: number, home_advances: boolean | null }>>()
    for (const p of allPredictions ?? []) {
      if (!predsByUser.has(p.user_id)) predsByUser.set(p.user_id, new Map())
      predsByUser.get(p.user_id)!.set(p.match_id, { home_score: p.home_score, away_score: p.away_score, home_advances: p.home_advances })
    }

    for (const pred of matchPredictions) {
      const predMap = predsByUser.get(pred.user_id) ?? new Map()
      const points = teamsMatch(match, allMatches ?? [], predMap)
        ? calcMatchPoints(pred, result, config)
        : 0
      rows.push({ user_id: pred.user_id, match_id: matchId, points })
    }
  }

  if (rows.length) {
    await supabase.from('user_match_points').upsert(rows, { onConflict: 'user_id,match_id' })
    await syncUserScores(rows.map(r => r.user_id), supabase)
  }
}

async function syncUserScores(userIds: string[], supabase: SupabaseAdmin): Promise<void> {
  const { data: totals } = await supabase
    .from('user_match_points')
    .select('user_id, points')
    .in('user_id', userIds)

  const totalByUser = new Map<string, number>()
  for (const row of totals ?? []) {
    totalByUser.set(row.user_id, (totalByUser.get(row.user_id) ?? 0) + row.points)
  }

  const scoreRows = userIds.map(user_id => ({
    user_id,
    match_points: totalByUser.get(user_id) ?? 0,
    updated_at: new Date().toISOString(),
  }))

  await supabase.from('user_scores').upsert(scoreRows, { onConflict: 'user_id' })
}
