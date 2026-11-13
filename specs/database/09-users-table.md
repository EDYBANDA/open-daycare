# SPEC 09 — Tabla `users`, enums y provisioning de perfil

> **Estado:** Aprobado
> **Depende de:** SPEC 08 (tabla `daycares` sembrada + patrón de migraciones MCP/espejo)
> **Fecha:** 2026-11-13
> **Objetivo:** Crear la tabla `public.users` con sus enums `user_role`/`user_status`, el trigger de provisioning sobre `auth.users` y RLS scoped por guardería, dejando sembrado el usuario staff de prueba Caro Giménez en Sala Soles.

## Scope

**In:**

- Migración `create_users` vía MCP `apply_migration`:
  - Enums `public.user_role` (`staff`, `parent`, `admin`) y `public.user_status` (`pending`, `active`), valores exactos de `07-DB-Schema`.
  - Tabla `public.users` con 10 columnas: `id`, `daycare_id`, `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at`, `updated_at`.
  - FK `id` → `auth.users(id) ON DELETE CASCADE` (mismo UUID que Supabase Auth); FK `daycare_id` → `daycares(id)` nullable, sin ON DELETE explícito (NO ACTION).
  - Índice `users_daycare_id_idx` sobre `daycare_id`.
  - Trigger `users_set_updated_at` `BEFORE UPDATE` reutilizando `public.set_updated_at()` (SPEC 08).
  - Función `public.handle_new_user()` (plpgsql, `security definer set search_path = ''`) + trigger `on_auth_user_created` `AFTER INSERT ON auth.users`: crea la fila de perfil tomando **solo** `full_name` de `raw_user_meta_data` (fallback `''`); `role` siempre nace `'parent'`, `daycare_id` NULL.
  - Helper `public.current_daycare_id()` (sql, `stable`, `security definer set search_path = ''`) con `revoke execute from public, anon` y `grant execute to authenticated`.
  - RLS habilitado con una única política: `users_select_self_or_same_daycare` — `for select to authenticated using (id = (select auth.uid()) or daycare_id = public.current_daycare_id())`. Sin políticas de INSERT/UPDATE/DELETE.
  - `GRANT SELECT ON public.users TO authenticated` solo si el Data API del proyecto lo exige (mismo criterio que SPEC 08).
- Paso manual del usuario: crear el auth user en el dashboard (Authentication → Users → Add user): `caro@opendaycare.com`, contraseña elegida por el usuario (no queda en el repo), con auto-confirm.
- Migración `seed_staff_user` (aparte de la DDL): `UPDATE` de la fila de Caro → `role='staff'`, `full_name='Caro Giménez'`, `daycare_id` = UUID fijo de Sala Soles (`c0a80101-0000-4000-8000-000000000001`).
- Espejo de ambas migraciones en `supabase/migrations/<version>_<name>.sql` con `<version>` copiado del historial real.
- Verificación final: advisors de seguridad, smoke test de la policy RLS y estado final de la fila de Caro.

**Out of scope (para futuras specs):**

- Resto de tablas del modelo (`rooms`, `children`, `parent_children`, `invitations`, `posts`, …) — cada una en su propia spec.
- Integración del cliente Supabase en la app Next.js (login real, sesiones, protección de rutas).
- Flujo de invitación/activación de padres y asignación de guardería para parents (requerirá UPDATE privilegiado o flujo con invitations).
- Políticas de escritura (UPDATE de perfil propio, avatars, preferencias de notificación).
- Usuarios seed adicionales (parents) y rol `admin` en uso.

## Modelo de datos

```sql
-- Migración 1: create_users
create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create table public.users (
  id                    uuid primary key references auth.users (id) on delete cascade,
  daycare_id            uuid references public.daycares (id),
  role                  public.user_role   not null default 'parent',
  status                public.user_status not null default 'active',
  full_name             text               not null default '',
  avatar_url            text,
  notify_on_post        boolean            not null default true,
  daily_summary_enabled boolean            not null default true,
  created_at            timestamptz        not null default now(),
  updated_at            timestamptz        not null default now()
);

create index users_daycare_id_idx on public.users (daycare_id);

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Helper: la policy no puede hacer subquery directo sobre la misma tabla
-- (error "infinite recursion detected in policy for relation users")
create function public.current_daycare_id()
returns uuid
language sql
stable
security definer set search_path = ''
as $$
  select daycare_id from public.users where id = (select auth.uid())
$$;

revoke execute on function public.current_daycare_id() from public, anon;
grant  execute on function public.current_daycare_id() to authenticated;

alter table public.users enable row level security;

create policy "users_select_self_or_same_daycare"
  on public.users
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or daycare_id = public.current_daycare_id()
  );
```

```sql
-- Migración 2: seed_staff_user (después de crear el auth user en el dashboard)
update public.users as u
set role       = 'staff',
    full_name  = 'Caro Giménez',
    daycare_id = 'c0a80101-0000-4000-8000-000000000001'  -- Guardería Sala Soles
from auth.users as a
where u.id = a.id
  and lower(a.email) = 'caro@opendaycare.com';
```

- No se guarda `email` ni contraseña en `public.users`: viven en `auth.users` (referencia + doc oficial).
- `handle_new_user` es trigger function (no invocable directamente), por eso no necesita revokes; `current_daycare_id` sí queda endurecida con revokes porque es callable.

## Plan de implementación

1. Aplicar migración `create_users` vía `supabase_apply_migration`. Verificar: tabla con exactamente 10 columnas, enums con sus valores, FKs e índice presentes, trigger `on_auth_user_created` en `auth.users`, RLS activo con 1 política, helper con revokes aplicados.
2. Espejar en `supabase/migrations/<version>_create_users.sql` (versión copiada de `supabase_list_migrations`).
3. **Paso manual (usuario):** crear en el dashboard el auth user `caro@opendaycare.com` con contraseña propia y auto-confirm. Verificar vía `execute_sql` que el trigger creó la fila: `role='parent'`, `status='active'`, `full_name=''`, `daycare_id` NULL.
4. Aplicar migración `seed_staff_user`. Verificar: la fila de Caro queda `staff` / `Caro Giménez` / Sala Soles, y `updated_at` > `created_at` (prueba de `users_set_updated_at`). Espejar en `supabase/migrations/<version>_seed_staff_user.sql`.
5. Verificación final: `supabase_get_advisors` (security + performance) sin findings nuevos atribuibles; smoke test RLS simulando sesión de Caro (`set role authenticated` + `set_config('request.jwt.claims', …)`) — `select * from public.users` debe devolver solo su fila (si `execute_sql` no acepta el bloque transaccional, queda como prueba pendiente de la spec de integración, documentado).

## Criterios de aceptación

- [ ] `create_users` figura en el historial; `public.users` existe con exactamente las 10 columnas y los enums `user_role` (`staff`,`parent`,`admin`) y `user_status` (`pending`,`active`) están creados.
- [ ] `id` referencia `auth.users` ON DELETE CASCADE; `daycare_id` es nullable y referencia `daycares` (NO ACTION); existe `users_daycare_id_idx`.
- [ ] Crear un auth user (dashboard) produce automáticamente su fila en `public.users` con `role='parent'`, `status='active'` y `full_name` desde metadata (fallback `''`) — verificado con Caro antes del UPDATE.
- [ ] RLS habilitado con una única política: SELECT `to authenticated` (self OR same daycare) vía helper `current_daycare_id()` (`security definer`, `search_path=''`, execute revocado a `public`/`anon`, concedido a `authenticated`); sin políticas de INSERT/UPDATE/DELETE.
- [ ] `seed_staff_user` figura en el historial; Caro queda `role='staff'`, `full_name='Caro Giménez'`, `daycare_id` = Sala Soles, con `updated_at > created_at`.
- [ ] Smoke test RLS: con rol `authenticated` y claims de Caro, `select * from public.users` devuelve exactamente 1 fila (la suya) — o el bloque queda documentado como pendiente si `execute_sql` no lo soporta.
- [ ] `supabase/migrations/` contiene un `.sql` por migración nueva, con prefijo de versión idéntico al historial remoto.
- [ ] Advisors sin findings nuevos atribuibles a `users`, sus funciones ni triggers.
- [ ] `app/` sin cambios: el diff solo toca `specs/` y `supabase/`.

## Decisiones

- **Sí:** trigger `on_auth_user_created` incluido ya. Elección del usuario; patrón canónico de la doc oficial, y deja el provisioning probado para los padres futuros.
- **Sí:** trigger defensivo — solo toma `full_name` de `raw_user_meta_data`; `role` nace siempre `'parent'` y `daycare_id` NULL. Elección del usuario; `raw_user_meta_data` lo controla el cliente de `signUp` (API pública), así que confiar en él para `role`/`daycare_id` permitiría auto-escalada a staff. Staff/guardería se asignan con UPDATE privilegiado (`seed_staff_user`).
- **Sí:** `daycare_id` nullable. Elección del usuario; compatible con el alta antes de asignación y con un futuro admin global. FK a `daycares` sin ON DELETE (NO ACTION): no se borra una guardería con usuarios.
- **Sí:** RLS scoped por guardería (self OR same daycare) vía helper `SECURITY DEFINER`. Elección del usuario; un subquery directo sobre `users` dentro de la policy lanza _infinite recursion detected in policy_; el helper la evita y solo expone la guardería propia del llamador.
- **Sí:** defaults `role='parent'`, `status='active'` (referencia; el estado pre-signup vivirá en `invitations`), flags de notificación `true`, `full_name not null default ''`.
- **Sí:** reutilizar `public.set_updated_at()` de SPEC 08 y el índice sobre `daycare_id` (patrón FK + consulta "usuarios de una guardería").
- **Sí:** staff user vía dashboard + migración `seed_staff_user` (match por email). Elección del usuario; la contraseña nunca entra al repo; el UPDATE sí queda versionado en el historial.
- **No:** email/contraseña en `public.users` — Supabase los gestiona en `auth.users`.
- **No:** autorización vía claims JWT (`app_metadata`) — asignación post-signup y JWT no siempre fresco.
- **No:** políticas de escritura ni CRUD vía Data API en esta etapa.
- **No:** seeds de parents, flujo de invitations o admin — specs futuras.

## Riesgos

| Riesgo                                                                                | Mitigación                                                                                                  |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Un trigger que falla sobre `auth.users` bloquea los signups (aviso de la doc oficial) | Función mínima (un INSERT con defaults); probada en el paso 3 con el usuario real antes de cerrar la spec   |
| SignUp público (anon key) crea filas parent con `full_name` arbitrario                | Aceptado para demo; `role`/`daycare_id` nunca vienen de metadata. Futuro: email confirmation / invitaciones |
| Recursión RLS si alguien "simplifica" la policy con subquery directo                  | Helper `current_daycare_id()` documentado en la spec y en comentario del SQL                                |
| Objeto en `auth.users` (trigger) es superficie sensible a cambios de Supabase         | Patrón canónico de la doc oficial; re-verificar tras upgrades de plataforma                                 |
| Data API exige GRANTs explícitos                                                      | Mismo procedimiento que SPEC 08: probar acceso y aplicar `GRANT SELECT` documentado                         |

## Lo que **no** está en esta spec

- Resto de tablas del modelo (`rooms`, `children`, `invitations`, `posts`, …), cliente Supabase en la app, login real, flujo de padres, políticas de escritura, más usuarios seed.

Cada una de esas, si llega, va en su propia spec.
