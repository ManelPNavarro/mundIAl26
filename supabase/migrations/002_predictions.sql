CREATE TABLE predictions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id       UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score     INTEGER NOT NULL CHECK (home_score >= 0),
  away_score     INTEGER NOT NULL CHECK (away_score >= 0),
  home_advances  BOOLEAN,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can read all predictions (for scoring)
CREATE POLICY "Admins can read all predictions"
  ON predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );
