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
  kickoff_at: string | null
  status: string
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

function scoreFor(m: Match): { home: number, away: number, homeAdvances: boolean | null } | null {
  // Group matches: real result first (R32 must show real qualified teams)
  // Knockout matches: user prediction first (user sees their own predicted bracket)
  if (m.round === 'GROUP') {
    if (m.home_score !== null && m.away_score !== null)
      return { home: m.home_score, away: m.away_score, homeAdvances: m.home_advances }
    const p = predictions.value[m.id]
    if (p?.home != null && p?.away != null)
      return { home: p.home, away: p.away, homeAdvances: p.homeAdvances ?? null }
    return null
  }
  const p = predictions.value[m.id]
  if (p?.home != null && p?.away != null)
    return { home: p.home, away: p.away, homeAdvances: p.homeAdvances ?? null }
  if (m.home_score !== null && m.away_score !== null)
    return { home: m.home_score, away: m.away_score, homeAdvances: m.home_advances }
  return null
}

function matchSideName(m: Match, side: 'home' | 'away'): string | null {
  const team = side === 'home' ? m.home_team : m.away_team
  if (team) return team.name
  const slot = side === 'home' ? m.home_slot : m.away_slot
  return slot ? resolveSlot(slot) : null
}

function resolveSlot(slot: string): string | null {
  if (slot.startsWith('W') || slot.startsWith('L')) {
    const winner = slot.startsWith('W')
    const matchNo = parseInt(slot.slice(1))
    const m = props.allMatches.find(x => x.match_no === matchNo)
    if (!m) return null
    const s = scoreFor(m)
    if (!s) return null
    const homeWins = s.home > s.away || (s.home === s.away && s.homeAdvances === true)
    return winner
      ? (homeWins ? matchSideName(m, 'home') : matchSideName(m, 'away'))
      : (homeWins ? matchSideName(m, 'away') : matchSideName(m, 'home'))
  }

  const pos = parseInt(slot[0]!)
  const groupLetters = slot.slice(1).split('')
  if (!isNaN(pos) && groupLetters.length > 0) {
    const standing = (groupLetter: string) => {
      const groupMatches = props.allMatches.filter(x => x.round === 'GROUP' && x.group_letter === groupLetter)
      const table = new Map<string, { name: string, pts: number, gd: number, gf: number }>()
      for (const m of groupMatches) {
        if (!m.home_team || !m.away_team) continue
        const s = scoreFor(m)
        if (!s) continue
        if (!table.has(m.home_team.id)) table.set(m.home_team.id, { name: m.home_team.name, pts: 0, gd: 0, gf: 0 })
        if (!table.has(m.away_team.id)) table.set(m.away_team.id, { name: m.away_team.name, pts: 0, gd: 0, gf: 0 })
        const h = table.get(m.home_team.id)!
        const a = table.get(m.away_team.id)!
        h.gf += s.home; h.gd += s.home - s.away
        a.gf += s.away; a.gd += s.away - s.home
        if (s.home > s.away) h.pts += 3
        else if (s.home === s.away) { h.pts += 1; a.pts += 1 }
        else a.pts += 3
      }
      return [...table.values()].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    }

    if (groupLetters.length === 1) {
      return standing(groupLetters[0]!)[pos - 1]?.name ?? null
    }

    // Multi-group slot (e.g. "3ABCDF"): pick the best Nth-place team across all listed groups
    const candidates = groupLetters.map(l => standing(l)[pos - 1]).filter(Boolean) as { name: string, pts: number, gd: number, gf: number }[]
    if (candidates.length === 0) return null
    candidates.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    return candidates[0]!.name
  }

  return null
}

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
      <!-- Kickoff time -->
      <div v-if="match.kickoff_at" class="px-4 pt-2 text-xs text-muted text-center">
        {{ formatKickoff(match.kickoff_at) }}
      </div>
      <!-- Prediction row -->
      <div class="flex items-center gap-2 px-4 py-3">
        <span class="flex-1 text-sm text-right font-medium text-foreground truncate">{{ teamName(match, 'home') }}</span>
        <div class="flex items-center gap-1 shrink-0">
          <template v-if="isMatchLocked(match)">
            <span class="font-mono font-bold text-sm text-foreground w-12 text-center">{{ getPrediction(match.id).home ?? '–' }}</span>
            <span class="text-muted font-bold text-sm">–</span>
            <span class="font-mono font-bold text-sm text-foreground w-12 text-center">{{ getPrediction(match.id).away ?? '–' }}</span>
          </template>
          <template v-else>
            <UInput v-model.number="getPrediction(match.id).home" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="false" />
            <span class="text-muted font-bold text-sm">–</span>
            <UInput v-model.number="getPrediction(match.id).away" type="number" min="0" max="99" class="w-12 text-center" size="sm" :disabled="false" />
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
        v-if="hasResult(match)"
        class="flex items-center gap-2 px-4 py-1.5 text-xs font-medium"
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
</template>
