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

type ScoringConfig = Record<string, number>

const supabase = useSupabaseClient()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

const headers = await getAuthHeaders()
const [originalConfig, { data: allTeams }, { data: allPlayers }, fetchedAwards] = await Promise.all([
  $fetch<ScoringConfig>('/api/admin/scoring-config', { headers }),
  useFetch<Team[]>('/api/teams'),
  useFetch<Player[]>('/api/players'),
  $fetch<Awards>('/api/admin/awards', { headers }),
])

// ─── Scoring config ──────────────────────────────────────────────────────────
const config = ref<ScoringConfig>({ ...originalConfig })

const isConfigDirty = computed(() =>
  Object.keys(config.value).some(k => config.value[k] !== originalConfig[k])
)

const savingConfig = ref(false)

async function saveConfig() {
  savingConfig.value = true
  try {
    const h = await getAuthHeaders()
    await $fetch('/api/admin/scoring-config', { method: 'PATCH', headers: h, body: config.value })
    Object.assign(originalConfig, config.value)
    toast.add({ title: 'Configuración guardada', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    savingConfig.value = false
  }
}

function resetConfig() { config.value = { ...originalConfig } }

const MATCH_ROWS = [
  { label: 'Fase de grupos',   correct: 'group_correct',       exact: 'group_exact' },
  { label: 'Ronda de 32',      correct: 'r32_correct',         exact: 'r32_exact' },
  { label: 'Octavos de final', correct: 'r16_correct',         exact: 'r16_exact' },
  { label: 'Cuartos de final', correct: 'qf_correct',          exact: 'qf_exact' },
  { label: 'Semifinales',      correct: 'sf_correct',          exact: 'sf_exact' },
  { label: 'Tercer y cuarto',  correct: 'third_place_correct', exact: 'third_place_exact' },
  { label: 'Final',            correct: 'final_correct',       exact: 'final_exact' },
]

const AWARD_POINT_ROWS = [
  { label: 'Equipo campeón',         key: 'award_winner' },
  { label: 'Mejor jugador (MVP)',     key: 'award_best_player' },
  { label: 'Mejor jugador joven',    key: 'award_best_young_player' },
  { label: 'Máximo goleador',        key: 'award_top_scorer' },
  { label: 'Mejor portero',          key: 'award_best_goalkeeper' },
]

// ─── Official awards ─────────────────────────────────────────────────────────
function playerIdByName(name: string | null): string | null {
  if (!name) return null
  return allPlayers.value?.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase())?.id ?? null
}

function playerNameById(id: string | null): string | null {
  if (!id) return null
  return allPlayers.value?.find(p => p.id === id)?.name ?? null
}

const awards = ref<Awards>({
  winner_team_id: fetchedAwards?.winner_team_id ?? null,
  best_player: fetchedAwards?.best_player ?? null,
  best_young_player: fetchedAwards?.best_young_player ?? null,
  top_scorer: fetchedAwards?.top_scorer ?? null,
  best_goalkeeper: fetchedAwards?.best_goalkeeper ?? null,
})

const awardIds = ref<AwardIds>({
  best_player: playerIdByName(fetchedAwards?.best_player ?? null),
  best_young_player: playerIdByName(fetchedAwards?.best_young_player ?? null),
  top_scorer: playerIdByName(fetchedAwards?.top_scorer ?? null),
  best_goalkeeper: playerIdByName(fetchedAwards?.best_goalkeeper ?? null),
})

const originalAwards = { ...awards.value }
const originalAwardIds = { ...awardIds.value }

const isAwardsDirty = computed(() =>
  awards.value.winner_team_id !== originalAwards.winner_team_id ||
  (Object.keys(awardIds.value) as (keyof AwardIds)[]).some(k => awardIds.value[k] !== originalAwardIds[k])
)

const savingAwards = ref(false)
const syncing = ref(false)

const teamOptions = computed(() =>
  (allTeams.value ?? []).map(t => ({ label: t.name, value: t.id }))
)

async function saveAwards() {
  savingAwards.value = true
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
    Object.assign(originalAwardIds, awardIds.value)
    toast.add({ title: 'Premios guardados', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    savingAwards.value = false
  }
}

function resetAwards() {
  awards.value = { ...originalAwards }
  awardIds.value = { ...originalAwardIds }
}

async function syncPlayers() {
  syncing.value = true
  try {
    const h = await getAuthHeaders()
    const result = await $fetch<{ synced: number }>('/api/admin/sync-players', { method: 'POST', headers: h })
    await refreshNuxtData()
    toast.add({ title: `${result.synced} jugadores sincronizados`, color: 'success' })
  } catch {
    toast.add({ title: 'Error al sincronizar jugadores', color: 'error' })
  } finally {
    syncing.value = false
  }
}

const AWARD_FIELDS: { key: keyof AwardIds, label: string }[] = [
  { key: 'best_player', label: 'Mejor jugador (MVP)' },
  { key: 'best_young_player', label: 'Mejor jugador joven' },
  { key: 'top_scorer', label: 'Máximo goleador' },
  { key: 'best_goalkeeper', label: 'Mejor portero' },
]
</script>

<template>
  <div class="space-y-10 max-w-2xl">

    <!-- Match scoring -->
    <div class="space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Puntuación</h1>
          <p class="text-sm text-muted mt-1">Configura cuántos puntos vale cada acierto.</p>
        </div>
        <div class="flex gap-2">
          <UButton variant="outline" color="neutral" size="sm" :disabled="!isConfigDirty" @click="resetConfig">
            Descartar
          </UButton>
          <UButton size="sm" :loading="savingConfig" :disabled="!isConfigDirty" icon="i-lucide-save" @click="saveConfig">
            Guardar
          </UButton>
        </div>
      </div>

      <UCard>
        <template #header>
          <h2 class="font-semibold text-foreground">Resultado de partido</h2>
          <p class="text-xs text-muted mt-0.5">Puntos por acertar el resultado de cada partido, según la fase.</p>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left pb-3 font-medium text-muted">Fase</th>
                <th class="text-center pb-3 font-medium text-muted w-36">
                  <div>Resultado correcto</div>
                  <div class="text-xs font-normal">(quién gana o empate)</div>
                </th>
                <th class="text-center pb-3 font-medium text-muted w-36">
                  <div>Resultado exacto</div>
                  <div class="text-xs font-normal">(marcador exacto)</div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="row in MATCH_ROWS" :key="row.correct">
                <td class="py-3 text-foreground">{{ row.label }}</td>
                <td class="py-3 text-center">
                  <UInput v-model.number="config[row.correct]" type="number" min="0" max="99" class="w-16 mx-auto text-center" size="sm" />
                </td>
                <td class="py-3 text-center">
                  <UInput v-model.number="config[row.exact]" type="number" min="0" max="99" class="w-16 mx-auto text-center" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold text-foreground">Puntos por premios</h2>
          <p class="text-xs text-muted mt-0.5">Puntos por acertar cada premio individual.</p>
        </template>
        <div class="space-y-3">
          <div v-for="row in AWARD_POINT_ROWS" :key="row.key" class="flex items-center justify-between gap-4">
            <span class="text-sm text-foreground">{{ row.label }}</span>
            <UInput v-model.number="config[row.key]" type="number" min="0" max="999" class="w-20 text-center" size="sm" />
          </div>
        </div>
      </UCard>
    </div>

    <UDivider />

    <!-- Official awards -->
    <div class="space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-foreground">Premios oficiales</h2>
          <p class="text-sm text-muted mt-1">Ganadores reales del torneo, para calcular puntuaciones.</p>
        </div>
        <div class="flex gap-2">
          <UButton variant="outline" color="neutral" size="sm" :loading="syncing" icon="i-lucide-refresh-cw" @click="syncPlayers">
            Sync jugadores
          </UButton>
          <UButton variant="outline" color="neutral" size="sm" :disabled="!isAwardsDirty" @click="resetAwards">
            Descartar
          </UButton>
          <UButton size="sm" :loading="savingAwards" :disabled="!isAwardsDirty" icon="i-lucide-save" @click="saveAwards">
            Guardar
          </UButton>
        </div>
      </div>

      <UCard>
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Equipo campeón</label>
            <USelect v-model="awards.winner_team_id" :items="teamOptions" value-key="value" label-key="label" placeholder="Selecciona un equipo..." />
          </div>
          <div v-for="field in AWARD_FIELDS" :key="field.key" class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">{{ field.label }}</label>
            <PlayerSelect v-model="awardIds[field.key]" :players="allPlayers ?? []" placeholder="Buscar jugador..." />
          </div>
        </div>
      </UCard>
    </div>

  </div>
</template>
