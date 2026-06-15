<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const headerAvatarUrl = useGravatarUrl(user.value?.email)

const displayEmail = computed(() => {
  const email = user.value?.email ?? ''
  return email.length > 28 ? email.slice(0, 25) + '...' : email
})

const showRulesModal = ref(false)

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

const isAdmin = computed(() => user.value?.user_metadata?.is_admin === true)
const route = useRoute()
const isAdminPage = computed(() => route.path.startsWith('/admin'))

const { data: ranking } = useLazyFetch<{ id: string, position: number }[]>('/api/ranking')
const myPosition = computed(() => {
  if (!ranking.value || !user.value) return null
  return ranking.value.find(e => e.id === user.value!.id)?.position ?? null
})

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
    label: 'Reglas',
    icon: 'i-lucide-scroll-text',
    onSelect: () => { showRulesModal.value = true },
  }, {
    label: 'Ajustes',
    icon: 'i-lucide-settings',
    to: '/settings',
  }, {
    label: 'Cerrar sesión',
    icon: 'i-lucide-log-out',
    onSelect: signOut,
  }],
])
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b sticky top-0 z-50 backdrop-blur transition-colors"
      :class="isAdminPage ? 'bg-neutral-900/90 border-primary-700' : 'bg-background/80 border-border'"
    >
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <NuxtLink to="/predictions" class="font-bold text-lg tracking-tight" :class="isAdminPage ? 'text-primary-400' : 'text-foreground'">
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
              class="text-sm text-muted hover:text-foreground transition-colors relative"
              active-class="text-foreground font-medium"
            >
              Ranking
              <span
                v-if="myPosition"
                class="absolute -top-2 -right-4 size-4.5 flex items-center justify-center rounded-full bg-primary-400 text-slate-700 dark:text-slate-200 text-[10px] font-bold leading-none"
              >
                {{ myPosition }}
              </span>
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
              :src="headerAvatarUrl"
              :alt="user.email"
              size="xs"
              class="mr-1"
            />
            <span class="hidden sm:inline text-sm">{{ displayEmail }}</span>
          </UButton>

          <template #account-leading>
            <UAvatar :src="headerAvatarUrl" :alt="user.email" size="xs" />
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
          <div class="relative">
            <UIcon name="i-lucide-trophy" class="size-5" />
            <span
              v-if="myPosition"
              class="absolute -top-1.5 -right-2.5 size-4 flex items-center justify-center rounded-full bg-primary-400 text-slate-700 dark:text-slate-200 text-[9px] font-bold leading-none"
            >
              {{ myPosition }}
            </span>
          </div>
          <span class="text-xs">Ranking</span>
        </NuxtLink>
      </div>
    </nav>

    <UModal
      :open="showRulesModal"
      title="Reglas del juego"
      @update:open="(v: boolean) => { if (!v) showRulesModal = false }"
    >
      <template #body>
        <div class="space-y-5 text-sm">
          <section>
            <h3 class="font-semibold text-base mb-2">Premios</h3>
            <ul class="space-y-1">
              <li>🥇 1r premio: <span class="font-semibold text-primary">108€</span></li>
              <li>🥈 2º premio: <span class="font-semibold text-primary">45€</span></li>
              <li>🥉 3r premio: <span class="font-semibold text-primary">27€</span></li>
            </ul>
          </section>

          <section>
            <h3 class="font-semibold text-base mb-2">Puntuación — Partidos</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="border-b border-border text-muted">
                    <th class="pb-1.5 font-medium">Fase</th>
                    <th class="pb-1.5 font-medium text-right">Acierto</th>
                    <th class="pb-1.5 font-medium text-right">Exacto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr><td class="py-1.5">Grupos</td><td class="text-right">1 pt</td><td class="text-right font-semibold text-primary">3 pts</td></tr>
                  <tr><td class="py-1.5">Dieciseisavos</td><td class="text-right">2 pts</td><td class="text-right font-semibold text-primary">5 pts</td></tr>
                  <tr><td class="py-1.5">Octavos</td><td class="text-right">3 pts</td><td class="text-right font-semibold text-primary">7 pts</td></tr>
                  <tr><td class="py-1.5">Cuartos</td><td class="text-right">4 pts</td><td class="text-right font-semibold text-primary">9 pts</td></tr>
                  <tr><td class="py-1.5">Semifinales</td><td class="text-right">5 pts</td><td class="text-right font-semibold text-primary">11 pts</td></tr>
                  <tr><td class="py-1.5">3r y 4º puesto</td><td class="text-right">4 pts</td><td class="text-right font-semibold text-primary">9 pts</td></tr>
                  <tr><td class="py-1.5">Final</td><td class="text-right">6 pts</td><td class="text-right font-semibold text-primary">13 pts</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 class="font-semibold text-base mb-2">Premios individuales</h3>
            <ul class="space-y-1">
              <li>Mejor jugador (MVP): <span class="font-semibold text-primary">8 pts</span></li>
              <li>Mejor jugador joven: <span class="font-semibold text-primary">6 pts</span></li>
              <li>Máximo goleador: <span class="font-semibold text-primary">8 pts</span></li>
              <li>Mejor portero: <span class="font-semibold text-primary">6 pts</span></li>
            </ul>
          </section>
        </div>
      </template>
    </UModal>
  </div>
</template>
