<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const supabase = useSupabaseClient()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

type ScoringConfig = Record<string, number>

const headers = await getAuthHeaders()
const original = await $fetch<ScoringConfig>('/api/admin/scoring-config', { headers })
const config = ref<ScoringConfig>({ ...original })
const saving = ref(false)

const isDirty = computed(() =>
  Object.keys(config.value).some(k => config.value[k] !== original[k])
)

async function save() {
  saving.value = true
  try {
    const h = await getAuthHeaders()
    await $fetch('/api/admin/scoring-config', {
      method: 'PATCH',
      headers: h,
      body: config.value,
    })
    Object.assign(original, config.value)
    toast.add({ title: 'Configuración guardada', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    saving.value = false
  }
}

function reset() {
  config.value = { ...original }
}

const MATCH_ROWS = [
  { label: 'Fase de grupos',       correct: 'group_correct',       exact: 'group_exact' },
  { label: 'Ronda de 32',          correct: 'r32_correct',         exact: 'r32_exact' },
  { label: 'Octavos de final',     correct: 'r16_correct',         exact: 'r16_exact' },
  { label: 'Cuartos de final',     correct: 'qf_correct',          exact: 'qf_exact' },
  { label: 'Semifinales',          correct: 'sf_correct',          exact: 'sf_exact' },
  { label: 'Tercer y cuarto',      correct: 'third_place_correct', exact: 'third_place_exact' },
  { label: 'Final',                correct: 'final_correct',       exact: 'final_exact' },
]

const AWARD_ROWS = [
  { label: 'Equipo campeón',           key: 'award_winner' },
  { label: 'Mejor jugador (MVP)',       key: 'award_best_player' },
  { label: 'Mejor jugador joven',       key: 'award_best_young_player' },
  { label: 'Máximo goleador',           key: 'award_top_scorer' },
  { label: 'Mejor portero',             key: 'award_best_goalkeeper' },
]
</script>

<template>
  <div class="space-y-8 max-w-2xl">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Puntuación</h1>
        <p class="text-sm text-muted mt-1">Configura cuántos puntos vale cada acierto.</p>
      </div>
      <div class="flex gap-2">
        <UButton variant="outline" color="neutral" size="sm" :disabled="!isDirty" @click="reset">
          Descartar
        </UButton>
        <UButton size="sm" :loading="saving" :disabled="!isDirty" icon="i-lucide-save" @click="save">
          Guardar
        </UButton>
      </div>
    </div>

    <!-- Match scoring -->
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
                <UInput
                  v-model.number="config[row.correct]"
                  type="number"
                  min="0"
                  max="99"
                  class="w-16 mx-auto text-center"
                  size="sm"
                />
              </td>
              <td class="py-3 text-center">
                <UInput
                  v-model.number="config[row.exact]"
                  type="number"
                  min="0"
                  max="99"
                  class="w-16 mx-auto text-center"
                  size="sm"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Awards scoring -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-foreground">Premios del torneo</h2>
        <p class="text-xs text-muted mt-0.5">Puntos por acertar cada premio individual.</p>
      </template>

      <div class="space-y-3">
        <div
          v-for="row in AWARD_ROWS"
          :key="row.key"
          class="flex items-center justify-between gap-4"
        >
          <span class="text-sm text-foreground">{{ row.label }}</span>
          <UInput
            v-model.number="config[row.key]"
            type="number"
            min="0"
            max="999"
            class="w-20 text-center"
            size="sm"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
