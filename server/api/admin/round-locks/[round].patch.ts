export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const round = getRouterParam(event, 'round')
  const { is_open } = await readBody<{ is_open: boolean }>(event)

  const supabase = useSupabaseAdmin()
  const { error } = await supabase
    .from('round_locks')
    .update({ is_open })
    .eq('round', round)

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { round, is_open }
})
