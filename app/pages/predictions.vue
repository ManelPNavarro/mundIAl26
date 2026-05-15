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
  home_score: number | null
  away_score: number | null
  home_advances: boolean | null
  home_team: Team | null
  away_team: Team | null
}

type Prediction = { home: number | null, away: number | null, homeAdvances?: boolean | null }
type Predictions = Record<string, Prediction>

interface Player {
  id: string
  name: string
  position: string | null
  team: { name: string } | null
}

interface SideBets {
  winner_team_id: string | null
  best_player: string | null
  best_young_player: string | null
  top_scorer: string | null
  best_goalkeeper: string | null
}

// UI state uses player UUIDs for the combobox; resolved to names on save
interface SideBetIds {
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
interface MatchSummary {
  result: { home: number, away: number, home_advances: boolean | null }
  points: number
  isExact: boolean
  isCorrect: boolean
}

const [{ data: allMatches }, { data: allPlayers }, savedPredictions, savedSideBets, matchSummary, officialAwards, scoringConfig] = await Promise.all([
  useFetch<Match[]>('/api/matches'),
  useFetch<Player[]>('/api/players'),
  $fetch<Predictions>('/api/predictions', { headers }),
  $fetch<SideBets | null>('/api/side-bets', { headers }),
  $fetch<Record<string, MatchSummary>>('/api/predictions/summary', { headers }),
  $fetch<SideBets | null>('/api/awards'),
  $fetch<Record<string, number>>('/api/scoring-config'),
])

function playerIdByName(name: string | null): string | null {
  if (!name) return null
  return allPlayers.value?.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase())?.id ?? null
}

const predictions = ref<Predictions>(savedPredictions ?? {})
const sideBets = ref<SideBets>({
  winner_team_id: savedSideBets?.winner_team_id ?? null,
  best_player: savedSideBets?.best_player ?? null,
  best_young_player: savedSideBets?.best_young_player ?? null,
  top_scorer: savedSideBets?.top_scorer ?? null,
  best_goalkeeper: savedSideBets?.best_goalkeeper ?? null,
})
const sideBetIds = ref<SideBetIds>({
  best_player: playerIdByName(savedSideBets?.best_player ?? null),
  best_young_player: playerIdByName(savedSideBets?.best_young_player ?? null),
  top_scorer: playerIdByName(savedSideBets?.top_scorer ?? null),
  best_goalkeeper: playerIdByName(savedSideBets?.best_goalkeeper ?? null),
})
const currentStep = ref(0)

const AWARD_SCORE_KEY: Partial<Record<keyof SideBets, string>> = {
  winner_team_id: 'award_winner',
  best_player: 'award_best_player',
  best_young_player: 'award_best_young_player',
  top_scorer: 'award_top_scorer',
  best_goalkeeper: 'award_best_goalkeeper',
}

function awardResult(field: keyof SideBets): { correct: boolean, pts: number } | null {
  const official = officialAwards?.[field]
  if (!official) return null
  const user = sideBets.value[field]
  if (!user) return null
  const correct = user.toLowerCase() === (official as string).toLowerCase()
  const pts = correct ? (scoringConfig?.[AWARD_SCORE_KEY[field]!] ?? 0) : 0
  return { correct, pts }
}


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

const finalMatch = computed(() => allMatches.value?.find(m => m.round === 'FINAL') ?? null)

const predictedWinnerTeamId = computed(() => {
  const m = finalMatch.value
  if (!m) return null
  const p = predictions.value[m.id]
  if (p?.home == null || p?.away == null) return null
  if (p.home > p.away) return m.home_team?.id ?? null
  if (p.away > p.home) return m.away_team?.id ?? null
  return p.homeAdvances === true ? (m.home_team?.id ?? null) : (m.away_team?.id ?? null)
})

const predictedWinnerName = computed(() => {
  const m = finalMatch.value
  if (!m) return null
  const p = predictions.value[m.id]
  if (p?.home == null || p?.away == null) return null
  const homeWins = p.home > p.away || (p.home === p.away && p.homeAdvances === true)
  return (homeWins ? m.home_team?.name : m.away_team?.name) ?? null
})

const winnerResult = computed(() => {
  const official = officialAwards?.winner_team_id
  if (!official) return null
  const predicted = predictedWinnerTeamId.value
  const correct = !!predicted && predicted === official
  return { correct, pts: correct ? (scoringConfig?.award_winner ?? 0) : 0 }
})

const sideBetsComplete = computed(() =>
  !!sideBetIds.value.best_player &&
  !!sideBetIds.value.best_young_player &&
  !!sideBetIds.value.top_scorer &&
  !!sideBetIds.value.best_goalkeeper
)

const sideBetsFilled = computed(() =>
  [sideBetIds.value.best_player, sideBetIds.value.best_young_player, sideBetIds.value.top_scorer, sideBetIds.value.best_goalkeeper]
    .filter(Boolean).length
)

const totalItems = computed(() => (allMatches.value?.length ?? 0) + 5)
const totalFilled = computed(() => {
  const matchFilled = (allMatches.value ?? []).filter(m => isFilled(m.id)).length
  return matchFilled + sideBetsFilled.value
})
const completionPct = computed(() =>
  totalItems.value > 0 ? Math.round((totalFilled.value / totalItems.value) * 100) : 0
)

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
  {
    key: 'awards',
    title: 'Premios',
    description: `${sideBetsFilled.value}/4 apuestas`,
    complete: sideBetsComplete.value,
  },
])

const isAwardsStep = computed(() => currentStep.value === steps.value.length - 1)
const currentRound = computed(() =>
  !isAwardsStep.value && currentStep.value > 0 ? knockoutRounds.value[currentStep.value - 1] : null
)

// ─── Save ────────────────────────────────────────────────────────────────────
const saving = ref(false)

async function saveMatches() {
  const h = await getAuthHeaders()
  const payload: Predictions = {}
  for (const [id, p] of Object.entries(predictions.value)) {
    if (p.home !== null && p.home !== undefined && p.away !== null && p.away !== undefined) {
      payload[id] = p
    }
  }
  await $fetch('/api/predictions', { method: 'POST', headers: h, body: payload })
}

function playerNameById(id: string | null): string | null {
  if (!id) return null
  return allPlayers.value?.find(p => p.id === id)?.name ?? null
}

async function saveSideBets() {
  const h = await getAuthHeaders()
  await $fetch('/api/side-bets', {
    method: 'POST',
    headers: h,
    body: {
      winner_team_id: predictedWinnerTeamId.value,
      best_player: playerNameById(sideBetIds.value.best_player),
      best_young_player: playerNameById(sideBetIds.value.best_young_player),
      top_scorer: playerNameById(sideBetIds.value.top_scorer),
      best_goalkeeper: playerNameById(sideBetIds.value.best_goalkeeper),
    },
  })
}

async function save() {
  if (isLocked.value) return
  saving.value = true
  try {
    if (isAwardsStep.value) {
      await saveSideBets()
    } else {
      await saveMatches()
    }
    toast.add({ title: 'Guardado', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function advance() {
  if (isLocked.value) return
  saving.value = true
  try {
    await saveMatches()
    if (currentStep.value < steps.value.length - 1) currentStep.value++
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    saving.value = false
  }
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
      <UButton v-if="!isLocked && !isAwardsStep" variant="outline" color="neutral" icon="i-lucide-shuffle" size="sm" @click="randomize">
        Aleatorio
      </UButton>
    </div>

    <!-- Stepper -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex flex-wrap gap-2 flex-1">
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
      <div class="shrink-0 flex flex-col items-center leading-none pt-1">
        <span class="text-sm font-bold" :class="completionPct === 100 ? 'text-success' : 'text-primary'">{{ completionPct }}%</span>
        <span class="text-xs text-muted mt-0.5">completado</span>
      </div>
    </div>

    <!-- Locked banner -->
    <UAlert v-if="isLocked" color="error" variant="soft" icon="i-lucide-lock"
      title="Predicciones cerradas"
      description="El plazo para introducir predicciones finalizó el 10 de junio. ¡Que empiece el Mundial!" />

    <!-- Completed banner -->
    <UAlert v-if="steps.every(s => s.complete) && !isLocked" color="success" variant="soft"
      icon="i-lucide-party-popper" title="¡Predicción finalizada!"
      description="Has completado todas las fases y tus apuestas de premios. ¡Suerte!" />

    <!-- Step content -->
    <div>
      <div v-if="currentStep === 0">
        <PredictionsGroupStage v-model="predictions" :groups="groupStageGroups" :locked="isLocked" :summary="matchSummary" />
      </div>
      <div v-else-if="currentRound">
        <PredictionsKnockoutRound v-model="predictions" :matches="currentRound.matches" :all-matches="allMatches ?? []" :locked="isLocked" :summary="matchSummary" />
      </div>
      <div v-else-if="isAwardsStep" class="space-y-6">
        <div>
          <h2 class="text-base font-semibold text-foreground">Premios del torneo</h2>
          <p class="text-sm text-muted mt-0.5">Adivina los ganadores de los premios individuales al final del Mundial.</p>
        </div>
        <div class="space-y-4 max-w-md">
          <!-- Champion derived from Final prediction -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Equipo campeón</label>
            <div
              v-if="predictedWinnerName"
              :class="[
                'px-4 py-3 rounded-md border-2 text-sm font-semibold flex items-center justify-between',
                winnerResult?.correct ? 'border-success text-success bg-success/10' :
                winnerResult?.correct === false ? 'border-error text-error bg-error/10' :
                'border-primary text-primary bg-primary/10'
              ]"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-trophy" class="size-4 shrink-0" />
                <span>{{ predictedWinnerName }}</span>
              </div>
              <span v-if="winnerResult?.correct" class="text-xs font-semibold">+{{ winnerResult.pts }} pts</span>
            </div>
            <p v-else class="text-xs text-muted">Se determinará según tu predicción de la Final.</p>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Mejor jugador (MVP)</label>
            <div v-if="officialAwards?.best_player" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('best_player')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.best_player ?? '—' }}</span>
              <span v-if="awardResult('best_player')?.correct" class="text-xs font-semibold">+{{ awardResult('best_player')!.pts }} pts</span>
            </div>
            <PlayerSelect v-else v-model="sideBetIds.best_player" :players="allPlayers ?? []" placeholder="Buscar jugador..." :disabled="isLocked" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Mejor jugador joven</label>
            <div v-if="officialAwards?.best_young_player" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('best_young_player')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.best_young_player ?? '—' }}</span>
              <span v-if="awardResult('best_young_player')?.correct" class="text-xs font-semibold">+{{ awardResult('best_young_player')!.pts }} pts</span>
            </div>
            <PlayerSelect v-else v-model="sideBetIds.best_young_player" :players="allPlayers ?? []" placeholder="Buscar jugador..." :disabled="isLocked" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Máximo goleador</label>
            <div v-if="officialAwards?.top_scorer" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('top_scorer')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.top_scorer ?? '—' }}</span>
              <span v-if="awardResult('top_scorer')?.correct" class="text-xs font-semibold">+{{ awardResult('top_scorer')!.pts }} pts</span>
            </div>
            <PlayerSelect v-else v-model="sideBetIds.top_scorer" :players="allPlayers ?? []" placeholder="Buscar jugador..." :disabled="isLocked" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Mejor portero</label>
            <div v-if="officialAwards?.best_goalkeeper" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('best_goalkeeper')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.best_goalkeeper ?? '—' }}</span>
              <span v-if="awardResult('best_goalkeeper')?.correct" class="text-xs font-semibold">+{{ awardResult('best_goalkeeper')!.pts }} pts</span>
            </div>
            <PlayerSelect v-else v-model="sideBetIds.best_goalkeeper" :players="allPlayers ?? []" placeholder="Buscar jugador..." :disabled="isLocked" />
          </div>
        </div>
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
          v-if="!isAwardsStep"
          :disabled="!steps[currentStep]?.complete || isLocked"
          :loading="saving"
          trailing-icon="i-lucide-arrow-right"
          @click="advance"
        >
          Guardar y continuar
        </UButton>
        <UButton
          v-else
          :disabled="!sideBetsComplete || isLocked"
          :loading="saving"
          icon="i-lucide-check"
          color="success"
          @click="save"
        >
          Guardar predicciones
        </UButton>
      </div>
    </div>

    <!-- Countdown -->
    <div v-if="timeLeft && !isLocked" class="flex items-center justify-center gap-2 text-xs text-muted">
      <UIcon name="i-lucide-clock" class="size-3 shrink-0" />
      <span>Cierra en</span>
      <span class="font-mono font-medium text-foreground">
        {{ timeLeft.days }}d {{ String(timeLeft.hours).padStart(2, '0') }}h {{ String(timeLeft.minutes).padStart(2, '0') }}m {{ String(timeLeft.seconds).padStart(2, '0') }}s
      </span>
    </div>
  </div>
</template>
