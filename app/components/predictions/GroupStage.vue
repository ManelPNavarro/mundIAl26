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
            class="space-y-1.5"
          >
            <div class="flex items-center gap-2">
              <span class="flex-1 text-sm text-right font-medium truncate">{{ teamName(match, 'home') }}</span>
              <div class="flex items-center gap-1 shrink-0">
                <template v-if="props.summary?.[match.id]">
                  <span class="font-mono font-bold text-sm text-foreground w-12 text-center">{{ getPrediction(match.id).home ?? '–' }}</span>
                  <span class="text-muted font-bold text-sm">–</span>
                  <span class="font-mono font-bold text-sm text-foreground w-12 text-center">{{ getPrediction(match.id).away ?? '–' }}</span>
                </template>
                <template v-else>
                  <UInput v-model.number="getPrediction(match.id).home" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
                  <span class="text-muted font-bold text-sm">–</span>
                  <UInput v-model.number="getPrediction(match.id).away" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
                </template>
              </div>
              <span class="flex-1 text-sm text-left font-medium truncate">{{ teamName(match, 'away') }}</span>
            </div>

            <!-- Result comparison -->
            <div v-if="props.summary?.[match.id]" class="flex items-center justify-center gap-2">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="props.summary[match.id].isExact
                  ? 'bg-success/15 text-success'
                  : props.summary[match.id].isCorrect
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error'"
              >
                {{ props.summary[match.id].result.home }}–{{ props.summary[match.id].result.away }} resultado real
              </span>
              <UBadge
                :color="props.summary[match.id].points > 0 ? 'success' : 'error'"
                variant="subtle"
                size="xs"
              >
                {{ props.summary[match.id].points > 0 ? `+${props.summary[match.id].points} pts` : '0 pts' }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
