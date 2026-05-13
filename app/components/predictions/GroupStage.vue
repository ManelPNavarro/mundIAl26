<script setup lang="ts">
import { GROUP_STAGE } from '~/data/group-stage'

type Prediction = { home: number | null, away: number | null }
type Predictions = Record<number, Prediction>

const props = defineProps<{ locked?: boolean }>()
const predictions = defineModel<Predictions>({ required: true })

function getPrediction(matchId: number): Prediction {
  if (!predictions.value[matchId]) {
    predictions.value[matchId] = { home: null, away: null }
  }
  return predictions.value[matchId]!
}

const openGroups = ref<string[]>(['A'])

function toggleGroup(letter: string) {
  const idx = openGroups.value.indexOf(letter)
  if (idx === -1) openGroups.value.push(letter)
  else openGroups.value.splice(idx, 1)
}

function filledCount(groupLetter: string) {
  const group = GROUP_STAGE.find(g => g.letter === groupLetter)!
  return group.matches.filter(m => {
    const p = predictions.value[m.id]
    return p?.home !== null && p?.away !== null && p?.home !== undefined && p?.away !== undefined
  }).length
}

const matchesByGroup = GROUP_STAGE.map(group => ({
  ...group,
  matchdays: [1, 2, 3].map(day => ({
    day,
    matches: group.matches.filter(m => m.matchday === day),
  })),
}))
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="group in matchesByGroup"
      :key="group.letter"
      class="border border-border rounded-lg overflow-hidden"
    >
      <button
        class="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
        @click="toggleGroup(group.letter)"
      >
        <div class="flex items-center gap-3">
          <span class="font-semibold text-foreground text-sm">Grupo {{ group.letter }}</span>
          <span class="text-xs text-muted hidden sm:inline">{{ group.teams.join(' · ') }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <UBadge
            :color="filledCount(group.letter) === group.matches.length ? 'success' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ filledCount(group.letter) }}/{{ group.matches.length }}
          </UBadge>
          <UIcon
            :name="openGroups.includes(group.letter) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="size-4 text-muted"
          />
        </div>
      </button>

      <div v-if="openGroups.includes(group.letter)" class="divide-y divide-border">
        <div v-for="matchday in group.matchdays" :key="matchday.day" class="px-4 py-3 space-y-3">
          <p class="text-xs font-medium text-muted uppercase tracking-wide">Jornada {{ matchday.day }}</p>
          <div v-for="match in matchday.matches" :key="match.id" class="flex items-center gap-2">
            <span class="flex-1 text-sm text-right text-foreground font-medium truncate">{{ match.home }}</span>
            <div class="flex items-center gap-1 shrink-0">
              <UInput v-model.number="getPrediction(match.id).home" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
              <span class="text-muted font-bold text-sm">–</span>
              <UInput v-model.number="getPrediction(match.id).away" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="props.locked" />
            </div>
            <span class="flex-1 text-sm text-left text-foreground font-medium truncate">{{ match.away }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
