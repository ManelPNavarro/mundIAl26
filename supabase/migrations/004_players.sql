CREATE TABLE players (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id    INTEGER UNIQUE,
  name           TEXT NOT NULL,
  team_id        UUID REFERENCES teams(id) ON DELETE CASCADE,
  position       TEXT,
  nationality    TEXT,
  date_of_birth  DATE,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX players_team_id_idx ON players(team_id);
CREATE INDEX players_name_idx ON players(name);
