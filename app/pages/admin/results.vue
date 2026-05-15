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

const supabase = useSupabaseClient()
const toast = useToast()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

const { data: matches, refresh } = await useFetch<Match[]>('/api/matches')

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
  }).filter(Boolean) as { key: string, label: string, matches: Match[], complete: boolean }[]
})

const currentStep = ref(0)

const currentStepData = computed(() => steps.value[currentStep.value] ?? null)

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

const syncing = ref(false)

async function syncMatches() {
  syncing.value = true
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
    syncing.value = false
  }
}

function teamName(match: Match, side: 'home' | 'away'): string {
  const team = side === 'home' ? match.home_team : match.away_team
  if (team) return team.name
  const slot = side === 'home' ? match.home_slot : match.away_slot
  return slot ?? '?'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Resultados</h1>
        <p class="text-sm text-muted mt-1">Introduce los resultados reales de cada partido.</p>
      </div>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" size="sm" :loading="syncing" @click="syncMatches">
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
