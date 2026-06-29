CREATE TABLE app_settings (
  id            BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  catch_up_mode BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_settings (id) VALUES (TRUE);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_settings"
  ON app_settings FOR SELECT USING (true);
