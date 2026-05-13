import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event) {
  const authorization = getHeader(event, 'authorization')
  const token = authorization?.replace('Bearer ', '')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.supabaseUrl as string,
    process.env.SUPABASE_KEY as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }

  if (!user.user_metadata?.is_admin) {
    throw createError({ statusCode: 403, message: 'Acceso restringido a administradores' })
  }

  return user
}
