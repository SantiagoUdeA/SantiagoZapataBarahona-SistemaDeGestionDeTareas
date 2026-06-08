-- Auto-provision a profile when a new Supabase auth user signs up.
-- New users are created as ADMIN so they can manage their own projects.
-- The init migration dropped this trigger; without it signups never get a
-- profiles row and getSession() returns null, locking the user out.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, "fullName", role, "updatedAt")
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
    'ADMIN'::public."Enum_Role",
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
