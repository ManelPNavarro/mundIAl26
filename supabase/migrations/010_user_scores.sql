CREATE TABLE user_scores (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own score" ON user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all scores" ON user_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );
