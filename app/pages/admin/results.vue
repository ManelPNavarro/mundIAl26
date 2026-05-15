<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

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
  status: string
  kickoff_at: string | null
  home_team: Team | null
  away_team: Team | null
}

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
const [{ data: matches, refresh }, { data: allTeams }, { data: allPlayers }, fetchedAwards] = await Promise.all([
  useFetch<Match[]>('/api/matches'),
  useFetch<Team[]>('/api/teams'),
  useFetch<Player[]>('/api/players'),
  $fetch<Awards>('/api/admin/awards', { headers }),
])

function formatKickoff(kickoffAt: string | null): string {
  if (!kickoffAt) return 'Por confirmar'
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(kickoffAt))
}

type Draft = { home: number | null, away: number | null, homeAdvances: boolean | null }
const drafts = ref<Record<string, Draft>>({})
const saving = ref<string | null>(null)
const editing = ref<Set<string>>(new Set())

function isEditing(match: Match): boolean {
  return match.home_score === null || editing.value.has(match.id)
}

function startEdit(match: Match) {
  editing.value.add(match.id)
}

function getDraft(match: Match): Draft {
  if (!drafts.value[match.id]) {
    drafts.value[match.id] = { home: match.home_score, away: match.away_score, homeAdvances: match.home_advances }
  }
  return drafts.value[match.id]!
}

function isDirty(match: Match): boolean {
  const d = drafts.value[match.id]
  if (!d) return false
  return d.home !== match.home_score || d.away !== match.away_score || d.homeAdvances !== match.home_advances
}

function isDraw(match: Match): boolean {
  const d = drafts.value[match.id]
  return d?.home !== null && d?.away !== null && d?.home === d?.away
}

async function saveResult(match: Match) {
  const d = getDraft(match)
  if (d.home === null || d.away === null) return
  saving.value = match.id
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/matches/${match.id}/result`, {
      method: 'PATCH',
      headers,
      body: {
        home_score: d.home,
        away_score: d.away,
        home_advances: isDraw(match) ? d.homeAdvances : null,
        status: 'FINISHED',
      },
    })
    toast.add({ title: 'Resultado guardado', color: 'success' })
    editing.value.delete(match.id)
    await refresh()
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    saving.value = null
  }
}

async function clearResult(match: Match) {
  saving.value = match.id
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/matches/${match.id}/result`, {
      method: 'PATCH',
      headers,
      body: { home_score: null, away_score: null },
    })
    toast.add({ title: 'Resultado eliminado', color: 'success' })
    editing.value.delete(match.id)
    delete drafts.value[match.id]
    await refresh()
  } catch {
    toast.add({ title: 'Error al eliminar', color: 'error' })
  } finally {
    saving.value = null
  }
}

// ─── Awards ──────────────────────────────────────────────────────────────────
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

const savingAwards = ref(false)
const syncingPlayers = ref(false)

const teamOptions = computed(() =>
  (allTeams.value ?? []).map(t => ({ label: t.name, value: t.id }))
)

const awardsComplete = computed(() =>
  !!awards.value.winner_team_id &&
  !!awardIds.value.best_player &&
  !!awardIds.value.best_young_player &&
  !!awardIds.value.top_scorer &&
  !!awardIds.value.best_goalkeeper
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
    toast.add({ title: 'Premios guardados', color: 'success' })
  } catch {
    toast.add({ title: 'Error al guardar', color: 'error' })
  } finally {
    savingAwards.value = false
  }
}

async function syncPlayers() {
  syncingPlayers.value = true
  try {
    const h = await getAuthHeaders()
    const result = await $fetch<{ synced: number }>('/api/admin/sync-players', { method: 'POST', headers: h })
    await refreshNuxtData()
    toast.add({ title: `${result.synced} jugadores sincronizados`, color: 'success' })
  } catch {
    toast.add({ title: 'Error al sincronizar jugadores', color: 'error' })
  } finally {
    syncingPlayers.value = false
  }
}

const AWARD_FIELDS: { key: keyof AwardIds, label: string }[] = [
  { key: 'best_player', label: 'Mejor jugador (MVP)' },
  { key: 'best_young_player', label: 'Mejor jugador joven' },
  { key: 'top_scorer', label: 'Máximo goleador' },
  { key: 'best_goalkeeper', label: 'Mejor portero' },
]

const ROUNDS = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL']
const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Grupos',
  R32: 'Ronda de 32',
  R16: 'Octavos',
  QF: 'Cuartos',
  SF: 'Semifinales',
  THIRD_PLACE: '3er puesto',
  FINAL: 'Final',
}

const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function finishedCount(matchList: Match[]) {
  return matchList.filter(m => m.status === 'FINISHED').length
}

const steps = computed(() => {
  const all = matches.value ?? []
  return ROUNDS.map(round => {
    const roundMatches = round === 'GROUP'
      ? all.filter(m => m.round === 'GROUP')
      : all.filter(m => m.round === round)
    if (roundMatches.length === 0) return null
    return {
      key: round,
      label: ROUND_LABELS[round]!,
      matches: roundMatches,
      complete: finishedCount(roundMatches) === roundMatches.length,
    }
  }).filter(Boolean).concat([{
    key: 'AWARDS',
    label: 'Premios',
    matches: [],
    complete: awardsComplete.value,
  }]) as { key: string, label: string, matches: Match[], complete: boolean }[]
})

const currentStep = ref(0)
const isAwardsStep = computed(() => steps.value[currentStep.value]?.key === 'AWARDS')
const currentStepData = computed(() => isAwardsStep.value ? null : (steps.value[currentStep.value] ?? null))

const groupsForCurrentStep = computed(() => {
  if (currentStepData.value?.key !== 'GROUP') return null
  return GROUP_LETTERS.map(letter => ({
    letter,
    matches: currentStepData.value!.matches.filter(m => m.group_letter === letter),
  })).filter(g => g.matches.length > 0)
})

const totalMatches = computed(() => (matches.value ?? []).length)
const finishedTotal = computed(() => finishedCount(matches.value ?? []))
const completionPct = computed(() =>
  totalMatches.value > 0 ? Math.round((finishedTotal.value / totalMatches.value) * 100) : 0
)

const syncingMatches = ref(false)

async function syncMatches() {
  syncingMatches.value = true
  try {
    const headers = await getAuthHeaders()
    const result = await $fetch<{ updated: number, skipped: number, total: number }>(
      '/api/admin/sync-matches',
      { method: 'POST', headers },
    )
    toast.add({
      title: 'Sincronización completada',
      description: `${result.updated} partidos actualizados, ${result.skipped} sin coincidencia`,
      color: 'success',
    })
    await refresh()
  } catch (e: unknown) {
    toast.add({
      title: 'Error al sincronizar',
      description: e instanceof Error ? e.message : 'Error desconocido',
      color: 'error',
    })
  } finally {
    syncingMatches.value = false
  }
}

function resolveSlot(slot: string): string | null {
  const all = matches.value ?? []

  if (slot.startsWith('W') || slot.startsWith('L')) {
    const winner = slot.startsWith('W')
    const m = all.find(x => x.match_no === parseInt(slot.slice(1)))
    if (!m || m.home_score === null || m.away_score === null) return null
    const homeWins = m.home_score > m.away_score || (m.home_score === m.away_score && m.home_advances === true)
    const pick = winner ? (homeWins ? 'home' : 'away') : (homeWins ? 'away' : 'home')
    return matchSideName(m, pick)
  }

  const pos = parseInt(slot[0]!)
  const groupLetters = slot.slice(1).split('')
  if (!isNaN(pos) && groupLetters.length > 0) {
    const standing = (letter: string) => {
      const groupMatches = all.filter(x => x.round === 'GROUP' && x.group_letter === letter && x.home_score !== null)
      const table = new Map<string, { name: string, pts: number, gd: number, gf: number }>()
      for (const m of groupMatches) {
        if (!m.home_team || !m.away_team || m.home_score === null || m.away_score === null) continue
        if (!table.has(m.home_team.id)) table.set(m.home_team.id, { name: m.home_team.name, pts: 0, gd: 0, gf: 0 })
        if (!table.has(m.away_team.id)) table.set(m.away_team.id, { name: m.away_team.name, pts: 0, gd: 0, gf: 0 })
        const h = table.get(m.home_team.id)!
        const a = table.get(m.away_team.id)!
        h.gf += m.home_score; h.gd += m.home_score - m.away_score
        a.gf += m.away_score; a.gd += m.away_score - m.home_score
        if (m.home_score > m.away_score) h.pts += 3
        else if (m.home_score === m.away_score) { h.pts += 1; a.pts += 1 }
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

function matchSideName(m: Match, side: 'home' | 'away'): string | null {
  const team = side === 'home' ? m.home_team : m.away_team
  if (team) return team.name
  const slot = side === 'home' ? m.home_slot : m.away_slot
  return slot ? resolveSlot(slot) : null
}

function teamName(match: Match, side: 'home' | 'away'): string {
  const resolved = matchSideName(match, side)
  if (resolved) return resolved
  const slot = side === 'home' ? match.home_slot : match.away_slot
  if (!slot) return '?'
  if (slot.startsWith('W')) return `Gan. P${slot.slice(1)}`
  if (slot.startsWith('L')) return `Perd. P${slot.slice(1)}`
  const pos = parseInt(slot[0]!)
  const group = slot.slice(1)
  if (!isNaN(pos) && group) return `${pos}º Grupo ${group}`
  return slot
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Resultados</h1>
        <p class="text-sm text-muted mt-1">Introduce los resultados reales de cada partido.</p>
      </div>
      <UButton v-if="!isAwardsStep" icon="i-lucide-refresh-cw" color="neutral" variant="outline" size="sm" :loading="syncingMatches" @click="syncMatches">
        Sincronizar
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
            : step.complete ? 'bg-success/10 border-success/30 text-success hover:bg-success/20'
            : 'bg-muted/20 border-border text-muted hover:bg-muted/40',
          ]"
          @click="currentStep = idx"
        >
          <UIcon v-if="step.complete && idx !== currentStep" name="i-lucide-check" class="size-3" />
          <span v-else class="font-bold">{{ idx + 1 }}</span>
          {{ step.label }}
        </button>
      </div>
      <div class="shrink-0 flex flex-col items-center leading-none pt-1">
        <span class="text-sm font-bold" :class="completionPct === 100 ? 'text-success' : 'text-primary'">{{ completionPct }}%</span>
        <span class="text-xs text-muted mt-0.5">completado</span>
      </div>
    </div>

    <!-- Group stage -->
    <template v-if="currentStepData?.key === 'GROUP' && groupsForCurrentStep">
      <div v-for="group in groupsForCurrentStep" :key="group.letter" class="space-y-1">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide">Grupo {{ group.letter }}</p>
        <div class="border border-border rounded-lg divide-y divide-border">
          <div v-for="day in [1, 2, 3]" :key="day">
            <div v-if="group.matches.filter(m => m.matchday === day).length > 0" class="px-4 py-3 space-y-3">
              <p class="text-xs font-medium text-muted uppercase tracking-wide">Jornada {{ day }}</p>
              <div v-for="match in group.matches.filter(m => m.matchday === day)" :key="match.id" class="space-y-1">
                <p class="text-xs text-muted text-center">{{ formatKickoff(match.kickoff_at) }}</p>
                <div class="flex items-center gap-3">
                  <span class="flex-1 text-sm text-right font-medium truncate">{{ teamName(match, 'home') }}</span>
                  <template v-if="isEditing(match)">
                    <div class="flex items-center gap-1 shrink-0">
                      <UInput v-model.number="getDraft(match).home" type="number" min="0" max="99" class="w-12 text-center" size="sm" />
                      <span class="text-muted font-bold text-sm">–</span>
                      <UInput v-model.number="getDraft(match).away" type="number" min="0" max="99" class="w-12 text-center" size="sm" />
                    </div>
                    <span class="flex-1 text-sm text-left font-medium truncate">{{ teamName(match, 'away') }}</span>
                    <UButton size="xs" color="success" :loading="saving === match.id" :disabled="getDraft(match).home === null || getDraft(match).away === null" icon="i-lucide-save" @click="saveResult(match)" />
                    <UButton v-if="match.home_score !== null" size="xs" color="error" variant="outline" :loading="saving === match.id" icon="i-lucide-trash-2" @click="clearResult(match)" />
                  </template>
                  <template v-else>
                    <span class="font-mono font-bold text-sm text-foreground shrink-0">{{ match.home_score }} – {{ match.away_score }}</span>
                    <span class="flex-1 text-sm text-left font-medium truncate">{{ teamName(match, 'away') }}</span>
                    <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-pencil" @click="startEdit(match)" />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Awards -->
    <template v-else-if="isAwardsStep">
      <div class="space-y-4 max-w-md">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted">Ganadores reales del torneo.</p>
          <div class="flex gap-2">
            <UButton size="sm" variant="outline" color="neutral" :loading="syncingPlayers" icon="i-lucide-refresh-cw" @click="syncPlayers">
              Sync jugadores
            </UButton>
            <UButton size="sm" color="success" :loading="savingAwards" icon="i-lucide-save" @click="saveAwards">
              Guardar premios
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
    </template>

    <!-- Knockout rounds -->
    <template v-else-if="currentStepData">
      <div class="border border-border rounded-lg divide-y divide-border">
        <div v-for="match in currentStepData.matches" :key="match.id" class="px-4 py-3 space-y-2">
          <p class="text-xs text-muted text-center">{{ formatKickoff(match.kickoff_at) }}</p>
          <div class="flex items-center gap-3">
            <span class="flex-1 text-sm text-right font-medium truncate">{{ teamName(match, 'home') }}</span>
            <template v-if="isEditing(match)">
              <div class="flex items-center gap-1 shrink-0">
                <UInput v-model.number="getDraft(match).home" type="number" min="0" max="99" class="w-12 text-center" size="sm" />
                <span class="text-muted font-bold text-sm">–</span>
                <UInput v-model.number="getDraft(match).away" type="number" min="0" max="99" class="w-12 text-center" size="sm" />
              </div>
              <span class="flex-1 text-sm text-left font-medium truncate">{{ teamName(match, 'away') }}</span>
              <UButton size="xs" color="success" :loading="saving === match.id" :disabled="getDraft(match).home === null || getDraft(match).away === null" icon="i-lucide-save" @click="saveResult(match)" />
              <UButton v-if="match.home_score !== null" size="xs" color="error" variant="outline" :loading="saving === match.id" icon="i-lucide-trash-2" @click="clearResult(match)" />
            </template>
            <template v-else>
              <span v-if="match.home_score !== null" class="font-mono font-bold text-sm text-foreground shrink-0">{{ match.home_score }} – {{ match.away_score }}</span>
              <UIcon v-else name="i-lucide-lock" class="size-4 text-muted shrink-0" />
              <span class="flex-1 text-sm text-left font-medium truncate">{{ teamName(match, 'away') }}</span>
              <UButton v-if="match.home_score !== null" size="xs" color="neutral" variant="outline" icon="i-lucide-pencil" @click="startEdit(match)" />
            </template>
          </div>
          <div v-if="isDraw(match)" class="flex items-center justify-center gap-3 pt-1 border-t border-border">
            <p class="text-xs text-muted">¿Quién avanza en penaltis?</p>
            <div class="flex gap-2">
              <UButton size="xs" :variant="getDraft(match).homeAdvances === true ? 'solid' : 'outline'" color="primary" @click="getDraft(match).homeAdvances = true">{{ teamName(match, 'home') }}</UButton>
              <UButton size="xs" :variant="getDraft(match).homeAdvances === false ? 'solid' : 'outline'" color="primary" @click="getDraft(match).homeAdvances = false">{{ teamName(match, 'away') }}</UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
