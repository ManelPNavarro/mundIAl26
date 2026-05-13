export interface Match {
  id: number
  matchday: 1 | 2 | 3
  home: string
  away: string
}

export interface Group {
  letter: string
  teams: string[]
  matches: Match[]
}

export const GROUP_STAGE: Group[] = [
  {
    letter: 'A',
    teams: ['Corea del Sur', 'México', 'República Checa', 'Sudáfrica'],
    matches: [
      { id: 1, matchday: 1, home: 'Corea del Sur', away: 'República Checa' },
      { id: 2, matchday: 1, home: 'México', away: 'Sudáfrica' },
      { id: 3, matchday: 2, home: 'México', away: 'Corea del Sur' },
      { id: 4, matchday: 2, home: 'Sudáfrica', away: 'República Checa' },
      { id: 5, matchday: 3, home: 'Corea del Sur', away: 'Sudáfrica' },
      { id: 6, matchday: 3, home: 'República Checa', away: 'México' },
    ],
  },
  {
    letter: 'B',
    teams: ['Bosnia y Herzegovina', 'Canadá', 'Catar', 'Suiza'],
    matches: [
      { id: 7, matchday: 1, home: 'Canadá', away: 'Bosnia y Herzegovina' },
      { id: 8, matchday: 1, home: 'Catar', away: 'Suiza' },
      { id: 9, matchday: 2, home: 'Suiza', away: 'Canadá' },
      { id: 10, matchday: 2, home: 'Bosnia y Herzegovina', away: 'Catar' },
      { id: 11, matchday: 3, home: 'Canadá', away: 'Catar' },
      { id: 12, matchday: 3, home: 'Suiza', away: 'Bosnia y Herzegovina' },
    ],
  },
  {
    letter: 'C',
    teams: ['Brasil', 'Escocia', 'Haití', 'Marruecos'],
    matches: [
      { id: 13, matchday: 1, home: 'Brasil', away: 'Marruecos' },
      { id: 14, matchday: 1, home: 'Haití', away: 'Escocia' },
      { id: 15, matchday: 2, home: 'Escocia', away: 'Brasil' },
      { id: 16, matchday: 2, home: 'Marruecos', away: 'Haití' },
      { id: 17, matchday: 3, home: 'Brasil', away: 'Haití' },
      { id: 18, matchday: 3, home: 'Escocia', away: 'Marruecos' },
    ],
  },
  {
    letter: 'D',
    teams: ['Australia', 'Estados Unidos', 'Paraguay', 'Turquía'],
    matches: [
      { id: 19, matchday: 1, home: 'Estados Unidos', away: 'Paraguay' },
      { id: 20, matchday: 1, home: 'Australia', away: 'Turquía' },
      { id: 21, matchday: 2, home: 'Turquía', away: 'Estados Unidos' },
      { id: 22, matchday: 2, home: 'Paraguay', away: 'Australia' },
      { id: 23, matchday: 3, home: 'Estados Unidos', away: 'Australia' },
      { id: 24, matchday: 3, home: 'Turquía', away: 'Paraguay' },
    ],
  },
  {
    letter: 'E',
    teams: ['Alemania', 'Costa de Marfil', 'Curazao', 'Ecuador'],
    matches: [
      { id: 25, matchday: 1, home: 'Alemania', away: 'Curazao' },
      { id: 26, matchday: 1, home: 'Costa de Marfil', away: 'Ecuador' },
      { id: 27, matchday: 2, home: 'Ecuador', away: 'Alemania' },
      { id: 28, matchday: 2, home: 'Curazao', away: 'Costa de Marfil' },
      { id: 29, matchday: 3, home: 'Alemania', away: 'Costa de Marfil' },
      { id: 30, matchday: 3, home: 'Ecuador', away: 'Curazao' },
    ],
  },
  {
    letter: 'F',
    teams: ['Japón', 'Países Bajos', 'Suecia', 'Túnez'],
    matches: [
      { id: 31, matchday: 1, home: 'Países Bajos', away: 'Japón' },
      { id: 32, matchday: 1, home: 'Suecia', away: 'Túnez' },
      { id: 33, matchday: 2, home: 'Japón', away: 'Suecia' },
      { id: 34, matchday: 2, home: 'Túnez', away: 'Países Bajos' },
      { id: 35, matchday: 3, home: 'Países Bajos', away: 'Suecia' },
      { id: 36, matchday: 3, home: 'Japón', away: 'Túnez' },
    ],
  },
  {
    letter: 'G',
    teams: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
    matches: [
      { id: 37, matchday: 1, home: 'Bélgica', away: 'Irán' },
      { id: 38, matchday: 1, home: 'Egipto', away: 'Nueva Zelanda' },
      { id: 39, matchday: 2, home: 'Irán', away: 'Egipto' },
      { id: 40, matchday: 2, home: 'Nueva Zelanda', away: 'Bélgica' },
      { id: 41, matchday: 3, home: 'Bélgica', away: 'Egipto' },
      { id: 42, matchday: 3, home: 'Irán', away: 'Nueva Zelanda' },
    ],
  },
  {
    letter: 'H',
    teams: ['Arabia Saudita', 'Colombia', 'Ghana', 'Serbia'],
    matches: [
      { id: 43, matchday: 1, home: 'Colombia', away: 'Ghana' },
      { id: 44, matchday: 1, home: 'Arabia Saudita', away: 'Serbia' },
      { id: 45, matchday: 2, home: 'Serbia', away: 'Colombia' },
      { id: 46, matchday: 2, home: 'Ghana', away: 'Arabia Saudita' },
      { id: 47, matchday: 3, home: 'Colombia', away: 'Arabia Saudita' },
      { id: 48, matchday: 3, home: 'Ghana', away: 'Serbia' },
    ],
  },
  {
    letter: 'I',
    teams: ['Argentina', 'Kazajistán', 'Nueva Caledonia', 'Senegal'],
    matches: [
      { id: 49, matchday: 1, home: 'Argentina', away: 'Nueva Caledonia' },
      { id: 50, matchday: 1, home: 'Senegal', away: 'Kazajistán' },
      { id: 51, matchday: 2, home: 'Kazajistán', away: 'Argentina' },
      { id: 52, matchday: 2, home: 'Nueva Caledonia', away: 'Senegal' },
      { id: 53, matchday: 3, home: 'Argentina', away: 'Senegal' },
      { id: 54, matchday: 3, home: 'Nueva Caledonia', away: 'Kazajistán' },
    ],
  },
  {
    letter: 'J',
    teams: ['Arabia Saudita', 'Francia', 'Guatemala', 'Portugal'],
    matches: [
      { id: 55, matchday: 1, home: 'Francia', away: 'Guatemala' },
      { id: 56, matchday: 1, home: 'Portugal', away: 'Arabia Saudita' },
      { id: 57, matchday: 2, home: 'Guatemala', away: 'Portugal' },
      { id: 58, matchday: 2, home: 'Arabia Saudita', away: 'Francia' },
      { id: 59, matchday: 3, home: 'Francia', away: 'Portugal' },
      { id: 60, matchday: 3, home: 'Guatemala', away: 'Arabia Saudita' },
    ],
  },
  {
    letter: 'K',
    teams: ['Croacia', 'España', 'Kenia', 'Tayikistán'],
    matches: [
      { id: 61, matchday: 1, home: 'España', away: 'Kenia' },
      { id: 62, matchday: 1, home: 'Croacia', away: 'Tayikistán' },
      { id: 63, matchday: 2, home: 'Tayikistán', away: 'España' },
      { id: 64, matchday: 2, home: 'Kenia', away: 'Croacia' },
      { id: 65, matchday: 3, home: 'España', away: 'Croacia' },
      { id: 66, matchday: 3, home: 'Kenia', away: 'Tayikistán' },
    ],
  },
  {
    letter: 'L',
    teams: ['China', 'Inglaterra', 'México', 'Panamá'],
    matches: [
      { id: 67, matchday: 1, home: 'Inglaterra', away: 'Panamá' },
      { id: 68, matchday: 1, home: 'China', away: 'México' },
      { id: 69, matchday: 2, home: 'México', away: 'Inglaterra' },
      { id: 70, matchday: 2, home: 'Panamá', away: 'China' },
      { id: 71, matchday: 3, home: 'Inglaterra', away: 'China' },
      { id: 72, matchday: 3, home: 'Panamá', away: 'México' },
    ],
  },
]
