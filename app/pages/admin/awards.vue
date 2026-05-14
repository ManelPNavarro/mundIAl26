<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface Team { id: string, name: string }
interface Player {
  id: string
  name: string
  position: string | null
  team: { name: string } | null
}
interface Awards {
  winner_team_id: string | null
  best_player: string | null
  best_young_player: string | null
  top_scorer: string | null
  best_goalkeeper: string | null
}
interface AwardIds {
  best_player: string | null
  best_young_player: string | null
  top_scorer: string | null
  best_goalkeeper: string | null
}

const supabase = useSupabaseClient()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

const headers = await getAuthHeaders()
const [{ data: allTeams }, { data: allPlayers }, fetched] = await Promise.all([
  useFetch<Team[]>('/api/teams'),
  useFetch<Player[]>('/api/players'),
  $fetch<Awards>('/api/admin/awards', { headers }),
])

function playerIdByName(name: string | null): string | null {
  if (!name) return null
  return allPlayers.value?.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase())?.id ?? null
}

function playerNameById(id: string | null): string | null {
  if (!id) return null
  return allPlayers.value?.find(p => p.id === id)?.name ?? null
}

const awards = ref<Awards>({
  winner_team_id: fetched?.winner_team_id ?? null,
  best_player: fetched?.best_player ?? null,
  best_young_player: fetched?.best_young_player ?? null,
  top_scorer: fetched?.top_scorer ?? null,
  best_goalkeeper: fetched?.best_goalkeeper ?? null,
})

const awardIds = ref<AwardIds>({
  best_player: playerIdByName(fetched?.best_player ?? null),
  best_young_player: playerIdByName(fetched?.best_young_player ?? null),
  top_scorer: playerIdByName(fetched?.top_scorer ?? null),
  best_goalkeeper: playerIdByName(fetched?.best_goalkeeper ?? null),
})

const originalAwards = { ...awards.value }
const originalIds = { ...awardIds.value }
const saving = ref(false)
const syncing = ref(false)

async function syncPlayers() {
  syncing.value = true
  try {
    const h = await getAuthHeaders()
    const result = await $fetch<{ synced: number, skippedTeams: number }>('/api/admin/sync-players', { method: 'POST', headers: h })
    await refreshNuxtData()
    toast.add({ title: `${result.synced} jugadores sincronizados`, color: 'success' })
  } catch {
    toast.add({ title: 'Error al sincronizar jugadores', color: 'error' })
  } finally {
    syncing.value = false
  }
}

const isDirty = computed(() =>
  awards.value.winner_team_id !== originalAwards.winner_team_id ||
  (Object.keys(awardIds.value) as (keyof AwardIds)[]).some(k => awardIds.value[k] !== originalIds[k])
)

const teamOptions = computed(() =>
  (allTeams.value ?? []).map(t => ({ label: t.name, value: t.id }))
)

async function save() {
  saving.value = true
  try {
    const h = await getAuthHeaders()
    await $fetch('/api/admin/awards', {
      method: 'PATCH',
      headers: h,
      body: {
        winner_team_id: awards.value.winner_team_id,
        best_player: playerNameById(awardIds.value.best_player),
        best_young_player: playerNameById(awardIds.value.best_young_player),
        top_scorer: playerNameById(awardIds.value.top_scorer),
        best_goalkeeper: playerNameById(awardIds.value.best_goalkeeper),
      },
    })
    Object.assign(originalAwards, awards.value)
    Object.assign(originalIds, awardIds.value)
    toast.add({ title: 'Premios guardados', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    saving.value = false
  }
}

function reset() {
  awards.value = { ...originalAwards }
  awardIds.value = { ...originalIds }
}

const AWARD_FIELDS: { key: keyof AwardIds, label: string }[] = [
  { key: 'best_player', label: 'Mejor jugador (MVP)' },
  { key: 'best_young_player', label: 'Mejor jugador joven' },
  { key: 'top_scorer', label: 'Máximo goleador' },
  { key: 'best_goalkeeper', label: 'Mejor portero' },
]
</script>

<template>
  <div class="space-y-8 max-w-md">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Premios oficiales</h1>
        <p class="text-sm text-muted mt-1">Introduce los ganadores reales una vez finalice el torneo.</p>
      </div>
      <div class="flex gap-2">
        <UButton variant="outline" color="neutral" size="sm" :loading="syncing" icon="i-lucide-refresh-cw" @click="syncPlayers">
          Sync jugadores
        </UButton>
        <UButton variant="outline" color="neutral" size="sm" :disabled="!isDirty" @click="reset">
          Descartar
        </UButton>
        <UButton size="sm" :loading="saving" :disabled="!isDirty" icon="i-lucide-save" @click="save">
          Guardar
        </UButton>
      </div>
    </div>

    <UCard>
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-foreground">Equipo campeón</label>
          <USelect
            v-model="awards.winner_team_id"
            :items="teamOptions"
            value-key="value"
            label-key="label"
            placeholder="Selecciona un equipo..."
          />
        </div>
        <div v-for="field in AWARD_FIELDS" :key="field.key" class="flex flex-col gap-2">
          <label class="text-sm font-medium text-foreground">{{ field.label }}</label>
          <PlayerSelect v-model="awardIds[field.key]" :players="allPlayers ?? []" placeholder="Buscar jugador..." />
        </div>
      </div>
    </UCard>
  </div>
</template>
