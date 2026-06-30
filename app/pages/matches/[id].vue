<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Team { id: string, name: string }

interface MatchPrediction {
  userId: string
  name: string
  email: string
  homeScore: number | null
  awayScore: number | null
  homeAdvances: boolean | null
  points: number
  category: 'exact' | 'correct' | 'advance' | 'wrong' | 'no_prediction'
}

interface MatchDetail {
  match: {
    id: string
    match_no: number
    round: string
    group_letter: string | null
    kickoff_at: string | null
    status: string
    home_score: number | null
    away_score: number | null
    home_advances: boolean | null
    home_team: Team | null
    away_team: Team | null
  }
  predictions: MatchPrediction[]
}

const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Fase de grupos', R32: 'Dieciseisavos', R16: 'Octavos de final',
  QF: 'Cuartos de final', SF: 'Semifinales', THIRD_PLACE: 'Tercer puesto', FINAL: 'Final',
}

const CATEGORY_LABELS: Record<string, string> = {
  exact: 'Resultado exacto',
  correct: 'Resultado acertado',
  advance: 'Acertó el equipo que pasa',
  wrong: 'Resultado fallado',
  no_prediction: 'Sin predicción',
}

const route = useRoute()
const supabase = useSupabaseClient()
const currentUser = useSupabaseUser()

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
}

const { data, pending, error } = useAsyncData<MatchDetail>(
  `match-predictions-${route.params.id}`,
  async () => {
    const headers = await getAuthHeaders()
    return $fetch<MatchDetail>(`/api/matches/${route.params.id}/predictions`, { headers })
  },
  { server: false },
)

const match = computed(() => data.value?.match)
const predictions = computed(() => data.value?.predictions ?? [])
const isFinished = computed(() => match.value?.home_score !== null && match.value?.away_score !== null)

function roundLabel(m: { round: string, group_letter: string | null }): string {
  const label = ROUND_LABELS[m.round] ?? m.round
  if (m.round === 'GROUP' && m.group_letter) return `${label} · Grupo ${m.group_letter}`
  return label
}

function formatKickoff(kickoff_at: string | null): string | null {
  if (!kickoff_at) return null
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid', hour12: false,
  }).format(new Date(kickoff_at))
}

function teamName(team: Team | null | undefined): string {
  return team?.name ?? '?'
}

const isKnockout = computed(() => match.value?.round !== 'GROUP')

function advancingTeamName(entry: MatchPrediction): string | null {
  if (!isKnockout.value) return null
  if (entry.homeScore === null || entry.homeScore !== entry.awayScore) return null
  if (entry.homeAdvances === null) return null
  return entry.homeAdvances ? teamName(match.value?.home_team) : teamName(match.value?.away_team)
}

const categoryGroups = computed(() => {
  if (!isFinished.value) return null
  const groups: { category: string, label: string, entries: MatchPrediction[] }[] = []
  let currentCat = ''
  for (const entry of predictions.value) {
    if (entry.category !== currentCat) {
      currentCat = entry.category
      groups.push({ category: currentCat, label: CATEGORY_LABELS[currentCat] ?? currentCat, entries: [] })
    }
    groups[groups.length - 1]!.entries.push(entry)
  }
  return groups
})
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <UButton variant="ghost" color="neutral" icon="i-lucide-arrow-left" to="/predictions" size="sm">
      Predicciones
    </UButton>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
    </div>

    <!-- Error: round still open -->
    <UAlert
      v-else-if="error?.cause?.statusCode === 403 || (error as any)?.statusCode === 403"
      color="warning"
      variant="soft"
      icon="i-lucide-lock"
      title="Predicciones aún abiertas"
      description="Podrás ver las predicciones de todos cuando se cierre la ronda."
    />

    <!-- Error: other -->
    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-alert-circle"
      :title="(error as any)?.statusMessage ?? error?.message ?? 'Error'"
    />

    <!-- Content -->
    <template v-else-if="match">
      <!-- Match header -->
      <div class="border border-border rounded-xl overflow-hidden">
        <div class="px-4 py-2 bg-muted/40 text-center">
          <p class="text-xs font-medium text-muted uppercase tracking-wide">{{ roundLabel(match) }}</p>
          <p v-if="match.kickoff_at" class="text-xs text-muted mt-0.5">{{ formatKickoff(match.kickoff_at) }}</p>
        </div>
        <div class="flex items-center gap-4 px-6 py-5 justify-center">
          <div class="flex-1 flex items-center justify-end gap-2 min-w-0">
            <span class="text-base font-semibold text-foreground truncate">{{ teamName(match.home_team) }}</span>
            <TeamFlag :team="teamName(match.home_team)" class="text-xl shrink-0" />
          </div>
          <div class="shrink-0 text-center min-w-[5rem]">
            <template v-if="isFinished">
              <span class="text-3xl font-bold text-foreground font-mono">{{ match.home_score }} – {{ match.away_score }}</span>
            </template>
            <template v-else>
              <span class="text-3xl font-bold text-muted font-mono">? – ?</span>
            </template>
          </div>
          <div class="flex-1 flex items-center justify-start gap-2 min-w-0">
            <TeamFlag :team="teamName(match.away_team)" class="text-xl shrink-0" />
            <span class="text-base font-semibold text-foreground truncate">{{ teamName(match.away_team) }}</span>
          </div>
        </div>
      </div>

      <!-- Predictions list -->
      <div class="space-y-4">
        <h2 class="text-base font-semibold text-foreground">Predicciones</h2>

        <div v-if="!predictions.length" class="text-center py-8 text-muted text-sm">
          Nadie ha hecho predicción para este partido.
        </div>

        <!-- Grouped by category (finished matches) -->
        <template v-if="categoryGroups">
          <div v-for="group in categoryGroups" :key="group.category" class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide"
              :class="group.category === 'exact' ? 'text-success' : group.category === 'correct' ? 'text-success/70' : group.category === 'advance' ? 'text-warning' : 'text-muted'"
            >
              {{ group.label }}
            </p>
            <div
              v-for="entry in group.entries"
              :key="entry.userId"
              class="flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors"
              :class="entry.userId === currentUser?.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                : 'border-border'"
            >
              <UAvatar :src="useGravatarUrl(entry.email).value" :alt="entry.name" size="sm" />
              <div class="flex-1 min-w-0 flex items-center gap-2">
                <span class="text-sm font-medium text-foreground truncate">{{ entry.name }}</span>
                <UBadge v-if="entry.userId === currentUser?.id" color="primary" variant="subtle" size="xs">Tú</UBadge>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span v-if="entry.homeScore !== null" class="font-mono font-bold text-sm text-foreground">
                  {{ entry.homeScore }} – {{ entry.awayScore }}
                </span>
                <span v-else class="text-sm text-muted">–</span>
                <span v-if="advancingTeamName(entry)" class="flex items-center gap-1 text-xs text-muted">
                  <UIcon name="i-lucide-arrow-right" class="size-3" />
                  <TeamFlag :team="advancingTeamName(entry) ?? ''" class="text-sm" />
                </span>
                <UBadge
                  v-if="entry.category === 'exact'"
                  color="success" variant="subtle" size="xs"
                >
                  +{{ entry.points }} pts
                </UBadge>
                <UBadge
                  v-else-if="entry.category === 'correct'"
                  color="success" variant="outline" size="xs"
                >
                  +{{ entry.points }} pts
                </UBadge>
                <UBadge
                  v-else-if="entry.category === 'advance'"
                  color="warning" variant="subtle" size="xs"
                >
                  +{{ entry.points }} pts
                </UBadge>
                <UBadge
                  v-else
                  color="neutral" variant="subtle" size="xs"
                >
                  0 pts
                </UBadge>
              </div>
            </div>
          </div>
        </template>

        <!-- Flat list (unfinished matches) -->
        <template v-else>
          <div class="space-y-2">
            <div
              v-for="entry in predictions"
              :key="entry.userId"
              class="flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors"
              :class="entry.userId === currentUser?.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                : 'border-border'"
            >
              <UAvatar :src="useGravatarUrl(entry.email).value" :alt="entry.name" size="sm" />
              <div class="flex-1 min-w-0 flex items-center gap-2">
                <span class="text-sm font-medium text-foreground truncate">{{ entry.name }}</span>
                <UBadge v-if="entry.userId === currentUser?.id" color="primary" variant="subtle" size="xs">Tú</UBadge>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span v-if="entry.homeScore !== null" class="font-mono font-bold text-sm text-foreground">
                  {{ entry.homeScore }} – {{ entry.awayScore }}
                </span>
                <span v-else class="text-sm text-muted">–</span>
                <span v-if="advancingTeamName(entry)" class="flex items-center gap-1 text-xs text-muted">
                  <UIcon name="i-lucide-arrow-right" class="size-3" />
                  <TeamFlag :team="advancingTeamName(entry) ?? ''" class="text-sm" />
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
