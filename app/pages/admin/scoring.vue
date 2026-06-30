<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

type ScoringConfig = Record<string, number>

const supabase = useSupabaseClient()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

const NUMERIC_KEYS = [
  'group_correct', 'group_exact',
  'r32_correct', 'r32_exact', 'r32_advance',
  'r16_correct', 'r16_exact', 'r16_advance',
  'qf_correct', 'qf_exact', 'qf_advance',
  'sf_correct', 'sf_exact', 'sf_advance',
  'third_place_correct', 'third_place_exact',
  'final_correct', 'final_exact',
  'award_best_player', 'award_best_young_player',
  'award_top_scorer', 'award_best_goalkeeper',
]

const headers = await getAuthHeaders()
const raw = await $fetch<ScoringConfig>('/api/admin/scoring-config', { headers })

function extractNumeric(data: ScoringConfig): ScoringConfig {
  return Object.fromEntries(NUMERIC_KEYS.map(k => [k, Number(data[k] ?? 0)]))
}

const original = extractNumeric(raw)
const config = ref<ScoringConfig>({ ...original })

const isConfigDirty = computed(() =>
  NUMERIC_KEYS.some(k => config.value[k] !== original[k])
)

const savingConfig = ref(false)

async function saveConfig() {
  savingConfig.value = true
  try {
    const h = await getAuthHeaders()
    await $fetch('/api/admin/scoring-config', { method: 'PATCH', headers: h, body: config.value })
    NUMERIC_KEYS.forEach(k => { original[k] = config.value[k]! })
    toast.add({ title: 'Configuración guardada', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    savingConfig.value = false
  }
}

function resetConfig() { config.value = { ...original } }

function updateKey(key: string, val: string) {
  config.value = { ...config.value, [key]: Number(val) }
}

const MATCH_ROWS = [
  { label: 'Fase de grupos',   correct: 'group_correct',       exact: 'group_exact',       advance: null },
  { label: 'Dieciseisavos',    correct: 'r32_correct',         exact: 'r32_exact',         advance: 'r32_advance' },
  { label: 'Octavos de final', correct: 'r16_correct',         exact: 'r16_exact',         advance: 'r16_advance' },
  { label: 'Cuartos de final', correct: 'qf_correct',          exact: 'qf_exact',          advance: 'qf_advance' },
  { label: 'Semifinales',      correct: 'sf_correct',          exact: 'sf_exact',          advance: 'sf_advance' },
  { label: 'Tercer y cuarto',  correct: 'third_place_correct', exact: 'third_place_exact', advance: null },
  { label: 'Final',            correct: 'final_correct',       exact: 'final_exact',       advance: null },
]

const AWARD_POINT_ROWS = [
  { label: 'Mejor jugador (MVP)',     key: 'award_best_player' },
  { label: 'Mejor jugador joven',    key: 'award_best_young_player' },
  { label: 'Máximo goleador',        key: 'award_top_scorer' },
  { label: 'Mejor portero',          key: 'award_best_goalkeeper' },
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
                  <div>Equipo que pasa</div>
                  <div class="text-xs font-normal">(sin acertar el resultado)</div>
                </th>
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
                  <UInput
                    v-if="row.advance"
                    type="number" inputmode="numeric" min="0" max="99" class="w-16 mx-auto text-center" size="sm"
                    :model-value="config[row.advance]"
                    disabled
                  />
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="py-3 text-center">
                  <UInput
                    type="number" inputmode="numeric" min="0" max="99" class="w-16 mx-auto text-center" size="sm"
                    :model-value="config[row.correct]"
                    disabled
                  />
                </td>
                <td class="py-3 text-center">
                  <UInput
                    type="number" inputmode="numeric" min="0" max="99" class="w-16 mx-auto text-center" size="sm"
                    :model-value="config[row.exact]"
                    disabled
                  />
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
            <UInput
              type="number" inputmode="numeric" min="0" max="999" class="w-20 text-center" size="sm"
              :model-value="config[row.key]"
              disabled
            />
          </div>
        </div>
      </UCard>
    </div>

  </div>
</template>
