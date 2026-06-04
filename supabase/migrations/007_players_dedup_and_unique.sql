-- Remove players not linked to any team (orphaned rows from failed syncs)
DELETE FROM players WHERE team_id IS NULL;

-- For each (name, team_id) duplicate group, keep the most complete row:
-- prefer rows with external_id, then with position, then most recently updated
DELETE FROM players
WHERE id NOT IN (
  SELECT DISTINCT ON (name, team_id) id
  FROM players
  ORDER BY name, team_id,
    (external_id IS NOT NULL) DESC,
    (position IS NOT NULL) DESC,
    updated_at DESC
);

-- Prevent duplicates from recurring
ALTER TABLE players ADD CONSTRAINT players_name_team_id_unique UNIQUE (name, team_id);
