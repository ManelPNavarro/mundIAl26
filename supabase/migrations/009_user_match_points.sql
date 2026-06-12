CREATE TABLE user_match_points (
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id)    ON DELETE CASCADE,
  points   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, match_id)
);

ALTER TABLE user_match_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own match points"
  ON user_match_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all match points"
  ON user_match_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );
