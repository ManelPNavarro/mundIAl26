CREATE OR REPLACE FUNCTION recalculate_user_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_scores (user_id, match_points, updated_at)
  SELECT user_id, SUM(points)::int, now()
  FROM user_match_points
  GROUP BY user_id
  ON CONFLICT (user_id) DO UPDATE
    SET match_points = EXCLUDED.match_points,
        updated_at = now();

  UPDATE user_scores
  SET match_points = 0, updated_at = now()
  WHERE user_id NOT IN (SELECT DISTINCT user_id FROM user_match_points);
END;
$$;
