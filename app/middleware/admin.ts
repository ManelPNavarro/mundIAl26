export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/login')
  if (!user.value.user_metadata?.is_admin) return navigateTo('/dashboard')
})
