export interface KnockoutMatch {
  id: number
  slotHome: string
  slotAway: string
}

export interface KnockoutRound {
  key: string
  label: string
  matches: KnockoutMatch[]
}

export const KNOCKOUT_ROUNDS: KnockoutRound[] = [
  {
    key: 'r32',
    label: 'Dieciseisavos',
    matches: [
      { id: 73, slotHome: '1A', slotAway: '2B' },
      { id: 74, slotHome: '1C', slotAway: '2D' },
      { id: 75, slotHome: '1E', slotAway: '2F' },
      { id: 76, slotHome: '1G', slotAway: '2H' },
      { id: 77, slotHome: '1I', slotAway: '2J' },
      { id: 78, slotHome: '1K', slotAway: '2L' },
      { id: 79, slotHome: '1B', slotAway: '2A' },
      { id: 80, slotHome: '1D', slotAway: '2C' },
      { id: 81, slotHome: '1F', slotAway: '2E' },
      { id: 82, slotHome: '1H', slotAway: '2G' },
      { id: 83, slotHome: '1J', slotAway: '2I' },
      { id: 84, slotHome: '1L', slotAway: '2K' },
      { id: 85, slotHome: '3ABCD', slotAway: '3EFGH' },
      { id: 86, slotHome: '3IJKL', slotAway: '3ABEF' },
      { id: 87, slotHome: '3CDIJ', slotAway: '3GHKL' },
      { id: 88, slotHome: '3ABCG', slotAway: '3DEFL' },
    ],
  },
  {
    key: 'r16',
    label: 'Octavos de final',
    matches: [
      { id: 89, slotHome: 'W73', slotAway: 'W74' },
      { id: 90, slotHome: 'W75', slotAway: 'W76' },
      { id: 91, slotHome: 'W77', slotAway: 'W78' },
      { id: 92, slotHome: 'W79', slotAway: 'W80' },
      { id: 93, slotHome: 'W81', slotAway: 'W82' },
      { id: 94, slotHome: 'W83', slotAway: 'W84' },
      { id: 95, slotHome: 'W85', slotAway: 'W86' },
      { id: 96, slotHome: 'W87', slotAway: 'W88' },
    ],
  },
  {
    key: 'qf',
    label: 'Cuartos de final',
    matches: [
      { id: 97, slotHome: 'W89', slotAway: 'W90' },
      { id: 98, slotHome: 'W91', slotAway: 'W92' },
      { id: 99, slotHome: 'W93', slotAway: 'W94' },
      { id: 100, slotHome: 'W95', slotAway: 'W96' },
    ],
  },
  {
    key: 'sf',
    label: 'Semifinales',
    matches: [
      { id: 101, slotHome: 'W97', slotAway: 'W98' },
      { id: 102, slotHome: 'W99', slotAway: 'W100' },
    ],
  },
  {
    key: 'final',
    label: 'Final',
    matches: [
      { id: 103, slotHome: 'L101', slotAway: 'L102' },
      { id: 104, slotHome: 'W101', slotAway: 'W102' },
    ],
  },
]
