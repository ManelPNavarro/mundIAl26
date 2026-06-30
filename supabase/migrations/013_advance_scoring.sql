-- Partial-credit tier for knockout matches: you missed the win/draw outcome but
-- correctly picked the team that advances to the next round.
ALTER TABLE scoring_config
  ADD COLUMN r32_advance INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN r16_advance INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN qf_advance  INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN sf_advance  INTEGER NOT NULL DEFAULT 1;
