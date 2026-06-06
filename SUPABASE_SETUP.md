# Configuración Final en Supabase Dashboard

Este documento guía los pasos finales necesarios en Supabase Dashboard para completar el refactor User → Profile architecture.

## Paso 1: Crear la función de trigger

En Supabase Dashboard, ve a **SQL Editor** y copia-pega el siguiente SQL:

```sql
-- Función que crea el profile automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, "fullName")
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
```

Ejecuta el SQL.

## Paso 2: Crear el trigger

En el mismo SQL Editor, copia-pega:

```sql
-- Trigger que ejecuta la función cuando se crea un usuario en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Ejecuta el SQL.

## Verificación

1. **Desde la CLI local:**
   ```bash
   pnpm dev
   ```
   Inicia sesión con una cuenta de Supabase Auth existente → verifica que el sidebar muestre tu nombre correctamente.

2. **Crea un nuevo usuario (opcional):**
   - Ve a Supabase Dashboard → **Auth** → **Users**
   - Crea un nuevo usuario manualmente
   - Verifica que aparezca automáticamente en `public.profiles` tabla

3. **Build TypeScript:**
   ```bash
   pnpm build
   ```
   Debe completarse sin errores.

## Notas

- El campo `username` en Profile NO se llena automáticamente. Es opcional y el usuario debe configurarlo post-registro.
- El trigger solo copia `full_name` de `raw_user_meta_data` → `fullName` en profiles. Los demás campos (avatarUrl, bio, role, etc.) son NULL de inicio.
- Si cambias el nombre de un usuario en auth.users, necesitarás actualizar el registro de Profile manualmente o crear un trigger adicional `on_auth_user_updated`.

## Próximos pasos

- Implementar API endpoints `/api/user` y `/api/users` (actualmente faltan)
- Crear un form de "editar perfil" para que usuarios actualicen fullName, avatarUrl, username, bio
- Implementar autorización basada en roles (ADMIN vs USER) en las pages/actions
