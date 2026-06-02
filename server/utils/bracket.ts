interface BracketMatch {
  id: string
  match_no: number
  round: string
  group_letter: string | null
  home_team_id: string | null
  away_team_id: string | null
  home_slot: string | null
  away_slot: string | null
  home_score: number | null
  away_score: number | null
  home_advances: boolean | null
}

type PredMap = Map<string, { home_score: number, away_score: number, home_advances: boolean | null }>

function slotToTeamId(
  slot: string,
  allMatches: BracketMatch[],
  predMap: PredMap,
  realOnly: boolean,
): string | null {
  if (slot.startsWith('W') || slot.startsWith('L')) {
    const isWinner = slot.startsWith('W')
    const matchNo = parseInt(slot.slice(1))
    const m = allMatches.find(x => x.match_no === matchNo)
    if (!m) return null

    let hs: number | null = null
    let as_: number | null = null
    let ha: boolean | null = null

    if (!realOnly) {
      const p = predMap.get(m.id)
      if (p) { hs = p.home_score; as_ = p.away_score; ha = p.home_advances }
    }
    if (hs === null) {
      if (realOnly && m.home_score === null) return null
      hs = m.home_score; as_ = m.away_score; ha = m.home_advances
    }
    if (hs === null || as_ === null) return null

    const homeWins = hs > as_ || (hs === as_ && ha === true)
    const winningSide: 'home' | 'away' = homeWins ? 'home' : 'away'
    const side = isWinner ? winningSide : (winningSide === 'home' ? 'away' : 'home')
    return sideToTeamId(side, m, allMatches, predMap, realOnly)
  }

  const pos = parseInt(slot[0]!)
  const groupLetters = slot.slice(1).split('')
  if (!isNaN(pos) && groupLetters.length > 0) {
    const standing = (letter: string) => {
      const gms = allMatches.filter(x => x.round === 'GROUP' && x.group_letter === letter)
      const table = new Map<string, { teamId: string, pts: number, gd: number, gf: number }>()
      for (const gm of gms) {
        if (!gm.home_team_id || !gm.away_team_id) continue
        let hs = gm.home_score
        let as_ = gm.away_score
        if (hs === null) {
          if (realOnly) continue
          const p = predMap.get(gm.id)
          if (!p) continue
          hs = p.home_score; as_ = p.away_score
        }
        if (as_ === null) continue
        if (!table.has(gm.home_team_id)) table.set(gm.home_team_id, { teamId: gm.home_team_id, pts: 0, gd: 0, gf: 0 })
        if (!table.has(gm.away_team_id)) table.set(gm.away_team_id, { teamId: gm.away_team_id, pts: 0, gd: 0, gf: 0 })
        const h = table.get(gm.home_team_id)!
        const a = table.get(gm.away_team_id)!
        h.gf += hs; h.gd += hs - as_
        a.gf += as_; a.gd += as_ - hs
        if (hs > as_) h.pts += 3
        else if (hs === as_) { h.pts += 1; a.pts += 1 }
        else a.pts += 3
      }
      return [...table.values()].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    }

    if (groupLetters.length === 1) return standing(groupLetters[0]!)[pos - 1]?.teamId ?? null

    const candidates = groupLetters.map(l => standing(l)[pos - 1]).filter(Boolean) as { teamId: string, pts: number, gd: number, gf: number }[]
    if (!candidates.length) return null
    candidates.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    return candidates[0]!.teamId
  }

  return null
}

function sideToTeamId(
  side: 'home' | 'away',
  match: BracketMatch,
  allMatches: BracketMatch[],
  predMap: PredMap,
  realOnly: boolean,
): string | null {
  const directId = side === 'home' ? match.home_team_id : match.away_team_id
  if (directId) return directId
  const slot = side === 'home' ? match.home_slot : match.away_slot
  if (!slot) return null
  return slotToTeamId(slot, allMatches, predMap, realOnly)
}

export function resolvedTeams(
  match: BracketMatch,
  allMatches: BracketMatch[],
  predMap: PredMap,
): { real: { home: string | null, away: string | null }, predicted: { home: string | null, away: string | null } } {
  return {
    real: {
      home: sideToTeamId('home', match, allMatches, predMap, true),
      away: sideToTeamId('away', match, allMatches, predMap, true),
    },
    predicted: {
      home: sideToTeamId('home', match, allMatches, predMap, false),
      away: sideToTeamId('away', match, allMatches, predMap, false),
    },
  }
}

export function teamsMatch(match: BracketMatch, allMatches: BracketMatch[], predMap: PredMap): boolean {
  const { real, predicted } = resolvedTeams(match, allMatches, predMap)
  return !!(real.home && real.away && predicted.home && predicted.away
    && real.home === predicted.home && real.away === predicted.away)
}
