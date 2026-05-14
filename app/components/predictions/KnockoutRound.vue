<script setup lang="ts">
interface Team { id: string, name: string }
interface Match {
  id: string
  match_no: number
  round: string
  group_letter: string | null
  home_team: Team | null
  away_team: Team | null
  home_slot: string | null
  away_slot: string | null
  home_score: number | null
  away_score: number | null
  home_advances: boolean | null
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
  allMatches: Match[]
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

function resolveSlot(slot: string): string | null {
  // Winner of match N
  if (slot.startsWith('W')) {
    const matchNo = parseInt(slot.slice(1))
    const m = props.allMatches.find(x => x.match_no === matchNo)
    if (!m || m.home_score === null || m.away_score === null) return null
    if (m.home_score > m.away_score) return m.home_team?.name ?? null
    if (m.away_score > m.home_score) return m.away_team?.name ?? null
    return m.home_advances === true ? (m.home_team?.name ?? null) : (m.away_team?.name ?? null)
  }

  // Loser of match N
  if (slot.startsWith('L')) {
    const matchNo = parseInt(slot.slice(1))
    const m = props.allMatches.find(x => x.match_no === matchNo)
    if (!m || m.home_score === null || m.away_score === null) return null
    if (m.home_score > m.away_score) return m.away_team?.name ?? null
    if (m.away_score > m.home_score) return m.home_team?.name ?? null
    return m.home_advances === true ? (m.away_team?.name ?? null) : (m.home_team?.name ?? null)
  }

  // "1A", "2B" — Nth place in group X
  const pos = parseInt(slot[0]!)
  const groupLetter = slot.slice(1)
  if (!isNaN(pos) && groupLetter.length === 1) {
    const groupMatches = props.allMatches.filter(
      x => x.round === 'GROUP' && x.group_letter === groupLetter && x.home_score !== null,
    )
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
    const sorted = [...table.values()].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    return sorted[pos - 1]?.name ?? null
  }

  return null
}

function teamName(match: Match, side: 'home' | 'away'): string {
  const team = side === 'home' ? match.home_team : match.away_team
  if (team) return team.name
  const slot = side === 'home' ? match.home_slot : match.away_slot
  if (!slot) return '?'
  const resolved = resolveSlot(slot)
  if (resolved) return resolved
  // Fallback labels
  if (slot.startsWith('W')) return `Gan. P${slot.slice(1)}`
  if (slot.startsWith('L')) return `Perd. P${slot.slice(1)}`
  const pos = parseInt(slot[0]!)
  const group = slot.slice(1)
  if (!isNaN(pos) && group) return `${pos}º Grupo ${group}`
  return slot
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="match in props.matches"
      :key="match.id"
      class="rounded-lg overflow-hidden"
      :class="props.summary?.[match.id]
        ? (props.summary[match.id].isCorrect ? 'bg-success/5' : 'bg-error/5')
        : ''"
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
        class="flex items-center gap-2 px-4 py-1.5 text-xs font-medium"
        :class="props.summary[match.id].isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
      >
        <span class="flex-1 text-right">Resultado real</span>
        <div class="flex items-center gap-1 shrink-0">
          <span class="font-mono font-bold text-sm w-12 text-center">{{ props.summary[match.id].result.home }}</span>
          <span class="font-bold text-sm">–</span>
          <span class="font-mono font-bold text-sm w-12 text-center">{{ props.summary[match.id].result.away }}</span>
        </div>
        <span class="flex-1 text-left">
          {{ props.summary[match.id].points > 0 ? `+${props.summary[match.id].points} pts` : '0 pts' }}
        </span>
      </div>
    </div>
  </div>
</template>
