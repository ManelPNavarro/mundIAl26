<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Team { id: string, name: string }
interface Match {
  id: string
  match_no: number
  round: string
  matchday: number | null
  group_letter: string | null
  home_slot: string | null
  away_slot: string | null
  home_team: Team | null
  away_team: Team | null
}

type Prediction = { home: number | null, away: number | null, homeAdvances?: boolean | null }
type Predictions = Record<string, Prediction>

const supabase = useSupabaseClient()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

// Load matches and existing predictions in parallel
const headers = await getAuthHeaders()
const [{ data: allMatches }, savedPredictions] = await Promise.all([
  useFetch<Match[]>('/api/matches'),
  $fetch<Predictions>('/api/predictions', { headers }),
])

const predictions = ref<Predictions>(savedPredictions ?? {})
const currentStep = ref(0)

// ─── Deadline & countdown ───────────────────────────────────────────────────
const DEADLINE = new Date('2026-06-11T00:00:00')
const now = ref(new Date())
const isLocked = computed(() => now.value >= DEADLINE)
const timeLeft = computed(() => {
  const diff = DEADLINE.getTime() - now.value.getTime()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
})
let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(timer))

// ─── Match grouping ──────────────────────────────────────────────────────────
const ROUND_ORDER = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL']
const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Fase de grupos', R32: 'Ronda de 32', R16: 'Octavos de final',
  QF: 'Cuartos de final', SF: 'Semifinales', THIRD_PLACE: 'Tercer puesto', FINAL: 'Final',
}

const groupStageGroups = computed(() =>
  ['A','B','C','D','E','F','G','H','I','J','K','L'].map(letter => ({
    letter,
    matches: (allMatches.value ?? []).filter(m => m.round === 'GROUP' && m.group_letter === letter),
  })).filter(g => g.matches.length > 0)
)

const knockoutRounds = computed(() =>
  ROUND_ORDER.slice(1).map(round => ({
    key: round,
    label: ROUND_LABELS[round]!,
    matches: (allMatches.value ?? []).filter(m => m.round === round),
  })).filter(r => r.matches.length > 0)
)

// ─── Step completion ─────────────────────────────────────────────────────────
function isFilled(id: string) {
  const p = predictions.value[id]
  return p?.home !== null && p?.home !== undefined && p?.away !== null && p?.away !== undefined
}

const groupMatchIds = computed(() => groupStageGroups.value.flatMap(g => g.matches.map(m => m.id)))
const groupFilled = computed(() => groupMatchIds.value.filter(isFilled).length)
const groupComplete = computed(() => groupFilled.value === groupMatchIds.value.length)

const steps = computed(() => [
  {
    key: 'groups',
    title: ROUND_LABELS['GROUP']!,
    description: `${groupFilled.value}/${groupMatchIds.value.length} partidos`,
    complete: groupComplete.value,
  },
  ...knockoutRounds.value.map((round) => {
    const filled = round.matches.filter(m => isFilled(m.id)).length
    return {
      key: round.key,
      title: round.label,
      description: `${filled}/${round.matches.length} partidos`,
      complete: filled === round.matches.length,
    }
  }),
])

const currentRound = computed(() =>
  currentStep.value > 0 ? knockoutRounds.value[currentStep.value - 1] : null
)

// ─── Save ────────────────────────────────────────────────────────────────────
const saving = ref(false)

async function save() {
  if (isLocked.value) return
  saving.value = true
  try {
    const h = await getAuthHeaders()
    const payload: Predictions = {}
    for (const [id, p] of Object.entries(predictions.value)) {
      if (p.home !== null && p.home !== undefined && p.away !== null && p.away !== undefined) {
        payload[id] = p
      }
    }
    await $fetch('/api/predictions', { method: 'POST', headers: h, body: payload })
    toast.add({ title: 'Predicciones guardadas', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function advance() {
  await save()
  if (currentStep.value < steps.value.length - 1) currentStep.value++
}

// ─── Randomize ───────────────────────────────────────────────────────────────
function randomScore() {
  return [0,0,0,1,1,1,2,2,2,3,3,4][Math.floor(Math.random() * 12)]!
}

function randomize() {
  for (const match of allMatches.value ?? []) {
    const home = randomScore()
    const away = randomScore()
    predictions.value[match.id] = { home, away, homeAdvances: home === away ? Math.random() > 0.5 : null }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Predicciones</h1>
        <p class="text-sm text-muted mt-1">Introduce tus resultados para cada fase del torneo.</p>
      </div>
      <UButton v-if="!isLocked" variant="outline" color="neutral" icon="i-lucide-shuffle" size="sm" @click="randomize">
        Aleatorio
      </UButton>
    </div>

    <!-- Stepper -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(step, idx) in steps"
        :key="step.key"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
        :class="[
          idx === currentStep ? 'bg-primary border-primary text-white'
          : step.complete ? 'bg-success/10 border-success/30 text-success hover:bg-success/20 cursor-pointer'
          : idx < currentStep ? 'bg-muted/50 border-border text-muted hover:bg-muted cursor-pointer'
          : 'bg-muted/20 border-border text-muted/50 cursor-not-allowed',
        ]"
        :disabled="idx > currentStep && !steps[idx - 1]?.complete"
        @click="idx <= currentStep || steps[idx - 1]?.complete ? currentStep = idx : null"
      >
        <UIcon v-if="step.complete && idx !== currentStep" name="i-lucide-check" class="size-3" />
        <span v-else class="font-bold">{{ idx + 1 }}</span>
        {{ step.title }}
      </button>
    </div>

    <!-- Locked banner -->
    <UAlert v-if="isLocked" color="error" variant="soft" icon="i-lucide-lock"
      title="Predicciones cerradas"
      description="El plazo para introducir predicciones finalizó el 10 de junio. ¡Que empiece el Mundial!" />

    <!-- Countdown -->
    <div v-else-if="timeLeft" class="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="i-lucide-clock" class="size-4 shrink-0" />
        <span>Tiempo para cerrar predicciones</span>
      </div>
      <div class="flex items-center gap-3 font-mono text-sm font-semibold text-foreground shrink-0">
        <span><span class="text-primary">{{ timeLeft.days }}</span>d</span>
        <span><span class="text-primary">{{ String(timeLeft.hours).padStart(2, '0') }}</span>h</span>
        <span><span class="text-primary">{{ String(timeLeft.minutes).padStart(2, '0') }}</span>m</span>
        <span><span class="text-primary">{{ String(timeLeft.seconds).padStart(2, '0') }}</span>s</span>
      </div>
    </div>

    <!-- Completed banner -->
    <UAlert v-if="steps.every(s => s.complete) && !isLocked" color="success" variant="soft"
      icon="i-lucide-party-popper" title="¡Predicción finalizada!"
      description="Has completado todas las fases. Puedes volver atrás para modificar cualquier resultado." />

    <!-- Step content -->
    <div>
      <div v-if="currentStep === 0">
        <PredictionsGroupStage v-model="predictions" :groups="groupStageGroups" :locked="isLocked" />
      </div>
      <div v-else-if="currentRound">
        <p class="text-sm text-muted mb-4">Los equipos se confirmarán una vez finalice la fase anterior.</p>
        <PredictionsKnockoutRound v-model="predictions" :matches="currentRound.matches" :locked="isLocked" />
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-2 border-t border-border">
      <UButton v-if="currentStep > 0" variant="ghost" color="neutral" icon="i-lucide-arrow-left" @click="currentStep--">
        Anterior
      </UButton>
      <div v-else />

      <div class="flex items-center gap-3">
        <span class="text-xs text-muted">{{ steps[currentStep]?.description }}</span>
        <UButton
          v-if="currentStep < steps.length - 1"
          :disabled="!steps[currentStep]?.complete || isLocked"
          :loading="saving"
          trailing-icon="i-lucide-arrow-right"
          @click="advance"
        >
          Guardar y continuar
        </UButton>
        <UButton
          v-else
          :disabled="!steps[currentStep]?.complete || isLocked"
          :loading="saving"
          icon="i-lucide-check"
          color="success"
          @click="save"
        >
          Guardar predicciones
        </UButton>
      </div>
    </div>
  </div>
</template>
