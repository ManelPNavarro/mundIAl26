-- Reset all user predictions (clears every match prediction and side bet for all users)
TRUNCATE predictions, side_bets;

-- Remove award_winner column from scoring_config (run once if Equipo campeón is no longer used)
ALTER TABLE scoring_config DROP COLUMN IF EXISTS award_winner;

-- Reset all real match results entered by admin (scores, status and advances back to null/SCHEDULED)
UPDATE matches
SET home_score = NULL,
    away_score = NULL,
    home_advances = NULL,
    status = 'SCHEDULED';

-- Per-match point breakdown for a specific user (replace email below)
-- Points column: uses scoring_config values (group_exact/group_correct, r16_exact, etc.)
WITH cfg AS (SELECT * FROM scoring_config LIMIT 1)
SELECT
  m.match_no,
  m.round,
  ht.name                                    AS home_team,
  p.home_score                               AS pred_home,
  p.away_score                               AS pred_away,
  m.home_score                               AS real_home,
  m.away_score                               AS real_away,
  CASE
    WHEN p.home_score = m.home_score
     AND p.away_score = m.away_score         THEN 'EXACT'
    WHEN SIGN(p.home_score - p.away_score)
       = SIGN(m.home_score - m.away_score)   THEN 'CORRECT'
    ELSE                                          'WRONG'
  END                                        AS verdict,
  CASE
    WHEN p.home_score = m.home_score AND p.away_score = m.away_score THEN
      CASE m.round
        WHEN 'GROUP'       THEN (SELECT group_exact       FROM cfg)
        WHEN 'R16'         THEN (SELECT r16_exact         FROM cfg)
        WHEN 'QF'          THEN (SELECT qf_exact          FROM cfg)
        WHEN 'SF'          THEN (SELECT sf_exact          FROM cfg)
        WHEN 'FINAL'       THEN (SELECT final_exact       FROM cfg)
        WHEN 'THIRD_PLACE' THEN (SELECT third_place_exact FROM cfg)
        ELSE 0
      END
    WHEN SIGN(p.home_score - p.away_score)
       = SIGN(m.home_score - m.away_score) THEN
      CASE m.round
        WHEN 'GROUP'       THEN (SELECT group_correct       FROM cfg)
        WHEN 'R16'         THEN (SELECT r16_correct         FROM cfg)
        WHEN 'QF'          THEN (SELECT qf_correct          FROM cfg)
        WHEN 'SF'          THEN (SELECT sf_correct          FROM cfg)
        WHEN 'FINAL'       THEN (SELECT final_correct       FROM cfg)
        WHEN 'THIRD_PLACE' THEN (SELECT third_place_correct FROM cfg)
        ELSE 0
      END
    ELSE 0
  END                                        AS points
FROM predictions p
JOIN matches m  ON m.id = p.match_id
LEFT JOIN teams ht ON ht.id = m.home_team_id
WHERE m.home_score IS NOT NULL
  AND p.user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
ORDER BY m.match_no;

-- Count predicted matches per user
SELECT
  u.email,
  COUNT(*) AS predicted_matches
FROM predictions p
JOIN auth.users u ON u.id = p.user_id
GROUP BY u.email
ORDER BY predicted_matches DESC;

-- Group phase matches missing for a specific user (replace the email below)
SELECT
  m.match_no,
  m.group_letter,
  ht.name AS home_team,
  at.name AS away_team
FROM matches m
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
WHERE m.round = 'GROUP'
  AND NOT EXISTS (
    SELECT 1 FROM predictions p
    WHERE p.match_id = m.id
      AND p.user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
  )
ORDER BY m.match_no;

-- View all predictions for a specific user (replace the email below)
SELECT
  m.match_no,
  m.round,
  m.group_letter,
  ht.name   AS home_team,
  p.home_score,
  p.away_score,
  at.name   AS away_team,
  m.home_score  AS real_home,
  m.away_score  AS real_away
FROM predictions p
JOIN matches m  ON m.id = p.match_id
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
ORDER BY m.match_no;

-- View all users' side bet answers (player awards) alongside official results
SELECT
  u.email,
  u.raw_user_meta_data->>'name'    AS display_name,
  t.name                            AS predicted_winner,
  sb.best_player,
  sb.best_young_player,
  sb.top_scorer,
  sb.best_goalkeeper,
  ot.name                           AS official_winner,
  oa.best_player                    AS official_best_player,
  oa.best_young_player              AS official_best_young_player,
  oa.top_scorer                     AS official_top_scorer,
  oa.best_goalkeeper                AS official_best_goalkeeper
FROM side_bets sb
JOIN auth.users u ON u.id = sb.user_id
LEFT JOIN teams t  ON t.id = sb.winner_team_id
CROSS JOIN official_awards oa
LEFT JOIN teams ot ON ot.id = oa.winner_team_id
ORDER BY u.email;


