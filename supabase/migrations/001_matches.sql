-- Teams
CREATE TABLE teams (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  group_letter CHAR(1) NOT NULL CHECK (group_letter BETWEEN 'A' AND 'L')
);

-- Matches
CREATE TABLE matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_no     INTEGER NOT NULL UNIQUE CHECK (match_no BETWEEN 1 AND 104),
  round        TEXT NOT NULL CHECK (round IN ('GROUP','R32','R16','QF','SF','THIRD_PLACE','FINAL')),
  matchday     INTEGER CHECK (matchday BETWEEN 1 AND 3),       -- group stage only
  group_letter CHAR(1) CHECK (group_letter BETWEEN 'A' AND 'L'), -- group stage only
  home_team_id UUID REFERENCES teams(id),  -- NULL for unresolved knockout
  away_team_id UUID REFERENCES teams(id),  -- NULL for unresolved knockout
  home_slot    TEXT,  -- e.g. '1A', '2B', 'W73', 'L101'
  away_slot    TEXT,
  kickoff_at   TIMESTAMPTZ,
  home_score   INTEGER CHECK (home_score >= 0),
  away_score   INTEGER CHECK (away_score >= 0),
  home_advances BOOLEAN,  -- knockout draws: true = home team advances on penalties
  status       TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','LIVE','FINISHED'))
);

-- ─── Teams ────────────────────────────────────────────────────────────────────
INSERT INTO teams (name, group_letter) VALUES
  -- Group A
  ('Corea del Sur',     'A'),
  ('México',            'A'),
  ('República Checa',   'A'),
  ('Sudáfrica',         'A'),
  -- Group B
  ('Bosnia y Herzegovina', 'B'),
  ('Canadá',            'B'),
  ('Catar',             'B'),
  ('Suiza',             'B'),
  -- Group C
  ('Brasil',            'C'),
  ('Escocia',           'C'),
  ('Haití',             'C'),
  ('Marruecos',         'C'),
  -- Group D
  ('Australia',         'D'),
  ('Estados Unidos',    'D'),
  ('Paraguay',          'D'),
  ('Turquía',           'D'),
  -- Group E
  ('Alemania',          'E'),
  ('Costa de Marfil',   'E'),
  ('Curazao',           'E'),
  ('Ecuador',           'E'),
  -- Group F
  ('Japón',             'F'),
  ('Países Bajos',      'F'),
  ('Suecia',            'F'),
  ('Túnez',             'F'),
  -- Group G
  ('Bélgica',           'G'),
  ('Egipto',            'G'),
  ('Irán',              'G'),
  ('Nueva Zelanda',     'G'),
  -- Group H
  ('Arabia Saudita',    'H'),
  ('Cabo Verde',        'H'),
  ('España',            'H'),
  ('Uruguay',           'H'),
  -- Group I
  ('Francia',           'I'),
  ('Irak',              'I'),
  ('Noruega',           'I'),
  ('Senegal',           'I'),
  -- Group J
  ('Argelia',           'J'),
  ('Argentina',         'J'),
  ('Austria',           'J'),
  ('Jordania',          'J'),
  -- Group K
  ('Colombia',          'K'),
  ('Portugal',          'K'),
  ('RD Congo',          'K'),
  ('Uzbekistán',        'K'),
  -- Group L
  ('Croacia',           'L'),
  ('Ghana',             'L'),
  ('Inglaterra',        'L'),
  ('Panamá',            'L');

-- ─── Group stage matches (1–72) ───────────────────────────────────────────────
INSERT INTO matches (match_no, round, matchday, group_letter, home_team_id, away_team_id)
SELECT m.match_no, 'GROUP', m.matchday, m.grp,
       (SELECT id FROM teams WHERE name = m.home),
       (SELECT id FROM teams WHERE name = m.away)
FROM (VALUES
  -- Matchday 1
  (1,  1, 'A', 'México',          'Sudáfrica'),
  (2,  1, 'A', 'Corea del Sur',   'República Checa'),
  (3,  1, 'B', 'Canadá',          'Bosnia y Herzegovina'),
  (4,  1, 'B', 'Catar',           'Suiza'),
  (5,  1, 'C', 'Brasil',          'Marruecos'),
  (6,  1, 'C', 'Haití',           'Escocia'),
  (7,  1, 'D', 'Estados Unidos',  'Paraguay'),
  (8,  1, 'D', 'Australia',       'Turquía'),
  (9,  1, 'E', 'Alemania',        'Curazao'),
  (10, 1, 'E', 'Costa de Marfil', 'Ecuador'),
  (11, 1, 'F', 'Países Bajos',    'Japón'),
  (12, 1, 'F', 'Suecia',          'Túnez'),
  (13, 1, 'G', 'Bélgica',         'Egipto'),
  (14, 1, 'G', 'Irán',            'Nueva Zelanda'),
  (15, 1, 'H', 'España',          'Cabo Verde'),
  (16, 1, 'H', 'Arabia Saudita',  'Uruguay'),
  (17, 1, 'I', 'Francia',         'Senegal'),
  (18, 1, 'I', 'Irak',            'Noruega'),
  (19, 1, 'J', 'Argentina',       'Argelia'),
  (20, 1, 'J', 'Austria',         'Jordania'),
  (21, 1, 'K', 'Portugal',        'RD Congo'),
  (22, 1, 'K', 'Uzbekistán',      'Colombia'),
  (23, 1, 'L', 'Inglaterra',      'Croacia'),
  (24, 1, 'L', 'Ghana',           'Panamá'),
  -- Matchday 2
  (25, 2, 'A', 'República Checa', 'Sudáfrica'),
  (26, 2, 'A', 'México',          'Corea del Sur'),
  (27, 2, 'B', 'Suiza',           'Bosnia y Herzegovina'),
  (28, 2, 'B', 'Canadá',          'Catar'),
  (29, 2, 'C', 'Escocia',         'Marruecos'),
  (30, 2, 'C', 'Brasil',          'Haití'),
  (31, 2, 'D', 'Estados Unidos',  'Australia'),
  (32, 2, 'D', 'Turquía',         'Paraguay'),
  (33, 2, 'E', 'Alemania',        'Costa de Marfil'),
  (34, 2, 'E', 'Ecuador',         'Curazao'),
  (35, 2, 'F', 'Países Bajos',    'Suecia'),
  (36, 2, 'F', 'Túnez',           'Japón'),
  (37, 2, 'G', 'Bélgica',         'Irán'),
  (38, 2, 'G', 'Nueva Zelanda',   'Egipto'),
  (39, 2, 'H', 'España',          'Arabia Saudita'),
  (40, 2, 'H', 'Uruguay',         'Cabo Verde'),
  (41, 2, 'I', 'Francia',         'Irak'),
  (42, 2, 'I', 'Noruega',         'Senegal'),
  (43, 2, 'J', 'Argentina',       'Austria'),
  (44, 2, 'J', 'Jordania',        'Argelia'),
  (45, 2, 'K', 'Portugal',        'Uzbekistán'),
  (46, 2, 'K', 'Colombia',        'RD Congo'),
  (47, 2, 'L', 'Inglaterra',      'Ghana'),
  (48, 2, 'L', 'Panamá',          'Croacia'),
  -- Matchday 3
  (49, 3, 'A', 'República Checa', 'México'),
  (50, 3, 'A', 'Sudáfrica',       'Corea del Sur'),
  (51, 3, 'B', 'Suiza',           'Canadá'),
  (52, 3, 'B', 'Bosnia y Herzegovina', 'Catar'),
  (53, 3, 'C', 'Escocia',         'Brasil'),
  (54, 3, 'C', 'Marruecos',       'Haití'),
  (55, 3, 'D', 'Turquía',         'Estados Unidos'),
  (56, 3, 'D', 'Paraguay',        'Australia'),
  (57, 3, 'E', 'Curazao',         'Costa de Marfil'),
  (58, 3, 'E', 'Ecuador',         'Alemania'),
  (59, 3, 'F', 'Japón',           'Suecia'),
  (60, 3, 'F', 'Túnez',           'Países Bajos'),
  (61, 3, 'G', 'Egipto',          'Irán'),
  (62, 3, 'G', 'Nueva Zelanda',   'Bélgica'),
  (63, 3, 'H', 'Cabo Verde',      'Arabia Saudita'),
  (64, 3, 'H', 'Uruguay',         'España'),
  (65, 3, 'I', 'Noruega',         'Francia'),
  (66, 3, 'I', 'Senegal',         'Irak'),
  (67, 3, 'J', 'Argelia',         'Austria'),
  (68, 3, 'J', 'Jordania',        'Argentina'),
  (69, 3, 'K', 'Colombia',        'Portugal'),
  (70, 3, 'K', 'RD Congo',        'Uzbekistán'),
  (71, 3, 'L', 'Panamá',          'Inglaterra'),
  (72, 3, 'L', 'Croacia',         'Ghana')
) AS m(match_no, matchday, grp, home, away);

-- ─── Knockout matches (73–104) ────────────────────────────────────────────────
-- Teams are NULL until group stage resolves; slot labels drive the bracket.
INSERT INTO matches (match_no, round, home_slot, away_slot)
VALUES
  -- Round of 32
  (73,  'R32',         '2A',      '2B'),
  (74,  'R32',         '1C',      '2F'),
  (75,  'R32',         '1E',      '3ABCDF'),
  (76,  'R32',         '1F',      '2C'),
  (77,  'R32',         '2E',      '2I'),
  (78,  'R32',         '1I',      '3CDFGH'),
  (79,  'R32',         '1A',      '3CEFHI'),
  (80,  'R32',         '1L',      '3EHIJK'),
  (81,  'R32',         '1G',      '3AEHIJ'),
  (82,  'R32',         '1D',      '3BEFIJ'),
  (83,  'R32',         '1H',      '2J'),
  (84,  'R32',         '2K',      '2L'),
  (85,  'R32',         '1B',      '3EFGIJ'),
  (86,  'R32',         '2D',      '2G'),
  (87,  'R32',         '1J',      '2H'),
  (88,  'R32',         '1K',      '3DEIJL'),
  -- Round of 16 (W-refs follow FIFA's official bracket tree for our R32 numbering)
  (89,  'R16',         'W75',     'W78'),
  (90,  'R16',         'W73',     'W76'),
  (91,  'R16',         'W74',     'W77'),
  (92,  'R16',         'W79',     'W80'),
  (93,  'R16',         'W83',     'W84'),
  (94,  'R16',         'W81',     'W82'),
  (95,  'R16',         'W86',     'W87'),
  (96,  'R16',         'W85',     'W88'),
  -- Quarter-finals
  (97,  'QF',          'W89',     'W90'),
  (98,  'QF',          'W93',     'W94'),
  (99,  'QF',          'W91',     'W92'),
  (100, 'QF',          'W95',     'W96'),
  -- Semi-finals
  (101, 'SF',          'W97',     'W98'),
  (102, 'SF',          'W99',     'W100'),
  -- Third place & Final
  (103, 'THIRD_PLACE', 'L101',    'L102'),
  (104, 'FINAL',       'W101',    'W102');
