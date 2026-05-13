import { createClient } from '@supabase/supabase-js'

export function useSupabaseAdmin() {
  const config = useRuntimeConfig()
  return createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
}
