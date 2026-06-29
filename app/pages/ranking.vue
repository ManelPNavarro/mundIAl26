<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface RankingEntry {
  id: string
  position: number
  name: string
  email: string
  totalPoints: number
  matchPoints: number
  awardPoints: number
  winnerTeam: string | null
}

const currentUser = useSupabaseUser()
const { data: ranking, pending } = await useFetch<RankingEntry[]>('/api/ranking')

onMounted(() => nextTick(() => {
  document.querySelector('[data-me]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}))

const POSITION_STYLES: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
}

const POSITION_ICONS: Record<number, string> = {
  1: 'i-lucide-trophy',
  2: 'i-lucide-medal',
  3: 'i-lucide-award',
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Ranking</h1>
      <p class="text-sm text-muted mt-1">Clasificación general de la porra.</p>
    </div>

    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>

    <div v-else-if="!ranking?.length" class="text-center py-12 text-muted text-sm">
      Todavía no hay participantes.
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="entry in ranking"
        :key="entry.id"
        :data-me="entry.id === currentUser?.id ? '' : undefined"
        class="flex items-center gap-4 px-4 py-2 rounded-lg border transition-colors"
        :class="[
          entry.id === currentUser?.id
            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
            : 'border-border bg-background hover:bg-muted/30',
        ]"
      >
        <!-- Position -->
        <div class="w-8 flex justify-center shrink-0">
          <UIcon
            v-if="POSITION_ICONS[entry.position]"
            :name="POSITION_ICONS[entry.position]!"
            class="size-5"
            :class="POSITION_STYLES[entry.position]"
          />
          <span v-else class="text-sm font-semibold text-muted">{{ entry.position }}</span>
        </div>

        <!-- Name -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <UAvatar :src="useGravatarUrl(entry.email).value" :alt="entry.name" size="sm" />
            <span class="text-sm font-medium text-foreground truncate">
              {{ entry.name }}
            </span>
            <UBadge v-if="entry.id === currentUser?.id" color="primary" variant="subtle" size="xs">
              Tú
            </UBadge>
          </div>
        </div>

        <!-- Points breakdown -->
        <div class="flex items-center gap-2 shrink-0">
          <TeamFlag v-if="entry.winnerTeam" :team="entry.winnerTeam" class="text-lg" />
          <div class="text-right">
            <div class="text-lg font-bold text-foreground leading-none">
              {{ entry.totalPoints }}
              <span class="text-xs font-normal text-muted ml-1">pts</span>
            </div>
            <div v-if="entry.awardPoints > 0" class="text-xs text-muted mt-0.5">
              {{ entry.matchPoints }} partidos + {{ entry.awardPoints }} premios
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="text-xs text-muted text-center">
      Actualizado en tiempo real conforme se introducen resultados.
    </p>
  </div>
</template>
