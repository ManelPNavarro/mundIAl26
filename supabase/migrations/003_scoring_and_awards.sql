-- Scoring configuration (singleton row)
CREATE TABLE scoring_config (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Match result points per round
  group_correct           INTEGER NOT NULL DEFAULT 1,
  group_exact             INTEGER NOT NULL DEFAULT 3,
  r32_correct             INTEGER NOT NULL DEFAULT 2,
  r32_exact               INTEGER NOT NULL DEFAULT 5,
  r16_correct             INTEGER NOT NULL DEFAULT 3,
  r16_exact               INTEGER NOT NULL DEFAULT 6,
  qf_correct              INTEGER NOT NULL DEFAULT 4,
  qf_exact                INTEGER NOT NULL DEFAULT 8,
  sf_correct              INTEGER NOT NULL DEFAULT 5,
  sf_exact                INTEGER NOT NULL DEFAULT 10,
  third_place_correct     INTEGER NOT NULL DEFAULT 5,
  third_place_exact       INTEGER NOT NULL DEFAULT 10,
  final_correct           INTEGER NOT NULL DEFAULT 6,
  final_exact             INTEGER NOT NULL DEFAULT 12,
  -- Tournament awards
  award_winner            INTEGER NOT NULL DEFAULT 25,
  award_best_player       INTEGER NOT NULL DEFAULT 10,
  award_best_young_player INTEGER NOT NULL DEFAULT 8,
  award_top_scorer        INTEGER NOT NULL DEFAULT 10,
  award_best_goalkeeper   INTEGER NOT NULL DEFAULT 8,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO scoring_config DEFAULT VALUES;

-- Side bets — one row per user (their guesses, free text for players)
CREATE TABLE side_bets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  winner_team_id        UUID REFERENCES teams(id),
  best_player           TEXT,
  best_young_player     TEXT,
  top_scorer            TEXT,
  best_goalkeeper       TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE side_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own side bets"
  ON side_bets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Official awards — singleton, filled by admin
CREATE TABLE official_awards (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_team_id        UUID REFERENCES teams(id),
  best_player           TEXT,
  best_young_player     TEXT,
  top_scorer            TEXT,
  best_goalkeeper       TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO official_awards DEFAULT VALUES;
