<script setup lang="ts">
interface Match {
  id: string
  home_team: { name: string } | null
  away_team: { name: string } | null
  home_slot: string | null
  away_slot: string | null
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
  matches: Match[]
  locked?: boolean
  summary?: Record<string, MatchSummary>
}>()
const predictions = defineModel<Predictions>({ required: true })

function getPrediction(matchId: string): Prediction {
  if (!predictions.value[matchId]) {
    predictions.value[matchId] = { home: null, away: null, homeAdvances: null }
  }
  return predictions.value[matchId]!
}

function isDraw(matchId: string) {
  const p = predictions.value[matchId]
  return p?.home !== null && p?.away !== null && p?.home !== undefined && p?.away !== undefined && p.home === p.away
}

function teamName(match: Match, side: 'home' | 'away'): string {
  const team = side === 'home' ? match.home_team : match.away_team
  if (team) return team.name
  const slot = side === 'home' ? match.home_slot : match.away_slot
  if (!slot) return '?'
  if (slot.startsWith('W')) return `Gan. P${slot.slice(1)}`
  if (slot.startsWith('L')) return `Perd. P${slot.slice(1)}`
  if (slot.startsWith('1')) return `1º Grupo ${slot.slice(1)}`
  if (slot.startsWith('2')) return `2º Grupo ${slot.slice(1)}`
  if (slot.startsWith('3')) return `3º (${slot.slice(1)})`
  return slot
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="match in props.matches"
      :key="match.id"
      class="border border-border rounded-lg overflow-hidden"
    >
      <!-- Prediction row -->
      <div class="flex items-center gap-2 px-4 py-3">
        <span class="flex-1 text-sm text-right font-medium text-foreground truncate">{{ teamName(match, 'home') }}</span>
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
        <span class="flex-1 text-sm text-left font-medium text-foreground truncate">{{ teamName(match, 'away') }}</span>
      </div>

      <!-- Penalties tiebreaker -->
      <div v-if="isDraw(match.id) && !props.summary?.[match.id]" class="flex items-center justify-center gap-3 px-4 pb-3 border-t border-border pt-2">
        <p class="text-xs text-muted">¿Quién avanza en penaltis?</p>
        <div class="flex gap-2">
          <UButton size="xs" :variant="getPrediction(match.id).homeAdvances === true ? 'solid' : 'outline'" color="primary" :disabled="props.locked" @click="getPrediction(match.id).homeAdvances = true">
            {{ teamName(match, 'home') }}
          </UButton>
          <UButton size="xs" :variant="getPrediction(match.id).homeAdvances === false ? 'solid' : 'outline'" color="primary" :disabled="props.locked" @click="getPrediction(match.id).homeAdvances = false">
            {{ teamName(match, 'away') }}
          </UButton>
        </div>
      </div>

      <!-- Real result strip -->
      <div
        v-if="props.summary?.[match.id]"
        class="flex items-center justify-between px-4 py-1.5 text-sm font-medium"
        :class="props.summary[match.id].isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
      >
        <span class="text-xs">Resultado real</span>
        <span class="font-mono font-bold">
          {{ props.summary[match.id].result.home }} – {{ props.summary[match.id].result.away }}
        </span>
        <span class="text-xs">
          {{ props.summary[match.id].points > 0 ? `+${props.summary[match.id].points} pts` : '0 pts' }}
        </span>
      </div>
    </div>
  </div>
</template>
