-- Trigger: on_auth_user_created
-- Se ejecuta al registrarse un nuevo usuario en Supabase Auth.
-- Crea automáticamente el registro en User y Profile.
-- IMPORTANTE: No asigna rol. El rol debe asignarse manualmente desde el panel de administración.
--
-- Instrucciones de aplicación:
--   1. Ir a Supabase Dashboard > SQL Editor
--   2. Ejecutar este archivo completo
--   3. Para replicar en otra BD, ejecutar nuevamente en el nuevo proyecto

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, email, "createdAt", "updatedAt")
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public."Profile" ("userId", name, image, "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT ("userId") DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
