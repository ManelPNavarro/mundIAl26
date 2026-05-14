export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    home_score: number
    away_score: number
    home_advances?: boolean | null
    status?: string
  }>(event)

  const supabase = useSupabaseAdmin()

  const { data, error } = await supabase
    .from('matches')
    .update({
      home_score: body.home_score,
      away_score: body.away_score,
      home_advances: body.home_advances ?? null,
      status: body.status ?? 'FINISHED',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
