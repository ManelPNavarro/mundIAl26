CREATE TABLE round_locks (
  round    TEXT PRIMARY KEY CHECK (round IN ('GROUP','R32','R16','QF','SF','THIRD_PLACE','FINAL')),
  is_open  BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO round_locks (round, is_open) VALUES
  ('GROUP',       true),
  ('R32',         false),
  ('R16',         false),
  ('QF',          false),
  ('SF',          false),
  ('THIRD_PLACE', false),
  ('FINAL',       false);

ALTER TABLE round_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read round_locks"
  ON round_locks FOR SELECT USING (true);
