// Maps football-data.org English team names to our Spanish names
export const TEAM_NAME_MAP: Record<string, string> = {
  'Korea Republic': 'Corea del Sur',
  'Mexico': 'México',
  'Czech Republic': 'República Checa',
  'Czechia': 'República Checa',
  'South Africa': 'Sudáfrica',
  'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  'Canada': 'Canadá',
  'Qatar': 'Catar',
  'Switzerland': 'Suiza',
  'Brazil': 'Brasil',
  'Scotland': 'Escocia',
  'Haiti': 'Haití',
  'Morocco': 'Marruecos',
  'Australia': 'Australia',
  'United States': 'Estados Unidos',
  'USA': 'Estados Unidos',
  'Paraguay': 'Paraguay',
  'Turkey': 'Turquía',
  'Türkiye': 'Turquía',
  'Germany': 'Alemania',
  "Côte d'Ivoire": 'Costa de Marfil',
  'Ivory Coast': 'Costa de Marfil',
  'Curaçao': 'Curazao',
  'Ecuador': 'Ecuador',
  'Japan': 'Japón',
  'Netherlands': 'Países Bajos',
  'Sweden': 'Suecia',
  'Tunisia': 'Túnez',
  'Belgium': 'Bélgica',
  'Egypt': 'Egipto',
  'Iran': 'Irán',
  'New Zealand': 'Nueva Zelanda',
  'Saudi Arabia': 'Arabia Saudita',
  'Cape Verde': 'Cabo Verde',
  'Spain': 'España',
  'Uruguay': 'Uruguay',
  'France': 'Francia',
  'Iraq': 'Irak',
  'Norway': 'Noruega',
  'Senegal': 'Senegal',
  'Algeria': 'Argelia',
  'Argentina': 'Argentina',
  'Austria': 'Austria',
  'Jordan': 'Jordania',
  'Colombia': 'Colombia',
  'Portugal': 'Portugal',
  'Congo DR': 'RD Congo',
  'DR Congo': 'RD Congo',
  'Uzbekistan': 'Uzbekistán',
  'Croatia': 'Croacia',
  'Ghana': 'Ghana',
  'England': 'Inglaterra',
  'Panama': 'Panamá',
}

export function toSpanish(englishName: string): string {
  return TEAM_NAME_MAP[englishName] ?? englishName
}

export function mapStatus(apiStatus: string): string {
  if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(apiStatus)) return 'LIVE'
  if (apiStatus === 'FINISHED') return 'FINISHED'
  return 'SCHEDULED'
}

export interface ApiMatch {
  id: number
  utcDate: string
  status: string
  matchday: number | null
  stage: string
  group: string | null
  homeTeam: { name: string }
  awayTeam: { name: string }
  score: {
    duration: string
    winner: string | null
    fullTime: { home: number | null, away: number | null }
  }
}
