CREATE TABLE user_prediction_counts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  count   INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
);

ALTER TABLE user_prediction_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all prediction counts"
  ON user_prediction_counts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Trigger function: keep count in sync on insert/delete
CREATE OR REPLACE FUNCTION sync_prediction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_prediction_counts (user_id, count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
      SET count = user_prediction_counts.count + 1;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_prediction_counts
    SET count = count - 1
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER predictions_count_sync
  AFTER INSERT OR DELETE ON predictions
  FOR EACH ROW EXECUTE FUNCTION sync_prediction_count();

-- Backfill from existing rows
INSERT INTO user_prediction_counts (user_id, count)
SELECT user_id, COUNT(*)
FROM predictions
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE
  SET count = EXCLUDED.count;
