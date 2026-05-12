'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Team {
  id: string
  name: string
  short_name: string
  flag_url: string | null
}

interface Match {
  id: string
  api_id: number
  phase: string
  matchday: number | null
  group_name: string | null
  home_team: Team | null
  away_team: Team | null
  home_score: number | null
  away_score: number | null
  status: string
}

interface GroupSection {
  name: string
  matches: Match[]
}

type MatchState = { homeScore: string; awayScore: string; status: string }

export default function ResultadosPage() {
  const [groups, setGroups] = useState<GroupSection[]>([])
  const [matchStates, setMatchStates] = useState<Record<string, MatchState>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [recalculating, setRecalculating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    setLoading(true)
    const supabase = createClient()

    const { data: matchesRaw, error } = await supabase
      .from('matches')
      .select(`
        id, api_id, phase, matchday, status,
        home_score, away_score,
        home_team:teams!matches_home_team_id_fkey(id, name, short_name, flag_url),
        away_team:teams!matches_away_team_id_fkey(id, name, short_name, flag_url),
        group:groups(name)
      `)
      .eq('phase', 'group')
      .order('api_id')

    if (error || !matchesRaw) {
      toast.error('Error cargando partidos')
      setLoading(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches: Match[] = (matchesRaw as any[]).map((m) => ({
      id: m.id,
      api_id: m.api_id,
      phase: m.phase,
      matchday: m.matchday,
      group_name: m.group?.name ?? null,
      home_team: m.home_team ?? null,
      away_team: m.away_team ?? null,
      home_score: m.home_score,
      away_score: m.away_score,
      status: m.status,
    }))

    // Initialize local state from DB values
    const states: Record<string, MatchState> = {}
    for (const m of matches) {
      states[m.id] = {
        homeScore: m.home_score !== null ? String(m.home_score) : '',
        awayScore: m.away_score !== null ? String(m.away_score) : '',
        status: m.status,
      }
    }
    setMatchStates(states)

    // Group by group name
    const groupMap = new Map<string, Match[]>()
    for (const m of matches) {
      const key = m.group_name ?? 'Sin grupo'
      if (!groupMap.has(key)) groupMap.set(key, [])
      groupMap.get(key)!.push(m)
    }
    const sorted = Array.from(groupMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, ms]) => ({ name, matches: ms }))

    setGroups(sorted)
    setLoading(false)
  }

  const updateState = useCallback((matchId: string, field: keyof MatchState, value: string) => {
    setMatchStates((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }))
  }, [])

  async function saveMatch(matchId: string) {
    setSaving((prev) => ({ ...prev, [matchId]: true }))
    const s = matchStates[matchId]

    const res = await fetch('/api/admin/resultados', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        homeScore: s.homeScore,
        awayScore: s.awayScore,
        status: s.status,
      }),
    })

    if (res.ok) {
      toast.success('Resultado guardado')
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Error al guardar')
    }

    setSaving((prev) => ({ ...prev, [matchId]: false }))
  }

  async function recalculate() {
    setRecalculating(true)
    const res = await fetch('/api/recalculate-scores', { method: 'POST' })
    if (res.ok) {
      const { recalculated } = await res.json()
      toast.success(`Puntuaciones recalculadas para ${recalculated} usuario(s)`)
    } else {
      toast.error('Error al recalcular')
    }
    setRecalculating(false)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-10 w-64 skeleton-shimmer rounded mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 skeleton-shimmer rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-bebas text-5xl text-white tracking-tight">RESULTADOS</h1>
          <p className="text-gray-400 text-sm mt-1">Introduce los resultados de los partidos de la fase de grupos.</p>
        </div>
        <button
          onClick={recalculate}
          disabled={recalculating}
          className="flex items-center gap-2 bg-primary text-on-primary font-bold text-sm px-6 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-base leading-none">calculate</span>
          {recalculating ? 'Recalculando…' : 'Recalcular puntuaciones'}
        </button>
      </div>

      {/* Group sections */}
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.name}>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-bebas text-2xl text-primary tracking-wide">{group.name}</h2>
              <div className="h-px flex-1 bg-primary/20" />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                    <th className="px-4 py-3 text-left">J.</th>
                    <th className="px-4 py-3 text-right">Local</th>
                    <th className="px-4 py-3 text-center w-32">Resultado</th>
                    <th className="px-4 py-3 text-left">Visitante</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Guardar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {group.matches.map((match) => {
                    const s = matchStates[match.id]
                    const isSaving = saving[match.id]
                    const isFinished = s?.status === 'finished'

                    return (
                      <tr
                        key={match.id}
                        className={`bg-surface-container-lowest hover:bg-surface-container-low transition-colors ${isFinished ? 'opacity-80' : ''}`}
                      >
                        {/* Matchday */}
                        <td className="px-4 py-3 text-gray-500 font-bold">{match.matchday ?? '–'}</td>

                        {/* Home team */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-white font-medium">{match.home_team?.short_name ?? '?'}</span>
                            {match.home_team?.flag_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={match.home_team.flag_url} alt="" className="w-6 h-4 object-cover rounded-sm" />
                            )}
                          </div>
                        </td>

                        {/* Score inputs */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={99}
                              value={s?.homeScore ?? ''}
                              onChange={(e) => updateState(match.id, 'homeScore', e.target.value)}
                              disabled={isFinished}
                              placeholder="–"
                              className="w-10 h-8 bg-surface-container-high text-center text-white font-bebas text-lg rounded focus:ring-1 focus:ring-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                            />
                            <span className="text-gray-500 font-bebas text-lg">-</span>
                            <input
                              type="number"
                              min={0}
                              max={99}
                              value={s?.awayScore ?? ''}
                              onChange={(e) => updateState(match.id, 'awayScore', e.target.value)}
                              disabled={isFinished}
                              placeholder="–"
                              className="w-10 h-8 bg-surface-container-high text-center text-white font-bebas text-lg rounded focus:ring-1 focus:ring-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                            />
                          </div>
                        </td>

                        {/* Away team */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {match.away_team?.flag_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={match.away_team.flag_url} alt="" className="w-6 h-4 object-cover rounded-sm" />
                            )}
                            <span className="text-white font-medium">{match.away_team?.short_name ?? '?'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <select
                            value={s?.status ?? 'scheduled'}
                            onChange={(e) => updateState(match.id, 'status', e.target.value)}
                            className="bg-surface-container-high text-white text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="scheduled">Programado</option>
                            <option value="live">En juego</option>
                            <option value="finished">Finalizado</option>
                          </select>
                        </td>

                        {/* Save */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => saveMatch(match.id)}
                            disabled={isSaving}
                            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                          >
                            {isSaving ? '…' : 'Guardar'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
