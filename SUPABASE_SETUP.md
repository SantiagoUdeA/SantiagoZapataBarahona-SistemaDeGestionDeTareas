# Setup de Supabase - Triggers y Configuración

Este documento describe cómo configurar los triggers de Supabase necesarios para sincronizar automáticamente los usuarios desde Supabase Auth a las tablas de la base de datos Postgres.

## Triggers Requeridos

### 1. Trigger: `on_auth_user_created`

**Propósito:** Crea automáticamente un registro en la tabla `User` y `Profile` cuando un nuevo usuario se registra en Supabase Auth.

**Proceso:**
- Cuando alguien se registra en Supabase Auth (email + password), se dispara este trigger
- Crea un registro en `public."User"` con el UUID del usuario de Auth y su email
- Crea un registro en `public."Profile"` con el nombre y avatar desde `raw_user_meta_data`
- **IMPORTANTE:** No asigna rol automáticamente. El rol debe asignarse manualmente en la tabla `User`

**Instrucciones de aplicación:**

1. Ir a **Supabase Dashboard** → **SQL Editor**
2. Ejecutar el contenido del archivo `supabase/triggers.sql`:

```sql
-- Trigger: on_auth_user_created
-- Se ejecuta al registrarse un nuevo usuario en Supabase Auth.
-- Crea automáticamente el registro en User y Profile.
-- IMPORTANTE: No asigna rol. El rol debe asignarse manualmente desde el panel de administración.

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
```

3. Presionar **RUN** o ejecutar con **Ctrl+Enter**
4. Verificar que no haya errores

**Verificación:**
- Ir a **Authentication** → **Users** en Supabase Dashboard
- Crear un usuario nuevo (o invitarlo)
- Verificar que en la tabla `User` se haya creado el registro
- Verificar que en la tabla `Profile` se haya creado el registro con nombre y avatar

## Roles y Permisos

Los roles se asignan **manualmente** después de que el usuario se registra.

**Para asignar un rol ADMIN a un usuario:**

```sql
UPDATE "User" SET role = 'ADMIN' WHERE id = '{user_uuid}';
```

Reemplazar `{user_uuid}` con el UUID del usuario.

## RLS (Row Level Security)

Por ahora, no hay políticas RLS configuradas. Si en el futuro necesitas proteger los datos por rol, considera agregar:

```sql
-- Ejemplo: usuarios normales solo ven sus propios datos
CREATE POLICY "Users can view their own profile"
ON public."Profile" FOR SELECT
USING (auth.uid() = "userId");
```

## Replicar en un nuevo proyecto

Si necesitas replicar esta configuración en un nuevo proyecto Supabase:

1. Crear un nuevo proyecto en Supabase
2. Ejecutar las migraciones de Prisma: `pnpm exec prisma migrate deploy`
3. Ejecutar el trigger SQL (pasos arriba)
4. Configurar las variables de entorno `.env.local`

## Archivos relevantes

- `supabase/triggers.sql` — SQL del trigger (fuente de verdad)
- `prisma/schema.prisma` — Schema de la BD
- `prisma/migrations/` — Historial de migraciones
- `lib/auth/guard.ts` — Funciones que leen la sesión desde DB
