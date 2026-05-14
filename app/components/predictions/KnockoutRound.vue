<script setup lang="ts">
interface Match {
  id: string
  home_team: { name: string } | null
  away_team: { name: string } | null
  home_slot: string | null
  away_slot: string | null
}

type Prediction = { home: number | null, away: number | null, homeAdvances?: boolean | null }
type Predictions = Record<string, Prediction>

const props = defineProps<{ matches: Match[], locked?: boolean }>()
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
      class="border border-border rounded-lg p-4 space-y-3"
    >
      <div class="flex items-center gap-2">
        <span class="flex-1 text-sm text-right font-medium text-foreground truncate">{{ teamName(match, 'home') }}</span>
        <div class="flex items-center gap-1 shrink-0">
          <UInput v-model.number="getPrediction(match.id).home" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
          <span class="text-muted font-bold text-sm">–</span>
          <UInput v-model.number="getPrediction(match.id).away" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
        </div>
        <span class="flex-1 text-sm text-left font-medium text-foreground truncate">{{ teamName(match, 'away') }}</span>
      </div>

      <div v-if="isDraw(match.id)" class="flex items-center justify-center gap-3 pt-1 border-t border-border">
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
    </div>
  </div>
</template>
