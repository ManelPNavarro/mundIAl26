<script setup lang="ts">
const user = useSupabaseUser()

onMounted(async () => {
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  if (user.value.user_metadata?.is_admin) {
    await navigateTo('/admin/users')
  } else {
    await navigateTo('/dashboard')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
  </div>
</template>
