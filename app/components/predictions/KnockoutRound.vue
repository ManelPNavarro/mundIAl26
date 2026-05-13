<script setup lang="ts">
import type { KnockoutMatch } from '~/data/knockout'

type Prediction = { home: number | null, away: number | null, homeAdvances?: boolean | null }
type Predictions = Record<number, Prediction>

const props = defineProps<{ matches: KnockoutMatch[], locked?: boolean }>()
const predictions = defineModel<Predictions>({ required: true })

function getPrediction(matchId: number): Prediction {
  if (!predictions.value[matchId]) {
    predictions.value[matchId] = { home: null, away: null, homeAdvances: null }
  }
  return predictions.value[matchId]!
}

function isDraw(matchId: number) {
  const p = predictions.value[matchId]
  return p?.home !== null && p?.away !== null &&
    p?.home !== undefined && p?.away !== undefined &&
    p.home === p.away
}

function formatSlot(slot: string) {
  if (slot.startsWith('W')) return `Gan. partido ${slot.slice(1)}`
  if (slot.startsWith('L')) return `Perd. partido ${slot.slice(1)}`
  if (slot.startsWith('1')) return `1º Grupo ${slot.slice(1)}`
  if (slot.startsWith('2')) return `2º Grupo ${slot.slice(1)}`
  if (slot.startsWith('3')) return `3º mejor (${slot.slice(1)})`
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
        <span class="flex-1 text-sm text-right font-medium text-foreground truncate">
          {{ formatSlot(match.slotHome) }}
        </span>
        <div class="flex items-center gap-1 shrink-0">
          <UInput v-model.number="getPrediction(match.id).home" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
          <span class="text-muted font-bold text-sm">–</span>
          <UInput v-model.number="getPrediction(match.id).away" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
        </div>
        <span class="flex-1 text-sm text-left font-medium text-foreground truncate">
          {{ formatSlot(match.slotAway) }}
        </span>
      </div>

      <!-- Penalties tiebreaker -->
      <div v-if="isDraw(match.id)" class="flex items-center justify-center gap-3 pt-1 border-t border-border">
        <p class="text-xs text-muted">¿Quién avanza en penaltis?</p>
        <div class="flex gap-2">
          <UButton
            size="xs"
            :variant="getPrediction(match.id).homeAdvances === true ? 'solid' : 'outline'"
            color="primary"
            @click="getPrediction(match.id).homeAdvances = true"
          >
            {{ formatSlot(match.slotHome) }}
          </UButton>
          <UButton
            size="xs"
            :variant="getPrediction(match.id).homeAdvances === false ? 'solid' : 'outline'"
            color="primary"
            @click="getPrediction(match.id).homeAdvances = false"
          >
            {{ formatSlot(match.slotAway) }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
