-- =============================================================================
-- mundIAl26 – World Cup 2026 Seed Data
-- 48 teams · 16 groups (A–P) · 48 group-stage matches · 144 players
-- NOTE: Groups are plausible development fixtures, not the official draw.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. GROUPS (A through P)
-- ---------------------------------------------------------------------------
INSERT INTO groups (name) VALUES
  ('Group A'),
  ('Group B'),
  ('Group C'),
  ('Group D'),
  ('Group E'),
  ('Group F'),
  ('Group G'),
  ('Group H'),
  ('Group I'),
  ('Group J'),
  ('Group K'),
  ('Group L'),
  ('Group M'),
  ('Group N'),
  ('Group O'),
  ('Group P')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. TEAMS (3 per group, 48 total)
-- ---------------------------------------------------------------------------
INSERT INTO teams (name, short_name, flag_url, group_id) VALUES
  -- Group A
  ('Argentina',      'ARG', 'https://flagcdn.com/w40/ar.png', (SELECT id FROM groups WHERE name = 'Group A')),
  ('United States',  'USA', 'https://flagcdn.com/w40/us.png', (SELECT id FROM groups WHERE name = 'Group A')),
  ('Slovenia',       'SVN', 'https://flagcdn.com/w40/si.png', (SELECT id FROM groups WHERE name = 'Group A')),

  -- Group B
  ('Spain',          'ESP', 'https://flagcdn.com/w40/es.png', (SELECT id FROM groups WHERE name = 'Group B')),
  ('Morocco',        'MAR', 'https://flagcdn.com/w40/ma.png', (SELECT id FROM groups WHERE name = 'Group B')),
  ('Azerbaijan',     'AZE', 'https://flagcdn.com/w40/az.png', (SELECT id FROM groups WHERE name = 'Group B')),

  -- Group C
  ('France',         'FRA', 'https://flagcdn.com/w40/fr.png', (SELECT id FROM groups WHERE name = 'Group C')),
  ('Uruguay',        'URU', 'https://flagcdn.com/w40/uy.png', (SELECT id FROM groups WHERE name = 'Group C')),
  ('Saudi Arabia',   'KSA', 'https://flagcdn.com/w40/sa.png', (SELECT id FROM groups WHERE name = 'Group C')),

  -- Group D
  ('Brazil',         'BRA', 'https://flagcdn.com/w40/br.png', (SELECT id FROM groups WHERE name = 'Group D')),
  ('Mexico',         'MEX', 'https://flagcdn.com/w40/mx.png', (SELECT id FROM groups WHERE name = 'Group D')),
  ('Switzerland',    'SUI', 'https://flagcdn.com/w40/ch.png', (SELECT id FROM groups WHERE name = 'Group D')),

  -- Group E
  ('England',        'ENG', 'https://flagcdn.com/w40/gb-eng.png', (SELECT id FROM groups WHERE name = 'Group E')),
  ('Senegal',        'SEN', 'https://flagcdn.com/w40/sn.png', (SELECT id FROM groups WHERE name = 'Group E')),
  ('Ecuador',        'ECU', 'https://flagcdn.com/w40/ec.png', (SELECT id FROM groups WHERE name = 'Group E')),

  -- Group F
  ('Portugal',       'POR', 'https://flagcdn.com/w40/pt.png', (SELECT id FROM groups WHERE name = 'Group F')),
  ('Poland',         'POL', 'https://flagcdn.com/w40/pl.png', (SELECT id FROM groups WHERE name = 'Group F')),
  ('Ukraine',        'UKR', 'https://flagcdn.com/w40/ua.png', (SELECT id FROM groups WHERE name = 'Group F')),

  -- Group G
  ('Germany',        'GER', 'https://flagcdn.com/w40/de.png', (SELECT id FROM groups WHERE name = 'Group G')),
  ('Japan',          'JPN', 'https://flagcdn.com/w40/jp.png', (SELECT id FROM groups WHERE name = 'Group G')),
  ('New Zealand',    'NZL', 'https://flagcdn.com/w40/nz.png', (SELECT id FROM groups WHERE name = 'Group G')),

  -- Group H
  ('Netherlands',    'NED', 'https://flagcdn.com/w40/nl.png', (SELECT id FROM groups WHERE name = 'Group H')),
  ('Algeria',        'ALG', 'https://flagcdn.com/w40/dz.png', (SELECT id FROM groups WHERE name = 'Group H')),
  ('South Korea',    'KOR', 'https://flagcdn.com/w40/kr.png', (SELECT id FROM groups WHERE name = 'Group H')),

  -- Group I
  ('Belgium',        'BEL', 'https://flagcdn.com/w40/be.png', (SELECT id FROM groups WHERE name = 'Group I')),
  ('Colombia',       'COL', 'https://flagcdn.com/w40/co.png', (SELECT id FROM groups WHERE name = 'Group I')),
  ('Egypt',          'EGY', 'https://flagcdn.com/w40/eg.png', (SELECT id FROM groups WHERE name = 'Group I')),

  -- Group J
  ('Italy',          'ITA', 'https://flagcdn.com/w40/it.png', (SELECT id FROM groups WHERE name = 'Group J')),
  ('Croatia',        'CRO', 'https://flagcdn.com/w40/hr.png', (SELECT id FROM groups WHERE name = 'Group J')),
  ('Albania',        'ALB', 'https://flagcdn.com/w40/al.png', (SELECT id FROM groups WHERE name = 'Group J')),

  -- Group K
  ('Serbia',         'SRB', 'https://flagcdn.com/w40/rs.png', (SELECT id FROM groups WHERE name = 'Group K')),
  ('Australia',      'AUS', 'https://flagcdn.com/w40/au.png', (SELECT id FROM groups WHERE name = 'Group K')),
  ('Guatemala',      'GUA', 'https://flagcdn.com/w40/gt.png', (SELECT id FROM groups WHERE name = 'Group K')),

  -- Group L
  ('Turkey',         'TUR', 'https://flagcdn.com/w40/tr.png', (SELECT id FROM groups WHERE name = 'Group L')),
  ('Cameroon',       'CMR', 'https://flagcdn.com/w40/cm.png', (SELECT id FROM groups WHERE name = 'Group L')),
  ('Costa Rica',     'CRC', 'https://flagcdn.com/w40/cr.png', (SELECT id FROM groups WHERE name = 'Group L')),

  -- Group M
  ('Iran',           'IRN', 'https://flagcdn.com/w40/ir.png', (SELECT id FROM groups WHERE name = 'Group M')),
  ('Panama',         'PAN', 'https://flagcdn.com/w40/pa.png', (SELECT id FROM groups WHERE name = 'Group M')),
  ('Jamaica',        'JAM', 'https://flagcdn.com/w40/jm.png', (SELECT id FROM groups WHERE name = 'Group M')),

  -- Group N
  ('Canada',         'CAN', 'https://flagcdn.com/w40/ca.png', (SELECT id FROM groups WHERE name = 'Group N')),
  ('Nigeria',        'NGA', 'https://flagcdn.com/w40/ng.png', (SELECT id FROM groups WHERE name = 'Group N')),
  ('Tunisia',        'TUN', 'https://flagcdn.com/w40/tn.png', (SELECT id FROM groups WHERE name = 'Group N')),

  -- Group O
  ('Chile',          'CHI', 'https://flagcdn.com/w40/cl.png', (SELECT id FROM groups WHERE name = 'Group O')),
  ('Paraguay',       'PAR', 'https://flagcdn.com/w40/py.png', (SELECT id FROM groups WHERE name = 'Group O')),
  ('South Africa',   'RSA', 'https://flagcdn.com/w40/za.png', (SELECT id FROM groups WHERE name = 'Group O')),

  -- Group P
  ('Qatar',          'QAT', 'https://flagcdn.com/w40/qa.png', (SELECT id FROM groups WHERE name = 'Group P')),
  ('Honduras',       'HON', 'https://flagcdn.com/w40/hn.png', (SELECT id FROM groups WHERE name = 'Group P')),
  ('Bosnia & Herzegovina', 'BIH', 'https://flagcdn.com/w40/ba.png', (SELECT id FROM groups WHERE name = 'Group P'))
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. GROUP STAGE MATCHES (3 per group × 16 groups = 48 matches)
--    Schedule starts 2026-06-11. Each group slot is 2 hours apart.
--    Slot 1 18:00Z · Slot 2 21:00Z · Slot 3 next day 00:00Z (late kick-off)
-- ---------------------------------------------------------------------------
INSERT INTO matches (phase, group_id, home_team_id, away_team_id, status, match_date) VALUES

  -- Group A  (Jun 11–13)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group A'),
    (SELECT id FROM teams WHERE short_name = 'ARG'),
    (SELECT id FROM teams WHERE short_name = 'USA'),
    'scheduled', '2026-06-11T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group A'),
    (SELECT id FROM teams WHERE short_name = 'ARG'),
    (SELECT id FROM teams WHERE short_name = 'SVN'),
    'scheduled', '2026-06-12T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group A'),
    (SELECT id FROM teams WHERE short_name = 'USA'),
    (SELECT id FROM teams WHERE short_name = 'SVN'),
    'scheduled', '2026-06-13T18:00:00Z'),

  -- Group B  (Jun 11–13)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group B'),
    (SELECT id FROM teams WHERE short_name = 'ESP'),
    (SELECT id FROM teams WHERE short_name = 'MAR'),
    'scheduled', '2026-06-11T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group B'),
    (SELECT id FROM teams WHERE short_name = 'ESP'),
    (SELECT id FROM teams WHERE short_name = 'AZE'),
    'scheduled', '2026-06-12T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group B'),
    (SELECT id FROM teams WHERE short_name = 'MAR'),
    (SELECT id FROM teams WHERE short_name = 'AZE'),
    'scheduled', '2026-06-13T21:00:00Z'),

  -- Group C  (Jun 12–14)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group C'),
    (SELECT id FROM teams WHERE short_name = 'FRA'),
    (SELECT id FROM teams WHERE short_name = 'URU'),
    'scheduled', '2026-06-12T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group C'),
    (SELECT id FROM teams WHERE short_name = 'FRA'),
    (SELECT id FROM teams WHERE short_name = 'KSA'),
    'scheduled', '2026-06-13T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group C'),
    (SELECT id FROM teams WHERE short_name = 'URU'),
    (SELECT id FROM teams WHERE short_name = 'KSA'),
    'scheduled', '2026-06-14T00:00:00Z'),

  -- Group D  (Jun 12–14)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group D'),
    (SELECT id FROM teams WHERE short_name = 'BRA'),
    (SELECT id FROM teams WHERE short_name = 'MEX'),
    'scheduled', '2026-06-12T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group D'),
    (SELECT id FROM teams WHERE short_name = 'BRA'),
    (SELECT id FROM teams WHERE short_name = 'SUI'),
    'scheduled', '2026-06-13T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group D'),
    (SELECT id FROM teams WHERE short_name = 'MEX'),
    (SELECT id FROM teams WHERE short_name = 'SUI'),
    'scheduled', '2026-06-14T18:00:00Z'),

  -- Group E  (Jun 13–15)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group E'),
    (SELECT id FROM teams WHERE short_name = 'ENG'),
    (SELECT id FROM teams WHERE short_name = 'SEN'),
    'scheduled', '2026-06-13T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group E'),
    (SELECT id FROM teams WHERE short_name = 'ENG'),
    (SELECT id FROM teams WHERE short_name = 'ECU'),
    'scheduled', '2026-06-14T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group E'),
    (SELECT id FROM teams WHERE short_name = 'SEN'),
    (SELECT id FROM teams WHERE short_name = 'ECU'),
    'scheduled', '2026-06-15T21:00:00Z'),

  -- Group F  (Jun 13–15)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group F'),
    (SELECT id FROM teams WHERE short_name = 'POR'),
    (SELECT id FROM teams WHERE short_name = 'POL'),
    'scheduled', '2026-06-13T15:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group F'),
    (SELECT id FROM teams WHERE short_name = 'POR'),
    (SELECT id FROM teams WHERE short_name = 'UKR'),
    'scheduled', '2026-06-14T15:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group F'),
    (SELECT id FROM teams WHERE short_name = 'POL'),
    (SELECT id FROM teams WHERE short_name = 'UKR'),
    'scheduled', '2026-06-15T15:00:00Z'),

  -- Group G  (Jun 14–16)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group G'),
    (SELECT id FROM teams WHERE short_name = 'GER'),
    (SELECT id FROM teams WHERE short_name = 'JPN'),
    'scheduled', '2026-06-14T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group G'),
    (SELECT id FROM teams WHERE short_name = 'GER'),
    (SELECT id FROM teams WHERE short_name = 'NZL'),
    'scheduled', '2026-06-15T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group G'),
    (SELECT id FROM teams WHERE short_name = 'JPN'),
    (SELECT id FROM teams WHERE short_name = 'NZL'),
    'scheduled', '2026-06-16T00:00:00Z'),

  -- Group H  (Jun 14–16)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group H'),
    (SELECT id FROM teams WHERE short_name = 'NED'),
    (SELECT id FROM teams WHERE short_name = 'ALG'),
    'scheduled', '2026-06-14T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group H'),
    (SELECT id FROM teams WHERE short_name = 'NED'),
    (SELECT id FROM teams WHERE short_name = 'KOR'),
    'scheduled', '2026-06-15T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group H'),
    (SELECT id FROM teams WHERE short_name = 'ALG'),
    (SELECT id FROM teams WHERE short_name = 'KOR'),
    'scheduled', '2026-06-16T21:00:00Z'),

  -- Group I  (Jun 15–17)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group I'),
    (SELECT id FROM teams WHERE short_name = 'BEL'),
    (SELECT id FROM teams WHERE short_name = 'COL'),
    'scheduled', '2026-06-15T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group I'),
    (SELECT id FROM teams WHERE short_name = 'BEL'),
    (SELECT id FROM teams WHERE short_name = 'EGY'),
    'scheduled', '2026-06-16T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group I'),
    (SELECT id FROM teams WHERE short_name = 'COL'),
    (SELECT id FROM teams WHERE short_name = 'EGY'),
    'scheduled', '2026-06-17T18:00:00Z'),

  -- Group J  (Jun 15–17)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group J'),
    (SELECT id FROM teams WHERE short_name = 'ITA'),
    (SELECT id FROM teams WHERE short_name = 'CRO'),
    'scheduled', '2026-06-15T15:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group J'),
    (SELECT id FROM teams WHERE short_name = 'ITA'),
    (SELECT id FROM teams WHERE short_name = 'ALB'),
    'scheduled', '2026-06-16T15:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group J'),
    (SELECT id FROM teams WHERE short_name = 'CRO'),
    (SELECT id FROM teams WHERE short_name = 'ALB'),
    'scheduled', '2026-06-17T15:00:00Z'),

  -- Group K  (Jun 16–18)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group K'),
    (SELECT id FROM teams WHERE short_name = 'SRB'),
    (SELECT id FROM teams WHERE short_name = 'AUS'),
    'scheduled', '2026-06-16T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group K'),
    (SELECT id FROM teams WHERE short_name = 'SRB'),
    (SELECT id FROM teams WHERE short_name = 'GUA'),
    'scheduled', '2026-06-17T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group K'),
    (SELECT id FROM teams WHERE short_name = 'AUS'),
    (SELECT id FROM teams WHERE short_name = 'GUA'),
    'scheduled', '2026-06-18T00:00:00Z'),

  -- Group L  (Jun 16–18)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group L'),
    (SELECT id FROM teams WHERE short_name = 'TUR'),
    (SELECT id FROM teams WHERE short_name = 'CMR'),
    'scheduled', '2026-06-16T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group L'),
    (SELECT id FROM teams WHERE short_name = 'TUR'),
    (SELECT id FROM teams WHERE short_name = 'CRC'),
    'scheduled', '2026-06-17T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group L'),
    (SELECT id FROM teams WHERE short_name = 'CMR'),
    (SELECT id FROM teams WHERE short_name = 'CRC'),
    'scheduled', '2026-06-18T21:00:00Z'),

  -- Group M  (Jun 17–19)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group M'),
    (SELECT id FROM teams WHERE short_name = 'IRN'),
    (SELECT id FROM teams WHERE short_name = 'PAN'),
    'scheduled', '2026-06-17T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group M'),
    (SELECT id FROM teams WHERE short_name = 'IRN'),
    (SELECT id FROM teams WHERE short_name = 'JAM'),
    'scheduled', '2026-06-18T18:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group M'),
    (SELECT id FROM teams WHERE short_name = 'PAN'),
    (SELECT id FROM teams WHERE short_name = 'JAM'),
    'scheduled', '2026-06-19T18:00:00Z'),

  -- Group N  (Jun 17–19)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group N'),
    (SELECT id FROM teams WHERE short_name = 'CAN'),
    (SELECT id FROM teams WHERE short_name = 'NGA'),
    'scheduled', '2026-06-17T15:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group N'),
    (SELECT id FROM teams WHERE short_name = 'CAN'),
    (SELECT id FROM teams WHERE short_name = 'TUN'),
    'scheduled', '2026-06-18T15:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group N'),
    (SELECT id FROM teams WHERE short_name = 'NGA'),
    (SELECT id FROM teams WHERE short_name = 'TUN'),
    'scheduled', '2026-06-19T15:00:00Z'),

  -- Group O  (Jun 18–20)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group O'),
    (SELECT id FROM teams WHERE short_name = 'CHI'),
    (SELECT id FROM teams WHERE short_name = 'PAR'),
    'scheduled', '2026-06-18T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group O'),
    (SELECT id FROM teams WHERE short_name = 'CHI'),
    (SELECT id FROM teams WHERE short_name = 'RSA'),
    'scheduled', '2026-06-19T00:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group O'),
    (SELECT id FROM teams WHERE short_name = 'PAR'),
    (SELECT id FROM teams WHERE short_name = 'RSA'),
    'scheduled', '2026-06-20T00:00:00Z'),

  -- Group P  (Jun 18–20)
  ('group',
    (SELECT id FROM groups WHERE name = 'Group P'),
    (SELECT id FROM teams WHERE short_name = 'QAT'),
    (SELECT id FROM teams WHERE short_name = 'HON'),
    'scheduled', '2026-06-18T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group P'),
    (SELECT id FROM teams WHERE short_name = 'QAT'),
    (SELECT id FROM teams WHERE short_name = 'BIH'),
    'scheduled', '2026-06-19T21:00:00Z'),
  ('group',
    (SELECT id FROM groups WHERE name = 'Group P'),
    (SELECT id FROM teams WHERE short_name = 'HON'),
    (SELECT id FROM teams WHERE short_name = 'BIH'),
    'scheduled', '2026-06-20T21:00:00Z')

ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. PLAYERS (3 per team × 48 teams = 144 players)
--    1 goalkeeper + 2 outfield players per team
-- ---------------------------------------------------------------------------
INSERT INTO players (name, team_id, position) VALUES

  -- Argentina
  ('Emiliano Martínez',  (SELECT id FROM teams WHERE short_name = 'ARG'), 'goalkeeper'),
  ('Lionel Messi',       (SELECT id FROM teams WHERE short_name = 'ARG'), 'forward'),
  ('Julián Álvarez',     (SELECT id FROM teams WHERE short_name = 'ARG'), 'forward'),

  -- United States
  ('Matt Turner',        (SELECT id FROM teams WHERE short_name = 'USA'), 'goalkeeper'),
  ('Christian Pulisic',  (SELECT id FROM teams WHERE short_name = 'USA'), 'midfielder'),
  ('Folarin Balogun',    (SELECT id FROM teams WHERE short_name = 'USA'), 'forward'),

  -- Slovenia
  ('Jan Oblak',          (SELECT id FROM teams WHERE short_name = 'SVN'), 'goalkeeper'),
  ('Benjamin Šeško',     (SELECT id FROM teams WHERE short_name = 'SVN'), 'forward'),
  ('Josip Iličič',       (SELECT id FROM teams WHERE short_name = 'SVN'), 'midfielder'),

  -- Spain
  ('David Raya',         (SELECT id FROM teams WHERE short_name = 'ESP'), 'goalkeeper'),
  ('Pedri',              (SELECT id FROM teams WHERE short_name = 'ESP'), 'midfielder'),
  ('Lamine Yamal',       (SELECT id FROM teams WHERE short_name = 'ESP'), 'forward'),

  -- Morocco
  ('Yassine Bounou',     (SELECT id FROM teams WHERE short_name = 'MAR'), 'goalkeeper'),
  ('Achraf Hakimi',      (SELECT id FROM teams WHERE short_name = 'MAR'), 'defender'),
  ('Hakim Ziyech',       (SELECT id FROM teams WHERE short_name = 'MAR'), 'midfielder'),

  -- Azerbaijan
  ('Şahruddin Mahammadaliyev', (SELECT id FROM teams WHERE short_name = 'AZE'), 'goalkeeper'),
  ('Ramil Sheydayev',   (SELECT id FROM teams WHERE short_name = 'AZE'), 'forward'),
  ('Emin Makhmudov',    (SELECT id FROM teams WHERE short_name = 'AZE'), 'forward'),

  -- France
  ('Mike Maignan',       (SELECT id FROM teams WHERE short_name = 'FRA'), 'goalkeeper'),
  ('Kylian Mbappé',      (SELECT id FROM teams WHERE short_name = 'FRA'), 'forward'),
  ('Antoine Griezmann',  (SELECT id FROM teams WHERE short_name = 'FRA'), 'forward'),

  -- Uruguay
  ('Sergio Rochet',      (SELECT id FROM teams WHERE short_name = 'URU'), 'goalkeeper'),
  ('Darwin Núñez',       (SELECT id FROM teams WHERE short_name = 'URU'), 'forward'),
  ('Federico Valverde',  (SELECT id FROM teams WHERE short_name = 'URU'), 'midfielder'),

  -- Saudi Arabia
  ('Mohammed Al-Owais',  (SELECT id FROM teams WHERE short_name = 'KSA'), 'goalkeeper'),
  ('Saleh Al-Shehri',    (SELECT id FROM teams WHERE short_name = 'KSA'), 'forward'),
  ('Mohammed Kanno',     (SELECT id FROM teams WHERE short_name = 'KSA'), 'midfielder'),

  -- Brazil
  ('Ederson',            (SELECT id FROM teams WHERE short_name = 'BRA'), 'goalkeeper'),
  ('Vinicius Jr.',       (SELECT id FROM teams WHERE short_name = 'BRA'), 'forward'),
  ('Rodrygo',            (SELECT id FROM teams WHERE short_name = 'BRA'), 'forward'),

  -- Mexico
  ('Guillermo Ochoa',    (SELECT id FROM teams WHERE short_name = 'MEX'), 'goalkeeper'),
  ('Hirving Lozano',     (SELECT id FROM teams WHERE short_name = 'MEX'), 'forward'),
  ('Santiago Giménez',   (SELECT id FROM teams WHERE short_name = 'MEX'), 'forward'),

  -- Switzerland
  ('Yann Sommer',        (SELECT id FROM teams WHERE short_name = 'SUI'), 'goalkeeper'),
  ('Xherdan Shaqiri',    (SELECT id FROM teams WHERE short_name = 'SUI'), 'midfielder'),
  ('Granit Xhaka',       (SELECT id FROM teams WHERE short_name = 'SUI'), 'midfielder'),

  -- England
  ('Jordan Pickford',    (SELECT id FROM teams WHERE short_name = 'ENG'), 'goalkeeper'),
  ('Jude Bellingham',    (SELECT id FROM teams WHERE short_name = 'ENG'), 'midfielder'),
  ('Harry Kane',         (SELECT id FROM teams WHERE short_name = 'ENG'), 'forward'),

  -- Senegal
  ('Édouard Mendy',      (SELECT id FROM teams WHERE short_name = 'SEN'), 'goalkeeper'),
  ('Sadio Mané',         (SELECT id FROM teams WHERE short_name = 'SEN'), 'forward'),
  ('Idrissa Gueye',      (SELECT id FROM teams WHERE short_name = 'SEN'), 'midfielder'),

  -- Ecuador
  ('Alexander Domínguez', (SELECT id FROM teams WHERE short_name = 'ECU'), 'goalkeeper'),
  ('Enner Valencia',     (SELECT id FROM teams WHERE short_name = 'ECU'), 'forward'),
  ('Moisés Caicedo',     (SELECT id FROM teams WHERE short_name = 'ECU'), 'midfielder'),

  -- Portugal
  ('Diogo Costa',        (SELECT id FROM teams WHERE short_name = 'POR'), 'goalkeeper'),
  ('Cristiano Ronaldo',  (SELECT id FROM teams WHERE short_name = 'POR'), 'forward'),
  ('Bruno Fernandes',    (SELECT id FROM teams WHERE short_name = 'POR'), 'midfielder'),

  -- Poland
  ('Wojciech Szczęsny',  (SELECT id FROM teams WHERE short_name = 'POL'), 'goalkeeper'),
  ('Robert Lewandowski', (SELECT id FROM teams WHERE short_name = 'POL'), 'forward'),
  ('Piotr Zieliński',    (SELECT id FROM teams WHERE short_name = 'POL'), 'midfielder'),

  -- Ukraine
  ('Andriy Lunin',       (SELECT id FROM teams WHERE short_name = 'UKR'), 'goalkeeper'),
  ('Oleksandr Zinchenko', (SELECT id FROM teams WHERE short_name = 'UKR'), 'midfielder'),
  ('Artem Dovbyk',       (SELECT id FROM teams WHERE short_name = 'UKR'), 'forward'),

  -- Germany
  ('Manuel Neuer',       (SELECT id FROM teams WHERE short_name = 'GER'), 'goalkeeper'),
  ('Florian Wirtz',      (SELECT id FROM teams WHERE short_name = 'GER'), 'midfielder'),
  ('Kai Havertz',        (SELECT id FROM teams WHERE short_name = 'GER'), 'forward'),

  -- Japan
  ('Shuichi Gonda',      (SELECT id FROM teams WHERE short_name = 'JPN'), 'goalkeeper'),
  ('Takumi Minamino',    (SELECT id FROM teams WHERE short_name = 'JPN'), 'forward'),
  ('Wataru Endo',        (SELECT id FROM teams WHERE short_name = 'JPN'), 'midfielder'),

  -- New Zealand
  ('Oliver Sail',        (SELECT id FROM teams WHERE short_name = 'NZL'), 'goalkeeper'),
  ('Chris Wood',         (SELECT id FROM teams WHERE short_name = 'NZL'), 'forward'),
  ('Clayton Lewis',      (SELECT id FROM teams WHERE short_name = 'NZL'), 'midfielder'),

  -- Netherlands
  ('Bart Verbruggen',    (SELECT id FROM teams WHERE short_name = 'NED'), 'goalkeeper'),
  ('Virgil van Dijk',    (SELECT id FROM teams WHERE short_name = 'NED'), 'defender'),
  ('Cody Gakpo',         (SELECT id FROM teams WHERE short_name = 'NED'), 'forward'),

  -- Algeria
  ('Raïs M''Bolhi',      (SELECT id FROM teams WHERE short_name = 'ALG'), 'goalkeeper'),
  ('Riyad Mahrez',       (SELECT id FROM teams WHERE short_name = 'ALG'), 'forward'),
  ('Sofiane Feghouli',   (SELECT id FROM teams WHERE short_name = 'ALG'), 'midfielder'),

  -- South Korea
  ('Kim Seung-gyu',      (SELECT id FROM teams WHERE short_name = 'KOR'), 'goalkeeper'),
  ('Son Heung-min',      (SELECT id FROM teams WHERE short_name = 'KOR'), 'forward'),
  ('Lee Jae-sung',       (SELECT id FROM teams WHERE short_name = 'KOR'), 'midfielder'),

  -- Belgium
  ('Koen Casteels',      (SELECT id FROM teams WHERE short_name = 'BEL'), 'goalkeeper'),
  ('Kevin De Bruyne',    (SELECT id FROM teams WHERE short_name = 'BEL'), 'midfielder'),
  ('Romelu Lukaku',      (SELECT id FROM teams WHERE short_name = 'BEL'), 'forward'),

  -- Colombia
  ('Camilo Vargas',      (SELECT id FROM teams WHERE short_name = 'COL'), 'goalkeeper'),
  ('James Rodríguez',    (SELECT id FROM teams WHERE short_name = 'COL'), 'midfielder'),
  ('Luis Díaz',          (SELECT id FROM teams WHERE short_name = 'COL'), 'forward'),

  -- Egypt
  ('Mohamed El-Shenawy', (SELECT id FROM teams WHERE short_name = 'EGY'), 'goalkeeper'),
  ('Mohamed Salah',      (SELECT id FROM teams WHERE short_name = 'EGY'), 'forward'),
  ('Trezeguet',          (SELECT id FROM teams WHERE short_name = 'EGY'), 'midfielder'),

  -- Italy
  ('Gianluigi Donnarumma', (SELECT id FROM teams WHERE short_name = 'ITA'), 'goalkeeper'),
  ('Federico Chiesa',    (SELECT id FROM teams WHERE short_name = 'ITA'), 'forward'),
  ('Nicolo Barella',     (SELECT id FROM teams WHERE short_name = 'ITA'), 'midfielder'),

  -- Croatia
  ('Dominik Livaković',  (SELECT id FROM teams WHERE short_name = 'CRO'), 'goalkeeper'),
  ('Luka Modrić',        (SELECT id FROM teams WHERE short_name = 'CRO'), 'midfielder'),
  ('Ivan Perišić',       (SELECT id FROM teams WHERE short_name = 'CRO'), 'midfielder'),

  -- Albania
  ('Thomas Strakosha',   (SELECT id FROM teams WHERE short_name = 'ALB'), 'goalkeeper'),
  ('Armando Broja',      (SELECT id FROM teams WHERE short_name = 'ALB'), 'forward'),
  ('Keidi Bare',         (SELECT id FROM teams WHERE short_name = 'ALB'), 'midfielder'),

  -- Serbia
  ('Vanja Milinković-Savić', (SELECT id FROM teams WHERE short_name = 'SRB'), 'goalkeeper'),
  ('Aleksandar Mitrović', (SELECT id FROM teams WHERE short_name = 'SRB'), 'forward'),
  ('Sergej Milinković-Savić', (SELECT id FROM teams WHERE short_name = 'SRB'), 'midfielder'),

  -- Australia
  ('Mat Ryan',           (SELECT id FROM teams WHERE short_name = 'AUS'), 'goalkeeper'),
  ('Mathew Leckie',      (SELECT id FROM teams WHERE short_name = 'AUS'), 'forward'),
  ('Aaron Mooy',         (SELECT id FROM teams WHERE short_name = 'AUS'), 'midfielder'),

  -- Guatemala
  ('Nicholas Hagen',     (SELECT id FROM teams WHERE short_name = 'GUA'), 'goalkeeper'),
  ('Carlos Ruiz',        (SELECT id FROM teams WHERE short_name = 'GUA'), 'forward'),
  ('Rubio Rubín',        (SELECT id FROM teams WHERE short_name = 'GUA'), 'forward'),

  -- Turkey
  ('Uğurcan Çakır',     (SELECT id FROM teams WHERE short_name = 'TUR'), 'goalkeeper'),
  ('Hakan Çalhanoğlu',  (SELECT id FROM teams WHERE short_name = 'TUR'), 'midfielder'),
  ('Kerem Aktürkoğlu',  (SELECT id FROM teams WHERE short_name = 'TUR'), 'forward'),

  -- Cameroon
  ('André Onana',        (SELECT id FROM teams WHERE short_name = 'CMR'), 'goalkeeper'),
  ('Vincent Aboubakar',  (SELECT id FROM teams WHERE short_name = 'CMR'), 'forward'),
  ('André-Frank Zambo Anguissa', (SELECT id FROM teams WHERE short_name = 'CMR'), 'midfielder'),

  -- Costa Rica
  ('Keylor Navas',       (SELECT id FROM teams WHERE short_name = 'CRC'), 'goalkeeper'),
  ('Bryan Ruiz',         (SELECT id FROM teams WHERE short_name = 'CRC'), 'midfielder'),
  ('Joel Campbell',      (SELECT id FROM teams WHERE short_name = 'CRC'), 'forward'),

  -- Iran
  ('Alireza Beiranvand', (SELECT id FROM teams WHERE short_name = 'IRN'), 'goalkeeper'),
  ('Sardar Azmoun',      (SELECT id FROM teams WHERE short_name = 'IRN'), 'forward'),
  ('Mehdi Taremi',       (SELECT id FROM teams WHERE short_name = 'IRN'), 'forward'),

  -- Panama
  ('Luis Mejía',         (SELECT id FROM teams WHERE short_name = 'PAN'), 'goalkeeper'),
  ('Ismael Díaz',        (SELECT id FROM teams WHERE short_name = 'PAN'), 'forward'),
  ('Adalberto Carrasquilla', (SELECT id FROM teams WHERE short_name = 'PAN'), 'midfielder'),

  -- Jamaica
  ('Andre Blake',        (SELECT id FROM teams WHERE short_name = 'JAM'), 'goalkeeper'),
  ('Michail Antonio',    (SELECT id FROM teams WHERE short_name = 'JAM'), 'forward'),
  ('Bobby Reid',         (SELECT id FROM teams WHERE short_name = 'JAM'), 'midfielder'),

  -- Canada
  ('Maxime Crépeau',     (SELECT id FROM teams WHERE short_name = 'CAN'), 'goalkeeper'),
  ('Alphonso Davies',    (SELECT id FROM teams WHERE short_name = 'CAN'), 'defender'),
  ('Jonathan David',     (SELECT id FROM teams WHERE short_name = 'CAN'), 'forward'),

  -- Nigeria
  ('Francis Uzoho',      (SELECT id FROM teams WHERE short_name = 'NGA'), 'goalkeeper'),
  ('Victor Osimhen',     (SELECT id FROM teams WHERE short_name = 'NGA'), 'forward'),
  ('Wilfred Ndidi',      (SELECT id FROM teams WHERE short_name = 'NGA'), 'midfielder'),

  -- Tunisia
  ('Aymen Dahmen',       (SELECT id FROM teams WHERE short_name = 'TUN'), 'goalkeeper'),
  ('Wahbi Khazri',       (SELECT id FROM teams WHERE short_name = 'TUN'), 'forward'),
  ('Hannibal Mejbri',    (SELECT id FROM teams WHERE short_name = 'TUN'), 'midfielder'),

  -- Chile
  ('Claudio Bravo',      (SELECT id FROM teams WHERE short_name = 'CHI'), 'goalkeeper'),
  ('Alexis Sánchez',     (SELECT id FROM teams WHERE short_name = 'CHI'), 'forward'),
  ('Arturo Vidal',       (SELECT id FROM teams WHERE short_name = 'CHI'), 'midfielder'),

  -- Paraguay
  ('Antony Silva',       (SELECT id FROM teams WHERE short_name = 'PAR'), 'goalkeeper'),
  ('Miguel Almirón',     (SELECT id FROM teams WHERE short_name = 'PAR'), 'midfielder'),
  ('Antonio Sanabria',   (SELECT id FROM teams WHERE short_name = 'PAR'), 'forward'),

  -- South Africa
  ('Ronwen Williams',    (SELECT id FROM teams WHERE short_name = 'RSA'), 'goalkeeper'),
  ('Percy Tau',          (SELECT id FROM teams WHERE short_name = 'RSA'), 'forward'),
  ('Themba Zwane',       (SELECT id FROM teams WHERE short_name = 'RSA'), 'midfielder'),

  -- Qatar
  ('Meshaal Barsham',    (SELECT id FROM teams WHERE short_name = 'QAT'), 'goalkeeper'),
  ('Akram Afif',         (SELECT id FROM teams WHERE short_name = 'QAT'), 'forward'),
  ('Almoez Ali',         (SELECT id FROM teams WHERE short_name = 'QAT'), 'forward'),

  -- Honduras
  ('Luis López',         (SELECT id FROM teams WHERE short_name = 'HON'), 'goalkeeper'),
  ('Alberth Elis',       (SELECT id FROM teams WHERE short_name = 'HON'), 'forward'),
  ('Romell Quioto',      (SELECT id FROM teams WHERE short_name = 'HON'), 'forward'),

  -- Bosnia & Herzegovina
  ('Ibrahim Šehić',      (SELECT id FROM teams WHERE short_name = 'BIH'), 'goalkeeper'),
  ('Edin Džeko',         (SELECT id FROM teams WHERE short_name = 'BIH'), 'forward'),
  ('Miralem Pjanić',     (SELECT id FROM teams WHERE short_name = 'BIH'), 'midfielder')

ON CONFLICT DO NOTHING;
