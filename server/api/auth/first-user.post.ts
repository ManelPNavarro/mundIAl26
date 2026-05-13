import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, 'authorization')
  const token = authorization?.replace('Bearer ', '')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const config = useRuntimeConfig()

  // Verify the calling user's identity
  const anonClient = createClient(
    config.supabaseUrl as string,
    process.env.SUPABASE_KEY as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: { user }, error: userError } = await anonClient.auth.getUser(token)

  if (userError || !user) {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }

  // Check if this user is already admin — no-op
  if (user.user_metadata?.is_admin) {
    return { promoted: false, reason: 'already_admin' }
  }

  const adminClient = useSupabaseAdmin()
  const { data: listData, error: listError } = await adminClient.auth.admin.listUsers()

  if (listError) {
    throw createError({ statusCode: 500, message: listError.message })
  }

  if (listData.users.length !== 1) {
    return { promoted: false, reason: 'not_first_user' }
  }

  // This is the only user — promote to admin
  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: { is_admin: true },
  })

  if (updateError) {
    throw createError({ statusCode: 500, message: updateError.message })
  }

  return { promoted: true }
})
