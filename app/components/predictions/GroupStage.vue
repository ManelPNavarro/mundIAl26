<script setup lang="ts">
interface Match {
  id: string
  match_no: number
  matchday: number | null
  group_letter: string | null
  home_team: { name: string } | null
  away_team: { name: string } | null
  home_slot: string | null
  away_slot: string | null
  kickoff_at: string | null
  status: string
  home_score: number | null
  away_score: number | null
}

interface Group {
  letter: string
  matches: Match[]
}

interface MatchSummary {
  result: { home: number, away: number, home_advances: boolean | null }
  points: number
  isExact: boolean
  isCorrect: boolean
}

type Prediction = { home: number | null, away: number | null, homeAdvances?: boolean | null }
type Predictions = Record<string, Prediction>

const props = defineProps<{
  groups: Group[]
  locked?: boolean
  summary?: Record<string, MatchSummary>
}>()
const predictions = defineModel<Predictions>({ required: true })

function getPrediction(matchId: string): Prediction {
  if (!predictions.value[matchId]) {
    predictions.value[matchId] = { home: null, away: null }
  }
  return predictions.value[matchId]!
}

function teamName(match: Match, side: 'home' | 'away'): string {
  const team = side === 'home' ? match.home_team : match.away_team
  if (team) return team.name
  return side === 'home' ? (match.home_slot ?? '?') : (match.away_slot ?? '?')
}

const openGroups = ref<string[]>(['A'])

function isMatchLocked(match: Match): boolean {
  if (props.locked) return true
  if (match.status !== 'SCHEDULED') return true
  if (match.home_score !== null) return true
  return false
}

function hasResult(match: Match): boolean {
  return match.home_score !== null && match.away_score !== null
}

function formatKickoff(kickoff_at: string | null): string | null {
  if (!kickoff_at) return null
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid', hour12: false,
  }).format(new Date(kickoff_at))
}

function filledCount(matches: Match[]) {
  return matches.filter((m) => {
    const p = predictions.value[m.id]
    return p?.home !== null && p?.home !== undefined && p?.away !== null && p?.away !== undefined
  }).length
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="group in props.groups"
      :key="group.letter"
      class="border border-border rounded-lg overflow-hidden"
    >
      <button
        class="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
        @click="openGroups.includes(group.letter) ? openGroups.splice(openGroups.indexOf(group.letter), 1) : openGroups.push(group.letter)"
      >
        <span class="font-semibold text-foreground text-sm">Grupo {{ group.letter }}</span>
        <div class="flex items-center gap-3 shrink-0">
          <UBadge
            :color="filledCount(group.matches) === group.matches.length ? 'success' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ filledCount(group.matches) }}/{{ group.matches.length }}
          </UBadge>
          <UIcon
            :name="openGroups.includes(group.letter) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="size-4 text-muted"
          />
        </div>
      </button>

      <div v-if="openGroups.includes(group.letter)" class="divide-y divide-border">
        <div v-for="day in [1, 2, 3]" :key="day" class="px-4 py-3 space-y-3">
          <p class="text-xs font-medium text-muted uppercase tracking-wide">Jornada {{ day }}</p>
          <div
            v-for="match in group.matches.filter(m => m.matchday === day)"
            :key="match.id"
            class="rounded-lg overflow-hidden"
            :class="props.summary?.[match.id]
              ? (props.summary[match.id].isCorrect ? 'bg-success/5' : 'bg-error/5')
              : ''"
          >
            <!-- Kickoff time -->
            <div v-if="match.kickoff_at" class="px-3 pt-2 text-xs text-muted text-center">
              {{ formatKickoff(match.kickoff_at) }}
            </div>
            <!-- Prediction row -->
            <div class="flex items-center gap-2 px-3 py-2">
              <span class="flex-1 text-sm text-right font-medium truncate">{{ teamName(match, 'home') }} {{ getFlag(teamName(match, 'home')) }}</span>
              <div class="flex items-center gap-1 shrink-0">
                <template v-if="isMatchLocked(match)">
                  <span class="font-mono font-bold text-sm text-foreground w-12 text-center">{{ getPrediction(match.id).home ?? '–' }}</span>
                  <span class="text-muted font-bold text-sm">–</span>
                  <span class="font-mono font-bold text-sm text-foreground w-12 text-center">{{ getPrediction(match.id).away ?? '–' }}</span>
                </template>
                <template v-else>
                  <UInput v-model.number="getPrediction(match.id).home" type="number" inputmode="numeric" min="0" max="99" class="w-12 text-center" size="sm" :disabled="false" />
                  <span class="text-muted font-bold text-sm">–</span>
                  <UInput v-model.number="getPrediction(match.id).away" type="number" inputmode="numeric" min="0" max="99" class="w-12 text-center" size="sm" :disabled="false" />
                </template>
              </div>
              <span class="flex-1 text-sm text-left font-medium truncate">{{ getFlag(teamName(match, 'away')) }} {{ teamName(match, 'away') }}</span>
            </div>

            <!-- Real result strip -->
            <div
              v-if="hasResult(match)"
              class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium"
              :class="props.summary?.[match.id]
                ? (props.summary[match.id].isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error')
                : 'bg-muted/30 text-muted'"
            >
              <span class="flex-1 text-right">Resultado real</span>
              <div class="flex items-center gap-1 shrink-0">
                <span class="font-mono font-bold text-sm w-12 text-center">{{ match.home_score }}</span>
                <span class="font-bold text-sm">–</span>
                <span class="font-mono font-bold text-sm w-12 text-center">{{ match.away_score }}</span>
              </div>
              <span class="flex-1 text-left">
                {{ props.summary?.[match.id] ? (props.summary[match.id].points > 0 ? `+${props.summary[match.id].points} pts` : '0 pts') : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
