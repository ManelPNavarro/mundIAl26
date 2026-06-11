<script setup lang="ts">
interface Match {
  id: string
  match_no: number
  matchday: number | null
  group_letter: string | null
  kickoff_at: string | null
  home_team: { name: string } | null
  away_team: { name: string } | null
  home_slot: string | null
  away_slot: string | null
}

interface Group {
  letter: string
  matches: Match[]
}

type Prediction = { home: number | null, away: number | null }

const props = defineProps<{
  groups: Group[]
  predictions: Record<string, Prediction>
  displayName: string
}>()

function teamName(match: Match, side: 'home' | 'away'): string {
  const team = side === 'home' ? match.home_team : match.away_team
  if (team) return team.name
  return side === 'home' ? (match.home_slot ?? '?') : (match.away_slot ?? '?')
}

function formatKickoff(kickoff_at: string | null): string {
  if (!kickoff_at) return ''
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid', hour12: false,
  }).format(new Date(kickoff_at))
}

function score(matchId: string, side: 'home' | 'away'): string {
  const p = props.predictions[matchId]
  const val = side === 'home' ? p?.home : p?.away
  return val != null ? String(val) : '–'
}

// App palette (dark mode) — hardcoded to avoid CSS variable resolution issues
const C = {
  bg:         '#141426', // neutral-800
  card:       '#242432', // neutral-700
  border:     '#3E3E53', // neutral-600
  header:     '#080810', // neutral-900
  text:       '#E6E6E7', // neutral-50
  muted:      '#9797A8', // neutral-300
  primary:    '#02FFA1', // green-400
}
</script>

<template>
  <div
    id="predictions-share-card"
    :style="`position:fixed;top:0;left:0;z-index:-1;visibility:hidden;width:960px;padding:32px;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;background:${C.bg};`"
  >
    <!-- Header -->
    <div :style="`margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid ${C.border};`">
      <p :style="`font-size:22px;font-weight:700;color:${C.text};margin:0 0 2px;`">
        Predicciones de {{ props.displayName }}
      </p>
      <p :style="`font-size:13px;color:${C.muted};margin:0;`">Fase de grupos · mundIAl 26</p>
    </div>

    <!-- Groups grid -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
      <div
        v-for="group in groups"
        :key="group.letter"
        :style="`border:1px solid ${C.border};border-radius:10px;overflow:hidden;`"
      >
        <!-- Group header -->
        <div :style="`background:${C.header};padding:7px 12px;`">
          <span :style="`font-size:11px;font-weight:700;color:${C.primary};letter-spacing:0.08em;`">
            GRUPO {{ group.letter }}
          </span>
        </div>

        <!-- Matches -->
        <div
          v-for="match in group.matches"
          :key="match.id"
          :style="`border-top:1px solid ${C.border};padding:7px 12px;background:${C.card};`"
        >
          <div :style="`font-size:9px;color:${C.muted};margin-bottom:4px;text-transform:capitalize;letter-spacing:0.02em;`">
            {{ formatKickoff(match.kickoff_at) }}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span :style="`flex:1;text-align:right;font-size:11px;font-weight:500;color:${C.text};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`">
              {{ getFlag(teamName(match, 'home')) }} {{ teamName(match, 'home') }}
            </span>
            <span :style="`font-size:13px;font-weight:700;color:${C.primary};white-space:nowrap;min-width:40px;text-align:center;`">
              {{ score(match.id, 'home') }}–{{ score(match.id, 'away') }}
            </span>
            <span :style="`flex:1;text-align:left;font-size:11px;font-weight:500;color:${C.text};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`">
              {{ teamName(match, 'away') }} {{ getFlag(teamName(match, 'away')) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
