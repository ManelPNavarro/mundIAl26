-- Migration 004: Multi-competition architecture
-- Adds competitions, user_competitions, sync_logs tables
-- Adds competition_id to all competition-scoped tables

-- New enums
CREATE TYPE competition_status AS ENUM ('upcoming', 'active', 'finished');
CREATE TYPE sync_log_status AS ENUM ('running', 'success', 'error');
CREATE TYPE sync_trigger AS ENUM ('cron', 'manual');

-- Competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  api_competition_code TEXT NOT NULL,
  status competition_status NOT NULL DEFAULT 'upcoming',
  season TEXT NOT NULL,
  logo_url TEXT,
  predictions_deadline TIMESTAMPTZ NOT NULL DEFAULT '2026-06-10T23:59:59Z',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User <-> Competition junction
CREATE TABLE user_competitions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, competition_id)
);

-- Sync logs
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status sync_log_status NOT NULL DEFAULT 'running',
  matches_updated INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  triggered_by sync_trigger NOT NULL DEFAULT 'cron'
);

CREATE INDEX idx_sync_logs_competition_id ON sync_logs(competition_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- Add competition_id to existing tables
ALTER TABLE groups ADD COLUMN competition_id UUID REFERENCES competitions(id);
ALTER TABLE teams ADD COLUMN competition_id UUID REFERENCES competitions(id);
ALTER TABLE players ADD COLUMN competition_id UUID REFERENCES competitions(id);
ALTER TABLE matches ADD COLUMN competition_id UUID REFERENCES competitions(id);
ALTER TABLE predictions ADD COLUMN competition_id UUID REFERENCES competitions(id);
ALTER TABLE scores ADD COLUMN competition_id UUID REFERENCES competitions(id);
ALTER TABLE scoring_rules ADD COLUMN competition_id UUID REFERENCES competitions(id);

-- Add indexes
CREATE INDEX idx_groups_competition_id ON groups(competition_id);
CREATE INDEX idx_teams_competition_id ON teams(competition_id);
CREATE INDEX idx_players_competition_id ON players(competition_id);
CREATE INDEX idx_matches_competition_id ON matches(competition_id);
CREATE INDEX idx_predictions_competition_id ON predictions(competition_id);
CREATE INDEX idx_scores_competition_id ON scores(competition_id);
CREATE INDEX idx_scoring_rules_competition_id ON scoring_rules(competition_id);
CREATE INDEX idx_user_competitions_competition_id ON user_competitions(competition_id);

-- Seed World Cup 2026 competition
INSERT INTO competitions (name, slug, api_competition_code, status, season, predictions_deadline)
VALUES ('World Cup 2026', 'wc2026', 'WC', 'upcoming', '2026', '2026-06-10T23:59:59Z');

-- RLS for new tables
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Competitions: all authenticated users can read; only admins write
CREATE POLICY "Authenticated users can read competitions" ON competitions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage competitions" ON competitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- User competitions: users see their own; admins see all
CREATE POLICY "Users can see own competitions" ON user_competitions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage user_competitions" ON user_competitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Users can join competitions" ON user_competitions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Sync logs: admins only
CREATE POLICY "Admins read sync logs" ON sync_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Service role manages sync logs" ON sync_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
