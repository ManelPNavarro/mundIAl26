import type { SupabaseClient } from '@supabase/supabase-js'

export async function getWC2026Id(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase
    .from('competitions')
    .select('id')
    .eq('slug', 'wc2026')
    .maybeSingle()
  return data?.id ?? null
}