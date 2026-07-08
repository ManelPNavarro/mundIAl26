<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Team { id: string, name: string }
interface Match {
  id: string
  match_no: number
  round: string
  status: string
  kickoff_at: string | null
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

interface SideBets {
  winner_team_id: string | null
  best_player: string | null
  best_young_player: string | null
  top_scorer: string | null
  best_goalkeeper: string | null
}


const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useAppToast()

const userName = ref(user.value?.user_metadata?.name ?? '')
const savingName = ref(false)
const showNameModal = computed(() => !user.value?.user_metadata?.name)

async function saveName() {
  if (!userName.value.trim()) return
  savingName.value = true
  try {
    const { error } = await supabase.auth.updateUser({ data: { name: userName.value.trim() } })
    if (error) throw error
    userName.value = userName.value.trim()
  } catch (e: unknown) {
    toast.add({ title: 'Error al guardar', description: e instanceof Error ? e.message : 'Error desconocido', color: 'error' })
  } finally {
    savingName.value = false
  }
}

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
  wrongTeams?: boolean
}

interface Player { id: string, name: string }

const [{ data: allMatches }, { data: allPlayers }, { data: roundLocks }, savedPredictions, savedSideBets, matchSummary, officialAwards, scoringConfig, lastUpdatedRes, appSettings] = await Promise.all([
  useFetch<Match[]>('/api/matches'),
  useFetch<Player[]>('/api/players'),
  useFetch<Record<string, boolean>>('/api/round-locks'),
  $fetch<Predictions>('/api/predictions', { headers }),
  $fetch<SideBets | null>('/api/side-bets', { headers }),
  $fetch<Record<string, MatchSummary>>('/api/predictions/summary', { headers }),
  $fetch<SideBets | null>('/api/awards'),
  $fetch<Record<string, number>>('/api/scoring-config'),
  $fetch<{ updated_at: string | null }>('/api/matches/last-updated'),
  $fetch<{ catch_up_mode: boolean }>('/api/app-settings'),
])

const lastResultsUpdate = lastUpdatedRes?.updated_at
  ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(lastUpdatedRes.updated_at))
  : null

const predictions = ref<Predictions>(savedPredictions ?? {})
const sideBets = ref<SideBets>({
  winner_team_id: savedSideBets?.winner_team_id ?? null,
  best_player: savedSideBets?.best_player ?? null,
  best_young_player: savedSideBets?.best_young_player ?? null,
  top_scorer: savedSideBets?.top_scorer ?? null,
  best_goalkeeper: savedSideBets?.best_goalkeeper ?? null,
})
const currentStep = ref(0)

const AWARD_SCORE_KEY: Partial<Record<keyof SideBets, string>> = {
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


// ─── Round locks (admin-controlled semaphores) ───────────────────────────────
function isRoundOpen(round: string): boolean {
  return roundLocks.value?.[round] === true
}

// ─── Catch-up mode ────────────────────────────────────────────────────────────
// While on, a user who hadn't completed all their fillable predictions at page
// load may still fill the matches they're missing (not-yet-started ones), even
// in closed rounds. Snapshot completeness at load so the inputs don't lock
// mid-typing as the last prediction is entered.
const catchUpMode = appSettings?.catch_up_mode ?? false
const wasIncompleteAtLoad = (() => {
  const filled = new Set(
    Object.entries(savedPredictions ?? {})
      .filter(([, p]) => p?.home != null && p?.away != null)
      .map(([id]) => id),
  )
  const now = Date.now()
  return (allMatches.value ?? []).some(m =>
    m.home_score === null
    && (!m.kickoff_at || new Date(m.kickoff_at).getTime() > now)
    && !filled.has(m.id),
  )
})()
const catchUpActive = computed(() => catchUpMode && wasIncompleteAtLoad)

function isRoundEditable(round: string): boolean {
  return isRoundOpen(round) || catchUpActive.value
}

function isStepNavigable(idx: number): boolean {
  return true
}

const currentStepRound = computed(() => {
  if (isAwardsStep.value) return null
  return currentStep.value === 0 ? 'GROUP' : (currentRound.value?.key ?? null)
})

const TEMP_UNLOCK_USER_ID = '1a760a50-5eba-45a8-aaa0-696ac404e1b3'

const isLocked = computed(() => {
  if (user.value?.id === TEMP_UNLOCK_USER_ID && currentStep.value === 0) return false
  if (isAwardsStep.value) return !isRoundOpen('PREMIOS')
  return !currentStepRound.value || !isRoundEditable(currentStepRound.value)
})

onMounted(() => { currentStep.value = initialStepIndex.value })

// ─── Pending matches progress ────────────────────────────────────────────────
const openMatches = computed(() => (allMatches.value ?? []).filter(m => isRoundEditable(m.round)))
const totalOpenCount = computed(() => openMatches.value.length)
const filledOpenCount = computed(() =>
  openMatches.value.filter((m) => {
    const p = predictions.value[m.id]
    return p?.home != null && p?.away != null
  }).length,
)
const pendingMatchesCount = computed(() =>
  openMatches.value.filter((m) => {
    // Only count matches the user can still fill: not finished and not yet started.
    if (m.home_score !== null || m.status !== 'SCHEDULED') return false
    if (m.kickoff_at && new Date(m.kickoff_at).getTime() <= Date.now()) return false
    const p = predictions.value[m.id]
    return !(p?.home != null && p?.away != null)
  }).length,
)

// ─── Match grouping ──────────────────────────────────────────────────────────
const ROUND_ORDER = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL']
const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Fase de grupos', R32: 'Dieciseisavos', R16: 'Octavos de final',
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

// A match can still be filled only if it hasn't finished or started yet.
function isStillFillable(m: Match): boolean {
  if (m.home_score !== null) return false
  if (m.status !== 'SCHEDULED') return false
  if (m.kickoff_at && new Date(m.kickoff_at).getTime() <= Date.now()) return false
  return true
}

// A round is "complete" when nothing is left to fill: every match is either
// predicted or no longer fillable (already started/finished).
function matchesComplete(matches: Match[]): boolean {
  return matches.length > 0 && matches.every(m => isFilled(m.id) || !isStillFillable(m))
}

const groupMatchIds = computed(() => groupStageGroups.value.flatMap(g => g.matches.map(m => m.id)))
const groupFilled = computed(() => groupMatchIds.value.filter(isFilled).length)
const groupComplete = computed(() => groupMatchIds.value.length > 0 && groupFilled.value === groupMatchIds.value.length)

const finalMatch = computed(() => allMatches.value?.find(m => m.round === 'FINAL') ?? null)

function scoreFor(m: Match): { home: number, away: number, homeAdvances: boolean | null } | null {
  if (m.round === 'GROUP') {
    if (m.home_score !== null && m.away_score !== null)
      return { home: m.home_score, away: m.away_score, homeAdvances: m.home_advances }
    const p = predictions.value[m.id]
    if (p?.home != null && p?.away != null)
      return { home: p.home, away: p.away, homeAdvances: p.homeAdvances ?? null }
    return null
  }
  const p = predictions.value[m.id]
  if (p?.home != null && p?.away != null)
    return { home: p.home, away: p.away, homeAdvances: p.homeAdvances ?? null }
  if (m.home_score !== null && m.away_score !== null)
    return { home: m.home_score, away: m.away_score, homeAdvances: m.home_advances }
  return null
}

function resolveMatchSide(m: Match, side: 'home' | 'away'): string | null {
  const team = side === 'home' ? m.home_team : m.away_team
  if (team) return team.name
  const slot = side === 'home' ? m.home_slot : m.away_slot
  return slot ? resolveSlotName(slot) : null
}

function resolveSlotName(slot: string): string | null {
  if (slot.startsWith('W') || slot.startsWith('L')) {
    const isWinner = slot.startsWith('W')
    const m = allMatches.value?.find(x => x.match_no === parseInt(slot.slice(1)))
    if (!m) return null
    const s = scoreFor(m)
    if (!s) return null
    const homeWins = s.home > s.away || (s.home === s.away && s.homeAdvances === true)
    return isWinner
      ? (homeWins ? resolveMatchSide(m, 'home') : resolveMatchSide(m, 'away'))
      : (homeWins ? resolveMatchSide(m, 'away') : resolveMatchSide(m, 'home'))
  }

  const pos = parseInt(slot[0]!)
  const groupLetters = slot.slice(1).split('')
  if (!isNaN(pos) && groupLetters.length > 0) {
    const standing = (letter: string) => {
      const groupMatches = (allMatches.value ?? []).filter(x => x.round === 'GROUP' && x.group_letter === letter)
      const table = new Map<string, { name: string, pts: number, gd: number, gf: number }>()
      for (const m of groupMatches) {
        if (!m.home_team || !m.away_team) continue
        const s = scoreFor(m)
        if (!s) continue
        if (!table.has(m.home_team.id)) table.set(m.home_team.id, { name: m.home_team.name, pts: 0, gd: 0, gf: 0 })
        if (!table.has(m.away_team.id)) table.set(m.away_team.id, { name: m.away_team.name, pts: 0, gd: 0, gf: 0 })
        const h = table.get(m.home_team.id)!
        const a = table.get(m.away_team.id)!
        h.gf += s.home; h.gd += s.home - s.away
        a.gf += s.away; a.gd += s.away - s.home
        if (s.home > s.away) h.pts += 3
        else if (s.home === s.away) { h.pts += 1; a.pts += 1 }
        else a.pts += 3
      }
      return [...table.values()].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    }
    if (groupLetters.length === 1) return standing(groupLetters[0]!)[pos - 1]?.name ?? null
    const candidates = groupLetters.map(l => standing(l)[pos - 1]).filter(Boolean) as { name: string, pts: number, gd: number, gf: number }[]
    candidates.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    return candidates[0]?.name ?? null
  }

  return null
}

const predictedWinnerTeamId = computed(() => {
  const m = finalMatch.value
  if (!m) return null
  const p = predictions.value[m.id]
  if (p?.home == null || p?.away == null) return null
  if (p.home > p.away) return m.home_team?.id ?? null
  if (p.away > p.home) return m.away_team?.id ?? null
  return p.homeAdvances === true ? (m.home_team?.id ?? null) : (m.away_team?.id ?? null)
})


const sideBetsComplete = computed(() =>
  !!sideBets.value.best_player &&
  !!sideBets.value.best_young_player &&
  !!sideBets.value.top_scorer &&
  !!sideBets.value.best_goalkeeper
)

const sideBetsFilled = computed(() =>
  [sideBets.value.best_player, sideBets.value.best_young_player, sideBets.value.top_scorer, sideBets.value.best_goalkeeper]
    .filter(Boolean).length
)

const totalItems = computed(() => (allMatches.value?.length ?? 0) + 4)
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
    complete: matchesComplete(groupStageGroups.value.flatMap(g => g.matches)),
  },
  ...knockoutRounds.value.map((round) => {
    const filled = round.matches.filter(m => isFilled(m.id)).length
    return {
      key: round.key,
      title: round.label,
      description: `${filled}/${round.matches.length} partidos`,
      complete: matchesComplete(round.matches),
    }
  }),
  {
    key: 'awards',
    title: 'Premios individuales',
    description: `${sideBetsFilled.value}/4 apuestas`,
    complete: sideBetsComplete.value,
  },
])

const isAwardsStep = computed(() => currentStep.value === steps.value.length - 1)
const currentRound = computed(() =>
  !isAwardsStep.value && currentStep.value > 0 ? knockoutRounds.value[currentStep.value - 1] : null
)

const openStepIndex = computed(() => {
  // First open round wins
  if (isRoundOpen('GROUP')) return 0
  for (let i = 0; i < knockoutRounds.value.length; i++) {
    if (isRoundOpen(knockoutRounds.value[i]!.key)) return i + 1
  }
  // No open round: find the latest round with predictions
  const matchRound = (id: string) => allMatches.value?.find(m => m.id === id)?.round
  const filledRounds = new Set(
    Object.keys(predictions.value)
      .filter(isFilled)
      .map(matchRound)
      .filter(Boolean)
  )
  for (let i = knockoutRounds.value.length - 1; i >= 0; i--) {
    if (filledRounds.has(knockoutRounds.value[i]!.key)) return i + 1
  }
  if (filledRounds.has('GROUP')) return 0
  // No predictions at all: fase de grupos
  return 0
})

function stepIndexForRound(round: string | null | undefined): number {
  if (round === 'GROUP') return 0
  const i = knockoutRounds.value.findIndex(r => r.key === round)
  return i >= 0 ? i + 1 : 0
}

// Initial tab: the round of the most recently kicked-off match (the one being
// played / latest finished). Falls back to the open/predicted round when nothing
// has started yet.
const initialStepIndex = computed(() => {
  const now = Date.now()
  const started = (allMatches.value ?? []).filter(m => m.kickoff_at && new Date(m.kickoff_at).getTime() <= now)
  if (!started.length) return openStepIndex.value
  const latest = started.reduce((a, b) =>
    new Date(a.kickoff_at!).getTime() >= new Date(b.kickoff_at!).getTime() ? a : b,
  )
  return stepIndexForRound(latest.round)
})

const currentPhaseMatchesAllPlayed = computed(() => {
  if (isAwardsStep.value) return false
  const matches = currentStep.value === 0
    ? groupStageGroups.value.flatMap(g => g.matches)
    : (currentRound.value?.matches ?? [])
  return matches.length > 0 && matches.every(m => m.home_score !== null)
})

// ─── Share card download ─────────────────────────────────────────────────────
const downloading = ref(false)

async function downloadShareCard() {
  downloading.value = true
  try {
    const { toPng } = await import('html-to-image')
    const el = document.getElementById('predictions-share-card')
    if (!el) return
    el.style.visibility = 'visible'
    await nextTick()
    const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true })
    el.style.visibility = 'hidden'
    const a = document.createElement('a')
    a.download = 'mis-predicciones-grupos.png'
    a.href = dataUrl
    a.click()
  } catch {
    toast.add({ title: 'Error al generar la imagen', color: 'error' })
  } finally {
    downloading.value = false
  }
}

// ─── Random fill ─────────────────────────────────────────────────────────────
const showRandomModal = ref(false)

function fillRandom() {
  for (const id of groupMatchIds.value) {
    const p = predictions.value[id]
    if (p?.home != null && p?.away != null) continue
    predictions.value[id] = {
      home: Math.floor(Math.random() * 7),
      away: Math.floor(Math.random() * 7),
    }
  }
  showRandomModal.value = false
}

// ─── Save ────────────────────────────────────────────────────────────────────
const saving = ref(false)

async function saveMatches() {
  const h = await getAuthHeaders()
  const matchById = new Map((allMatches.value ?? []).map(m => [m.id, m]))
  const now = Date.now()
  const payload: Predictions = {}
  for (const [id, p] of Object.entries(predictions.value)) {
    const m = matchById.get(id)
    if (!m || !isRoundEditable(m.round)) continue
    // Skip matches that already started or finished (server rejects them anyway).
    if (m.home_score !== null || (m.kickoff_at && new Date(m.kickoff_at).getTime() <= now)) continue
    if (p.home !== null && p.home !== undefined && p.away !== null && p.away !== undefined) {
      payload[id] = p
    }
  }
  await $fetch('/api/predictions', { method: 'POST', headers: h, body: payload })
}

async function saveSideBets() {
  const h = await getAuthHeaders()
  await $fetch('/api/side-bets', {
    method: 'POST',
    headers: h,
    body: {
      winner_team_id: predictedWinnerTeamId.value,
      best_player: sideBets.value.best_player,
      best_young_player: sideBets.value.best_young_player,
      top_scorer: sideBets.value.top_scorer,
      best_goalkeeper: sideBets.value.best_goalkeeper,
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

</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Predicciones</h1>
        <p class="text-sm text-muted mt-1">Introduce tus resultados para cada fase del torneo.</p>
      </div>
      <p v-if="lastResultsUpdate" class="text-xs text-muted shrink-0 mt-1">
        Última actualización: <span class="font-medium text-foreground">{{ lastResultsUpdate }}</span>
      </p>
    </div>

    <!-- Pending predictions banner -->
    <div
      v-if="totalOpenCount > 0"
      class="rounded-lg border p-3"
      :class="pendingMatchesCount > 0 ? 'border-warning/40 bg-warning/10' : 'border-success/40 bg-success/10'"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <UIcon
            :name="pendingMatchesCount > 0 ? 'i-lucide-triangle-alert' : 'i-lucide-circle-check'"
            :class="pendingMatchesCount > 0 ? 'text-warning' : 'text-success'"
            class="size-5 shrink-0"
          />
          <p class="text-sm font-medium text-foreground">
            <template v-if="pendingMatchesCount > 0">
              Te {{ pendingMatchesCount === 1 ? 'queda' : 'quedan' }} <span class="font-bold">{{ pendingMatchesCount }}</span>
              {{ pendingMatchesCount === 1 ? 'partido' : 'partidos' }} por rellenar, incluida la final.
            </template>
            <template v-else>
              ¡Tienes todas tus predicciones al día! 🎉
            </template>
          </p>
        </div>
        <span v-if="pendingMatchesCount > 0" class="text-xs font-semibold text-muted shrink-0 tabular-nums">{{ filledOpenCount }}/{{ totalOpenCount }}</span>
      </div>
      <div class="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          class="h-full rounded-full transition-all"
          :class="pendingMatchesCount > 0 ? 'bg-warning' : 'bg-success'"
          :style="{ width: `${pendingMatchesCount > 0 && totalOpenCount ? Math.round(filledOpenCount / totalOpenCount * 100) : 100}%` }"
        />
      </div>
    </div>

    <!-- Catch-up grace period -->
    <UAlert
      v-if="catchUpActive"
      color="warning"
      variant="soft"
      icon="i-lucide-clock-alert"
      title="Tienes una oportunidad extra"
      description="Aún puedes completar las predicciones que te faltaron (solo los partidos que todavía no han empezado). Rellénalas cuanto antes, esto se cerrará pronto."
    />

    <!-- Stepper -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex flex-wrap gap-2 flex-1">
        <button
          v-for="(step, idx) in steps"
          :key="step.key"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
          :class="[
            idx === currentStep ? 'bg-primary-400 border-primary-400 text-neutral-900'
            : step.complete ? 'bg-success/10 border-success/30 text-success hover:bg-success/20 cursor-pointer'
            : 'bg-muted/50 border-border text-muted hover:bg-muted cursor-pointer',
          ]"
          @click="currentStep = idx"
        >
          <UIcon v-if="step.complete && idx !== currentStep" name="i-lucide-check" class="size-3" />
          <UIcon v-else-if="isLocked && idx === currentStep" name="i-lucide-lock" class="size-3" />
          <span v-else class="font-bold">{{ idx + 1 }}</span>
          {{ step.title }}
          <span v-if="step.key === 'awards' && !step.complete && isRoundOpen('PREMIOS')" class="size-2 rounded-full bg-warning animate-pulse shrink-0" />
        </button>
      </div>
    </div>

    <!-- Locked banner -->
    <UAlert v-if="isLocked && !steps.every(s => s.complete) && !currentPhaseMatchesAllPlayed" color="neutral" variant="soft" icon="i-lucide-lock"
      :title="isAwardsStep ? 'Premios cerrados' : `${ROUND_LABELS[currentStepRound ?? ''] ?? 'Esta fase'} cerrada`"
      description="El administrador abrirá esta fase cuando corresponda." />


    <!-- Premios nudge -->
    <UAlert v-if="currentStep === 0 && isRoundOpen('PREMIOS') && !sideBetsComplete" color="warning" variant="soft"
      icon="i-lucide-trophy" title="Recuerda rellenar los Premios individuales"
      description="Los premios también se cierran cuando el admin cierre la fase de grupos. Encuéntralos en la última pestaña." />

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
<div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Mejor jugador (MVP)</label>
            <div v-if="officialAwards?.best_player" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('best_player')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.best_player ?? '—' }}</span>
              <span v-if="awardResult('best_player')?.correct" class="text-xs font-semibold">+{{ awardResult('best_player')!.pts }} pts</span>
            </div>
            <PlayerInput v-else v-model="sideBets.best_player" :players="allPlayers ?? []" :disabled="isLocked" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Mejor jugador joven <span class="text-muted-foreground font-normal">(-21 años)</span></label>
            <div v-if="officialAwards?.best_young_player" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('best_young_player')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.best_young_player ?? '—' }}</span>
              <span v-if="awardResult('best_young_player')?.correct" class="text-xs font-semibold">+{{ awardResult('best_young_player')!.pts }} pts</span>
            </div>
            <PlayerInput v-else v-model="sideBets.best_young_player" :players="allPlayers ?? []" :disabled="isLocked" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Máximo goleador</label>
            <div v-if="officialAwards?.top_scorer" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('top_scorer')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.top_scorer ?? '—' }}</span>
              <span v-if="awardResult('top_scorer')?.correct" class="text-xs font-semibold">+{{ awardResult('top_scorer')!.pts }} pts</span>
            </div>
            <PlayerInput v-else v-model="sideBets.top_scorer" :players="allPlayers ?? []" :disabled="isLocked" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">Mejor portero</label>
            <div v-if="officialAwards?.best_goalkeeper" :class="['px-3 py-2 rounded-md border text-sm font-medium flex items-center justify-between', awardResult('best_goalkeeper')?.correct ? 'border-success text-success bg-success/10' : 'border-error text-error bg-error/10']">
              <span>{{ sideBets.best_goalkeeper ?? '—' }}</span>
              <span v-if="awardResult('best_goalkeeper')?.correct" class="text-xs font-semibold">+{{ awardResult('best_goalkeeper')!.pts }} pts</span>
            </div>
            <PlayerInput v-else v-model="sideBets.best_goalkeeper" :players="allPlayers ?? []" :disabled="isLocked" />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="sticky bottom-0 z-10 bg-background/95 backdrop-blur flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3 px-1 border-t border-border -mx-1">
      <UButton v-if="currentStep > 0" variant="ghost" color="neutral" icon="i-lucide-arrow-left" @click="currentStep--">
        Anterior
      </UButton>
      <div v-else class="hidden sm:block" />

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <span class="text-xs text-muted hidden sm:inline">{{ steps[currentStep]?.description }}</span>
        <UButton
          v-if="currentStep === 0 && !isLocked"
          variant="outline"
          color="neutral"
          icon="i-lucide-shuffle"
          class="whitespace-nowrap"
          @click="showRandomModal = true"
        >
          Rellenar al azar
        </UButton>
        <UButton
          v-if="!isAwardsStep"
          :disabled="isLocked"
          :loading="saving"
          icon="i-lucide-save"
          class="bg-primary-400! text-neutral-900! hover:bg-primary-300!"
          @click="save"
        >
          Guardar
        </UButton>
        <UButton
          v-else
          :disabled="!sideBetsComplete || isLocked"
          :loading="saving"
          icon="i-lucide-check"
          color="success"
          class="bg-primary-400! text-neutral-900! hover:bg-primary-300!"
          @click="save"
        >
          Guardar predicciones
        </UButton>
      </div>
    </div>

    <!-- Random fill confirmation modal -->
    <UModal
      :open="showRandomModal"
      title="Rellenar predicciones al azar"
      @update:open="(v) => { if (!v) showRandomModal = false }"
    >
      <template #body>
        <p class="text-sm text-muted">
          Se rellenarán solo los partidos de la fase de grupos que aún no tienen predicción, con resultados aleatorios entre 0 y 6 goles. Los partidos ya rellenados no se modificarán.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showRandomModal = false">
            Cancelar
          </UButton>
          <UButton icon="i-lucide-shuffle" @click="fillRandom">
            Rellenar
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Hidden share card for image generation -->
    <PredictionsShareCard :groups="groupStageGroups" :predictions="predictions" :display-name="userName || user?.email || ''" />

    <UModal :open="showNameModal" :prevent-close="true">
      <template #content>
        <div class="p-6 space-y-4 text-center">
          <h2 class="text-xl font-bold text-foreground">mundIAl 26</h2>
          <p class="text-sm text-muted">Porra del Mundial de Fútbol 2026</p>
          <div class="w-full max-w-sm mx-auto space-y-3 pt-2">
            <p class="text-sm font-medium text-foreground">¿Cómo te llamamos?</p>
            <div class="flex gap-2">
              <UInput
                v-model="userName"
                type="text"
                placeholder="Tu nombre"
                class="flex-1"
                size="lg"
                autofocus
                @keyup.enter="saveName"
              />
              <UButton
                size="lg"
                :disabled="!userName.trim()"
                :loading="savingName"
                icon="i-lucide-arrow-right"
                @click="saveName"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
