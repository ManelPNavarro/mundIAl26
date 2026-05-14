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

const isAdmin = computed(() => user.value?.user_metadata?.is_admin === true)

const menuItems = computed(() => [
  [{
    label: user.value?.email ?? '',
    slot: 'account',
    disabled: true,
  }],
  ...(isAdmin.value ? [[
    { type: 'label', label: 'Administración' },
    { label: 'Usuarios', icon: 'i-lucide-users', to: '/admin/users' },
    { label: 'Resultados', icon: 'i-lucide-clipboard-list', to: '/admin/results' },
    { label: 'Puntuación', icon: 'i-lucide-sliders-horizontal', to: '/admin/scoring' },
  ]] : []),
  [{
    label: 'Cerrar sesión',
    icon: 'i-lucide-log-out',
    onSelect: signOut,
  }],
])
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="font-bold text-lg tracking-tight text-foreground">
            mundIAl 26
          </NuxtLink>
          <nav class="hidden sm:flex items-center gap-4">
            <NuxtLink
              to="/predictions"
              class="text-sm text-muted hover:text-foreground transition-colors"
              active-class="text-foreground font-medium"
            >
              Predicciones
            </NuxtLink>
            <NuxtLink
              to="/ranking"
              class="text-sm text-muted hover:text-foreground transition-colors"
              active-class="text-foreground font-medium"
            >
              Ranking
            </NuxtLink>
          </nav>
        </div>

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

    <main class="max-w-6xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <slot />
    </main>

    <!-- Bottom nav (mobile only) -->
    <nav class="sm:hidden fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur border-t border-border z-50">
      <div class="flex items-center justify-around h-16">
        <NuxtLink
          to="/"
          class="flex flex-col items-center gap-1 text-muted hover:text-foreground transition-colors px-4"
          active-class="text-primary"
          :end="true"
        >
          <UIcon name="i-lucide-house" class="size-5" />
          <span class="text-xs">Inicio</span>
        </NuxtLink>
        <NuxtLink
          to="/predictions"
          class="flex flex-col items-center gap-1 text-muted hover:text-foreground transition-colors px-4"
          active-class="text-primary"
        >
          <UIcon name="i-lucide-pencil" class="size-5" />
          <span class="text-xs">Predicciones</span>
        </NuxtLink>
        <NuxtLink
          to="/ranking"
          class="flex flex-col items-center gap-1 text-muted hover:text-foreground transition-colors px-4"
          active-class="text-primary"
        >
          <UIcon name="i-lucide-trophy" class="size-5" />
          <span class="text-xs">Ranking</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
