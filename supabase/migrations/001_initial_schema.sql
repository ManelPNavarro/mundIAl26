-- Enable UUID extension
-- uuid-ossp not needed; using gen_random_uuid() (built-in since Postgres 13)

-- Create enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE match_phase AS ENUM ('group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'third_place', 'final');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished');
CREATE TYPE player_position AS ENUM ('goalkeeper', 'defender', 'midfielder', 'forward');

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Groups table (16 groups: A–P)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  flag_url TEXT,
  group_id UUID REFERENCES groups(id),
  api_id INTEGER UNIQUE
);

CREATE INDEX idx_teams_group_id ON teams(group_id);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id INTEGER UNIQUE,
  phase match_phase NOT NULL,
  group_id UUID REFERENCES groups(id),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  home_score INTEGER,
  away_score INTEGER,
  status match_status NOT NULL DEFAULT 'scheduled',
  match_date TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_matches_phase ON matches(phase);
CREATE INDEX idx_matches_group_id ON matches(group_id);
CREATE INDEX idx_matches_home_team ON matches(home_team_id);
CREATE INDEX idx_matches_away_team ON matches(away_team_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id),
  position player_position NOT NULL,
  api_id INTEGER
);

CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_position ON players(position);

-- Predictions table (one per user)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  tournament_winner_team_id UUID REFERENCES teams(id),
  mvp_player_id UUID REFERENCES players(id),
  top_scorer_player_id UUID REFERENCES players(id),
  best_goalkeeper_player_id UUID REFERENCES players(id)
);

CREATE INDEX idx_predictions_user_id ON predictions(user_id);

-- Match predictions
CREATE TABLE match_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id),
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  UNIQUE(prediction_id, match_id)
);

CREATE INDEX idx_match_predictions_prediction_id ON match_predictions(prediction_id);
CREATE INDEX idx_match_predictions_match_id ON match_predictions(match_id);

-- Group predictions
CREATE TABLE group_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id),
  first_team_id UUID NOT NULL REFERENCES teams(id),
  second_team_id UUID NOT NULL REFERENCES teams(id),
  third_team_id UUID NOT NULL REFERENCES teams(id),
  UNIQUE(prediction_id, group_id)
);

CREATE INDEX idx_group_predictions_prediction_id ON group_predictions(prediction_id);

-- Scoring rules
CREATE TABLE scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL,
  label TEXT NOT NULL
);

-- Scores (cached, recalculable)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  breakdown JSONB NOT NULL DEFAULT '{}',
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_total_points ON scores(total_points DESC);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert during registration" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies: teams, groups, matches, players (public read)
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Admins manage teams" ON teams FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Admins manage groups" ON groups FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Admins manage matches" ON matches FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Admins manage players" ON players FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies: predictions
CREATE POLICY "Users manage own predictions" ON predictions
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users manage own match predictions" ON match_predictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM predictions p WHERE p.id = prediction_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users manage own group predictions" ON group_predictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM predictions p WHERE p.id = prediction_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: scoring_rules, settings (public read, admin write)
CREATE POLICY "Public read scoring rules" ON scoring_rules FOR SELECT USING (true);
CREATE POLICY "Admins manage scoring rules" ON scoring_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON settings FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies: scores (public read)
CREATE POLICY "Public read scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Service role manages scores" ON scores FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
