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
