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

-- Count predicted matches per user
SELECT
  u.email,
  COUNT(*) AS predicted_matches
FROM predictions p
JOIN auth.users u ON u.id = p.user_id
GROUP BY u.email
ORDER BY predicted_matches DESC;

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


