<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const promoted = ref(false)

async function promoteFirstUserIfNeeded() {
  if (promoted.value) return
  promoted.value = true

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    await $fetch('/api/auth/first-user', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
  } catch {
    // Not the first user or already admin — ignore
  }
}

watch(user, async (newUser) => {
  if (newUser) {
    await promoteFirstUserIfNeeded()
    await navigateTo('/')
  }
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    if (!user.value) navigateTo('/login')
  }, 5000)
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
    <UIcon name="i-lucide-loader-2" class="size-10 animate-spin text-primary" />
    <p class="text-muted text-sm">
      Verificando...
    </p>
  </div>
</template>
