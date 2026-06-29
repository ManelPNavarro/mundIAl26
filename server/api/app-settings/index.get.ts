export default defineEventHandler(async () => {
  const supabase = useSupabaseAdmin()
  const { data } = await supabase
    .from('app_settings')
    .select('catch_up_mode')
    .eq('id', true)
    .single()
  return { catch_up_mode: data?.catch_up_mode ?? false }
})
