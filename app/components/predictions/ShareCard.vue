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
</script>

<template>
  <div
    id="predictions-share-card"
    style="position:fixed;top:0;left:0;z-index:-1;visibility:hidden;width:900px;background:#ffffff;padding:32px;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;"
  >
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div
        v-for="group in groups"
        :key="group.letter"
        style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;"
      >
        <!-- Group header -->
        <div style="background:#f3f4f6;padding:8px 12px;">
          <span style="font-size:13px;font-weight:700;color:#111827;letter-spacing:0.03em;">
            GRUPO {{ group.letter }}
          </span>
        </div>

        <!-- Matches -->
        <div
          v-for="match in group.matches"
          :key="match.id"
          style="border-top:1px solid #f3f4f6;padding:8px 12px;"
        >
          <div style="font-size:10px;color:#9ca3af;margin-bottom:4px;text-transform:capitalize;">
            {{ formatKickoff(match.kickoff_at) }}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="flex:1;text-align:right;font-size:12px;font-weight:500;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              {{ getFlag(teamName(match, 'home')) }} {{ teamName(match, 'home') }}
            </span>
            <span style="font-size:13px;font-weight:700;color:#111827;white-space:nowrap;font-variant-numeric:tabular-nums;min-width:36px;text-align:center;">
              {{ score(match.id, 'home') }} – {{ score(match.id, 'away') }}
            </span>
            <span style="flex:1;text-align:left;font-size:12px;font-weight:500;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              {{ teamName(match, 'away') }} {{ getFlag(teamName(match, 'away')) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
