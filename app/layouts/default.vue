<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const displayEmail = computed(() => {
  const email = user.value?.email ?? ''
  return email.length > 28 ? email.slice(0, 25) + '...' : email
})

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

const menuItems = computed(() => [[
  {
    label: user.value?.email ?? '',
    slot: 'account',
    disabled: true,
  },
], [
  {
    label: 'Cerrar sesión',
    icon: 'i-lucide-log-out',
    onSelect: signOut,
  },
]])
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="font-bold text-lg tracking-tight text-foreground">
          mundIAl 26
        </NuxtLink>

        <UDropdownMenu
          v-if="user"
          :items="menuItems"
        >
          <UButton
            variant="ghost"
            color="neutral"
            trailing-icon="i-lucide-chevron-down"
            size="sm"
          >
            <UAvatar
              :alt="user.email"
              size="xs"
              class="mr-1"
            />
            <span class="hidden sm:inline text-sm">{{ displayEmail }}</span>
          </UButton>

          <template #account-leading>
            <UAvatar :alt="user.email" size="xs" />
          </template>
        </UDropdownMenu>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>
