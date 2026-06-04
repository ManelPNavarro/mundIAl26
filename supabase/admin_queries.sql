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


