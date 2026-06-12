import { recalculateMatchPoints } from '../../utils/points'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseAdmin()
  const { data: finishedMatches } = await supabase
    .from('matches')
    .select('id')
    .not('home_score', 'is', null)

  if (!finishedMatches?.length) return { recalculated: 0 }

  for (const match of finishedMatches) {
    await recalculateMatchPoints(match.id, supabase)
  }

  return { recalculated: finishedMatches.length }
})
