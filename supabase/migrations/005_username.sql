-- Rename first_name + last_name → username
ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT '';

-- Backfill from existing data
UPDATE users SET username = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''));

-- Remove the temporary default
ALTER TABLE users ALTER COLUMN username DROP DEFAULT;

-- Drop old columns
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;

-- Update the trigger that auto-inserts on auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
