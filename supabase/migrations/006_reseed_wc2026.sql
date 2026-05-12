-- =============================================================================
-- Migration 006: Correct WC 2026 seed data
-- 12 groups (A–L) · 48 teams · 72 group matches · 32 knockout matches
-- Replaces incorrect placeholder data from seed.sql
-- =============================================================================

-- 1. Clear old fixture data (preserve users, auth, competitions)
DELETE FROM match_predictions;
DELETE FROM group_predictions;
DELETE FROM predictions;
DELETE FROM scores;
DELETE FROM players;
DELETE FROM matches;
DELETE FROM teams;
DELETE FROM groups;

-- 2. Add matchday column for group-stage organization
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matchday INTEGER;

-- 3. Groups A–L
INSERT INTO groups (name, competition_id) VALUES
  ('Grupo A', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo B', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo C', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo D', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo E', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo F', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo G', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo H', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo I', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo J', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo K', (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Grupo L', (SELECT id FROM competitions WHERE slug = 'wc2026'));

-- Helper macro: group id lookup
-- (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo X')

-- 4. Teams — 4 per group, 48 total
INSERT INTO teams (name, short_name, flag_url, group_id, competition_id) VALUES
  -- Grupo A
  ('Corea del Sur',        'KOR', 'https://flagcdn.com/w40/kr.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo A'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('México',               'MEX', 'https://flagcdn.com/w40/mx.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo A'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('República Checa',      'CZE', 'https://flagcdn.com/w40/cz.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo A'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Sudáfrica',            'ZAF', 'https://flagcdn.com/w40/za.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo A'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo B
  ('Bosnia y Herzegovina', 'BIH', 'https://flagcdn.com/w40/ba.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo B'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Canadá',               'CAN', 'https://flagcdn.com/w40/ca.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo B'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Catar',                'QAT', 'https://flagcdn.com/w40/qa.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo B'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Suiza',                'SUI', 'https://flagcdn.com/w40/ch.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo B'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo C
  ('Brasil',               'BRA', 'https://flagcdn.com/w40/br.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo C'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Escocia',              'SCO', 'https://flagcdn.com/w40/gb-sct.png',(SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo C'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Haití',                'HAI', 'https://flagcdn.com/w40/ht.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo C'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Marruecos',            'MAR', 'https://flagcdn.com/w40/ma.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo C'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo D
  ('Australia',            'AUS', 'https://flagcdn.com/w40/au.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo D'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Estados Unidos',       'USA', 'https://flagcdn.com/w40/us.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo D'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Paraguay',             'PAR', 'https://flagcdn.com/w40/py.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo D'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Turquía',              'TUR', 'https://flagcdn.com/w40/tr.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo D'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo E
  ('Alemania',             'GER', 'https://flagcdn.com/w40/de.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo E'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Costa de Marfil',      'CIV', 'https://flagcdn.com/w40/ci.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo E'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Curazao',              'CUW', 'https://flagcdn.com/w40/cw.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo E'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Ecuador',              'ECU', 'https://flagcdn.com/w40/ec.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo E'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo F
  ('Japón',                'JPN', 'https://flagcdn.com/w40/jp.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo F'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Países Bajos',         'NED', 'https://flagcdn.com/w40/nl.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo F'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Suecia',               'SWE', 'https://flagcdn.com/w40/se.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo F'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Túnez',                'TUN', 'https://flagcdn.com/w40/tn.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo F'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo G
  ('Bélgica',              'BEL', 'https://flagcdn.com/w40/be.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo G'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Egipto',               'EGY', 'https://flagcdn.com/w40/eg.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo G'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Irán',                 'IRN', 'https://flagcdn.com/w40/ir.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo G'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Nueva Zelanda',        'NZL', 'https://flagcdn.com/w40/nz.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo G'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo H
  ('Arabia Saudita',       'KSA', 'https://flagcdn.com/w40/sa.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo H'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Cabo Verde',           'CPV', 'https://flagcdn.com/w40/cv.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo H'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('España',               'ESP', 'https://flagcdn.com/w40/es.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo H'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Uruguay',              'URU', 'https://flagcdn.com/w40/uy.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo H'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo I
  ('Francia',              'FRA', 'https://flagcdn.com/w40/fr.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo I'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Irak',                 'IRQ', 'https://flagcdn.com/w40/iq.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo I'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Noruega',              'NOR', 'https://flagcdn.com/w40/no.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo I'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Senegal',              'SEN', 'https://flagcdn.com/w40/sn.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo I'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo J
  ('Argelia',              'ALG', 'https://flagcdn.com/w40/dz.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo J'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Argentina',            'ARG', 'https://flagcdn.com/w40/ar.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo J'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Austria',              'AUT', 'https://flagcdn.com/w40/at.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo J'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Jordania',             'JOR', 'https://flagcdn.com/w40/jo.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo J'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo K
  ('Colombia',             'COL', 'https://flagcdn.com/w40/co.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo K'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Portugal',             'POR', 'https://flagcdn.com/w40/pt.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo K'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('RD Congo',             'COD', 'https://flagcdn.com/w40/cd.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo K'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Uzbekistán',           'UZB', 'https://flagcdn.com/w40/uz.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo K'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  -- Grupo L
  ('Croacia',              'CRO', 'https://flagcdn.com/w40/hr.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo L'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Ghana',                'GHA', 'https://flagcdn.com/w40/gh.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo L'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Inglaterra',           'ENG', 'https://flagcdn.com/w40/gb-eng.png',(SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo L'), (SELECT id FROM competitions WHERE slug = 'wc2026')),
  ('Panamá',               'PAN', 'https://flagcdn.com/w40/pa.png',    (SELECT id FROM groups WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = 'Grupo L'), (SELECT id FROM competitions WHERE slug = 'wc2026'));

-- 5. Group stage matches (72 total) — 6 per group × 12 groups
-- Matchday 1: June 11–12, 2026
-- Matchday 2: June 16–17, 2026
-- Matchday 3: June 22–23, 2026

INSERT INTO matches (api_id, phase, competition_id, match_date, group_id, home_team_id, away_team_id, status, matchday)
SELECT
  v.api_id,
  'group',
  (SELECT id FROM competitions WHERE slug = 'wc2026'),
  v.match_date::TIMESTAMPTZ,
  (SELECT id FROM groups   WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND name = v.grp),
  (SELECT id FROM teams    WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND short_name = v.home),
  (SELECT id FROM teams    WHERE competition_id = (SELECT id FROM competitions WHERE slug = 'wc2026') AND short_name = v.away),
  'scheduled',
  v.matchday
FROM (VALUES
  -- Matchday 1
  (1,  '2026-06-11T18:00:00Z', 'Grupo A', 'MEX', 'ZAF', 1),
  (2,  '2026-06-11T21:00:00Z', 'Grupo A', 'KOR', 'CZE', 1),
  (3,  '2026-06-12T00:00:00Z', 'Grupo B', 'CAN', 'BIH', 1),
  (4,  '2026-06-12T03:00:00Z', 'Grupo B', 'QAT', 'SUI', 1),
  (5,  '2026-06-12T18:00:00Z', 'Grupo C', 'BRA', 'MAR', 1),
  (6,  '2026-06-12T21:00:00Z', 'Grupo C', 'HAI', 'SCO', 1),
  (7,  '2026-06-13T00:00:00Z', 'Grupo D', 'USA', 'PAR', 1),
  (8,  '2026-06-13T03:00:00Z', 'Grupo D', 'AUS', 'TUR', 1),
  (9,  '2026-06-13T18:00:00Z', 'Grupo E', 'GER', 'CUW', 1),
  (10, '2026-06-13T21:00:00Z', 'Grupo E', 'CIV', 'ECU', 1),
  (11, '2026-06-14T00:00:00Z', 'Grupo F', 'NED', 'JPN', 1),
  (12, '2026-06-14T03:00:00Z', 'Grupo F', 'SWE', 'TUN', 1),
  (13, '2026-06-14T18:00:00Z', 'Grupo G', 'BEL', 'EGY', 1),
  (14, '2026-06-14T21:00:00Z', 'Grupo G', 'IRN', 'NZL', 1),
  (15, '2026-06-15T00:00:00Z', 'Grupo H', 'ESP', 'CPV', 1),
  (16, '2026-06-15T03:00:00Z', 'Grupo H', 'KSA', 'URU', 1),
  (17, '2026-06-15T18:00:00Z', 'Grupo I', 'FRA', 'SEN', 1),
  (18, '2026-06-15T21:00:00Z', 'Grupo I', 'IRQ', 'NOR', 1),
  (19, '2026-06-16T00:00:00Z', 'Grupo J', 'ARG', 'ALG', 1),
  (20, '2026-06-16T03:00:00Z', 'Grupo J', 'AUT', 'JOR', 1),
  (21, '2026-06-16T18:00:00Z', 'Grupo K', 'POR', 'COD', 1),
  (22, '2026-06-16T21:00:00Z', 'Grupo K', 'UZB', 'COL', 1),
  (23, '2026-06-17T00:00:00Z', 'Grupo L', 'ENG', 'CRO', 1),
  (24, '2026-06-17T03:00:00Z', 'Grupo L', 'GHA', 'PAN', 1),
  -- Matchday 2
  (25, '2026-06-21T18:00:00Z', 'Grupo A', 'CZE', 'ZAF', 2),
  (26, '2026-06-21T21:00:00Z', 'Grupo A', 'MEX', 'KOR', 2),
  (27, '2026-06-22T00:00:00Z', 'Grupo B', 'SUI', 'BIH', 2),
  (28, '2026-06-22T03:00:00Z', 'Grupo B', 'CAN', 'QAT', 2),
  (29, '2026-06-22T18:00:00Z', 'Grupo C', 'SCO', 'MAR', 2),
  (30, '2026-06-22T21:00:00Z', 'Grupo C', 'BRA', 'HAI', 2),
  (31, '2026-06-23T00:00:00Z', 'Grupo D', 'USA', 'AUS', 2),
  (32, '2026-06-23T03:00:00Z', 'Grupo D', 'TUR', 'PAR', 2),
  (33, '2026-06-23T18:00:00Z', 'Grupo E', 'GER', 'CIV', 2),
  (34, '2026-06-23T21:00:00Z', 'Grupo E', 'ECU', 'CUW', 2),
  (35, '2026-06-24T00:00:00Z', 'Grupo F', 'NED', 'SWE', 2),
  (36, '2026-06-24T03:00:00Z', 'Grupo F', 'TUN', 'JPN', 2),
  (37, '2026-06-24T18:00:00Z', 'Grupo G', 'BEL', 'IRN', 2),
  (38, '2026-06-24T21:00:00Z', 'Grupo G', 'NZL', 'EGY', 2),
  (39, '2026-06-25T00:00:00Z', 'Grupo H', 'ESP', 'KSA', 2),
  (40, '2026-06-25T03:00:00Z', 'Grupo H', 'URU', 'CPV', 2),
  (41, '2026-06-25T18:00:00Z', 'Grupo I', 'FRA', 'IRQ', 2),
  (42, '2026-06-25T21:00:00Z', 'Grupo I', 'NOR', 'SEN', 2),
  (43, '2026-06-26T00:00:00Z', 'Grupo J', 'ARG', 'AUT', 2),
  (44, '2026-06-26T03:00:00Z', 'Grupo J', 'JOR', 'ALG', 2),
  (45, '2026-06-26T18:00:00Z', 'Grupo K', 'POR', 'UZB', 2),
  (46, '2026-06-26T21:00:00Z', 'Grupo K', 'COL', 'COD', 2),
  (47, '2026-06-27T00:00:00Z', 'Grupo L', 'ENG', 'GHA', 2),
  (48, '2026-06-27T03:00:00Z', 'Grupo L', 'PAN', 'CRO', 2),
  -- Matchday 3
  (49, '2026-07-01T18:00:00Z', 'Grupo A', 'CZE', 'MEX', 3),
  (50, '2026-07-01T18:00:00Z', 'Grupo A', 'ZAF', 'KOR', 3),
  (51, '2026-07-01T21:00:00Z', 'Grupo B', 'SUI', 'CAN', 3),
  (52, '2026-07-01T21:00:00Z', 'Grupo B', 'BIH', 'QAT', 3),
  (53, '2026-07-02T18:00:00Z', 'Grupo C', 'SCO', 'BRA', 3),
  (54, '2026-07-02T18:00:00Z', 'Grupo C', 'MAR', 'HAI', 3),
  (55, '2026-07-02T21:00:00Z', 'Grupo D', 'TUR', 'USA', 3),
  (56, '2026-07-02T21:00:00Z', 'Grupo D', 'PAR', 'AUS', 3),
  (57, '2026-07-03T18:00:00Z', 'Grupo E', 'CUW', 'CIV', 3),
  (58, '2026-07-03T18:00:00Z', 'Grupo E', 'ECU', 'GER', 3),
  (59, '2026-07-03T21:00:00Z', 'Grupo F', 'JPN', 'SWE', 3),
  (60, '2026-07-03T21:00:00Z', 'Grupo F', 'TUN', 'NED', 3),
  (61, '2026-07-04T18:00:00Z', 'Grupo G', 'EGY', 'IRN', 3),
  (62, '2026-07-04T18:00:00Z', 'Grupo G', 'NZL', 'BEL', 3),
  (63, '2026-07-04T21:00:00Z', 'Grupo H', 'CPV', 'KSA', 3),
  (64, '2026-07-04T21:00:00Z', 'Grupo H', 'URU', 'ESP', 3),
  (65, '2026-07-05T18:00:00Z', 'Grupo I', 'NOR', 'FRA', 3),
  (66, '2026-07-05T18:00:00Z', 'Grupo I', 'SEN', 'IRQ', 3),
  (67, '2026-07-05T21:00:00Z', 'Grupo J', 'ALG', 'AUT', 3),
  (68, '2026-07-05T21:00:00Z', 'Grupo J', 'JOR', 'ARG', 3),
  (69, '2026-07-06T18:00:00Z', 'Grupo K', 'COL', 'POR', 3),
  (70, '2026-07-06T18:00:00Z', 'Grupo K', 'COD', 'UZB', 3),
  (71, '2026-07-06T21:00:00Z', 'Grupo L', 'PAN', 'ENG', 3),
  (72, '2026-07-06T21:00:00Z', 'Grupo L', 'CRO', 'GHA', 3)
) AS v(api_id, match_date, grp, home, away, matchday);

-- 6. Knockout matches (32) — teams TBD until group stage resolves
INSERT INTO matches (api_id, phase, competition_id, match_date, status)
SELECT v.api_id, v.phase::match_phase, (SELECT id FROM competitions WHERE slug = 'wc2026'), v.match_date::TIMESTAMPTZ, 'scheduled'
FROM (VALUES
  -- Round of 32 (16 matches)
  (73,  'round_of_32',  '2026-07-10T18:00:00Z'),
  (74,  'round_of_32',  '2026-07-10T21:00:00Z'),
  (75,  'round_of_32',  '2026-07-11T18:00:00Z'),
  (76,  'round_of_32',  '2026-07-11T21:00:00Z'),
  (77,  'round_of_32',  '2026-07-12T18:00:00Z'),
  (78,  'round_of_32',  '2026-07-12T21:00:00Z'),
  (79,  'round_of_32',  '2026-07-13T18:00:00Z'),
  (80,  'round_of_32',  '2026-07-13T21:00:00Z'),
  (81,  'round_of_32',  '2026-07-14T18:00:00Z'),
  (82,  'round_of_32',  '2026-07-14T21:00:00Z'),
  (83,  'round_of_32',  '2026-07-15T18:00:00Z'),
  (84,  'round_of_32',  '2026-07-15T21:00:00Z'),
  (85,  'round_of_32',  '2026-07-16T18:00:00Z'),
  (86,  'round_of_32',  '2026-07-16T21:00:00Z'),
  (87,  'round_of_32',  '2026-07-17T18:00:00Z'),
  (88,  'round_of_32',  '2026-07-17T21:00:00Z'),
  -- Round of 16 (8 matches)
  (89,  'round_of_16',  '2026-07-21T18:00:00Z'),
  (90,  'round_of_16',  '2026-07-21T21:00:00Z'),
  (91,  'round_of_16',  '2026-07-22T18:00:00Z'),
  (92,  'round_of_16',  '2026-07-22T21:00:00Z'),
  (93,  'round_of_16',  '2026-07-23T18:00:00Z'),
  (94,  'round_of_16',  '2026-07-23T21:00:00Z'),
  (95,  'round_of_16',  '2026-07-24T18:00:00Z'),
  (96,  'round_of_16',  '2026-07-24T21:00:00Z'),
  -- Quarterfinals (4 matches)
  (97,  'quarter',      '2026-07-28T18:00:00Z'),
  (98,  'quarter',      '2026-07-28T21:00:00Z'),
  (99,  'quarter',      '2026-07-29T18:00:00Z'),
  (100, 'quarter',      '2026-07-29T21:00:00Z'),
  -- Semifinals (2 matches)
  (101, 'semi',         '2026-08-04T18:00:00Z'),
  (102, 'semi',         '2026-08-04T21:00:00Z'),
  -- Third place + Final
  (103, 'third_place',  '2026-08-08T18:00:00Z'),
  (104, 'final',        '2026-08-09T18:00:00Z')
) AS v(api_id, phase, match_date);
