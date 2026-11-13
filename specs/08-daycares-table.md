# SPEC 08 — Tabla `daycares` y patrón de migraciones Supabase

> **Estado:** Implementado
> **Depende de:** — (primera spec de BD; las specs 01–07 son UI/localStorage)
> **Fecha:** 2026-11-13
> **Objetivo:** Crear la tabla raíz `daycares` en Supabase con su seed inicial, estableciendo el patrón de migraciones (MCP `apply_migration` + espejo en `supabase/migrations/`) que usarán todas las tablas futuras.

## Scope

**In:**

- Migración `create_daycares` aplicada vía MCP `apply_migration` al proyecto Supabase:
  - Tabla `public.daycares`: `id uuid PK default gen_random_uuid()`, `name text not null`, `address text` (nullable), `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
  - Función genérica `public.set_updated_at()` (plpgsql, `security invoker`) + trigger `daycares_set_updated_at` `BEFORE UPDATE` en `daycares`.
  - RLS habilitado en `daycares` con una única política: `daycares_select_authenticated` — `for select to authenticated using (true)`. Sin políticas de `INSERT`/`UPDATE`/`DELETE` (escritura solo vía service role/dashboard).
- Migración `seed_daycares` (aparte de la DDL) con 5 filas de UUIDs fijos, cada una con su dirección:
  1. «Guardería Sala Soles» — Av. de los Soles 123, Col. Centro
  2. «Guardería Arcoíris» — Calle Arcoíris 456, Col. Jardines
  3. «Pequeños Exploradores» — Av. Exploradores 789, Col. Bosque
  4. «Guardería Lunares» — Calle Lunares 321, Col. Estrella
  5. «Rayito de Sol» — Av. Rayito 55, Col. Amanecer
- Espejo de ambas migraciones en `supabase/migrations/<version>_<name>.sql` en el repo, con `<version>` copiado del historial real de migraciones de Supabase (formato `YYYYMMDDHHMMSS`, nombres en snake_case).
- Verificación final: advisors de seguridad + acceso a la tabla vía Data API.

**Out of scope (para futuras specs):**

- Las demás tablas del modelo de `07-DB-Schema` (`users`, `rooms`, `children`, `posts`, etc.) — cada una en su propia spec.
- Cliente Supabase en la app Next.js: `@supabase/supabase-js`, env vars, SSR — en su propia spec cuando una feature lo necesite.
- Políticas de escritura (CRUD de daycares vía Data API) y flujos de creación de guarderías.
- `config.toml` / instalación de la CLI de Supabase (no existe localmente; se integra cuando se necesite stack local).
- Limpiar las 2 migraciones de prueba del historial remoto (`create_test_table`, `drop_test_table`) — quedan ahí, solo se registran fuera del espejo.

## Modelo de datos

```sql
-- Migración 1: create_daycares
create table public.daycares (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daycares_set_updated_at
  before update on public.daycares
  for each row
  execute function public.set_updated_at();

alter table public.daycares enable row level security;

create policy "daycares_select_authenticated"
  on public.daycares
  for select
  to authenticated
  using (true);
```

```sql
-- Migración 2: seed_daycares (UUIDs fijos para FKs deterministas en seeds futuros)
insert into public.daycares (id, name, address) values
  ('c0a80101-0000-4000-8000-000000000001', 'Guardería Sala Soles',   'Av. de los Soles 123, Col. Centro'),
  ('c0a80101-0000-4000-8000-000000000002', 'Guardería Arcoíris',     'Calle Arcoíris 456, Col. Jardines'),
  ('c0a80101-0000-4000-8000-000000000003', 'Pequeños Exploradores',  'Av. Exploradores 789, Col. Bosque'),
  ('c0a80101-0000-4000-8000-000000000004', 'Guardería Lunares',      'Calle Lunares 321, Col. Estrella'),
  ('c0a80101-0000-4000-8000-000000000005', 'Rayito de Sol',          'Av. Rayito 55, Col. Amanecer');
```

- Sin índices extra: tabla raíz pequeña; el índice del PK es suficiente.
- Convención del esquema de referencia: todo lo persistido va en inglés (enums, tags); los nombres y direcciones de guarderías son datos de dominio y se guardan tal cual.

## Plan de implementación

1. Aplicar migración `create_daycares` vía `supabase_apply_migration` (DDL + función + trigger + RLS + policy). Verificar: la tabla existe con exactamente 5 columnas (`id`, `name`, `address`, `created_at`, `updated_at`), RLS activo y la policy listada en `pg_policies`.
2. Aplicar migración `seed_daycares` vía `supabase_apply_migration`. Verificar: `select count(*)` = 5 y «Guardería Sala Soles» presente con su UUID fijo.
3. Espejar en el repo: crear `supabase/migrations/<version>_create_daycares.sql` y `supabase/migrations/<version>_seed_daycares.sql` con el SQL exacto aplicado; `<version>` copiado del historial (`supabase_list_migrations`).
4. Verificación de seguridad y acceso: correr `supabase_get_advisors` (security) sin findings nuevos atribuibles a `daycares`; probar acceso vía Data API con rol `authenticated` — si el proyecto exige grants explícitos, aplicar `GRANT SELECT ON public.daycares TO authenticated` (y documentarlo dentro del SQL espejado del paso 1).

## Criterios de aceptación

- [ ] `create_daycares` figura en el historial de migraciones de Supabase y `public.daycares` existe con exactamente `id`, `name`, `address`, `created_at`, `updated_at`.
- [ ] RLS habilitado en `daycares` y existe una única política: SELECT `to authenticated using (true)`; no hay políticas de INSERT/UPDATE/DELETE.
- [ ] `public.set_updated_at()` es `security invoker` y el trigger `BEFORE UPDATE` está activo: un UPDATE de prueba cambia `updated_at` automáticamente.
- [ ] `seed_daycares` figura en el historial; `select count(*)` sobre `daycares` = 5, incluyendo «Guardería Sala Soles».
- [ ] `supabase/migrations/` contiene un archivo `.sql` por cada migración nueva, con prefijo de versión idéntico al del historial remoto y SQL coincidente.
- [ ] Advisors de seguridad sin findings nuevos atribuibles a `daycares` y la tabla es accesible vía Data API para `authenticated` (o el GRANT quedó aplicado y documentado).
- [ ] `app/` sin cambios: el diff del branch solo toca `specs/` y `supabase/`.

## Decisiones

- **Sí:** patrón de migraciones = MCP `apply_migration` + espejo de SQL en `supabase/migrations/`. Elección del usuario; da review en git y sincronía con el historial remoto sin necesitar CLI local.
- **Sí:** RLS + única política SELECT para `authenticated`. Elección del usuario; base segura mínima mientras no hay auth integrada. La escritura queda vía service role/dashboard.
- **Sí:** seed en migración aparte de la DDL. DDL y datos separados mantienen el historial limpio y permiten rollback razonable.
- **Sí:** 5 guarderías con UUIDs fijos en el seed. Elección del usuario (Sala Soles + 4); UUIDs fijos para que specs futuras (users, rooms) referencien FKs de forma determinista.
- **Sí:** `updated_at` extra a la referencia, con trigger genérico `set_updated_at()`. Elección del usuario; el patrón se reutilizará en las tablas siguientes (`users`, `children`, `posts`).
- **Sí:** `name not null` aunque la referencia no marca nullabilidad. Sanidad mínima: una guardería sin nombre no tiene sentido.
- **Sí:** campo `address text` nullable (extra a la referencia). Petición del usuario; nullable porque no todas las guarderías tienen dirección cargada al crear la fila.
- **No:** cliente Supabase en la app (env vars, supabase-js). Va en su propia spec cuando una feature necesite leer la BD.
- **No:** columnas adicionales aparte de `address` (slug, `is_active`, etc.). La referencia define la base; extras cuando una feature lo pida.
- **No:** config.toml / CLI local. No está instalada; el espejo manual en repo cubre versionado y review por ahora.
- **No:** políticas de escritura ni CRUD de daycares vía Data API en esta etapa.
- **Definición sin clarificación detallada:** los 4 nombres adicionales del seed fueron propuestos por el asistente y aceptados por el usuario («editables en la review»). Las direcciones del seed son igualmente de relleno, propuestas por el asistente y editables en la review.

## Riesgos

| Riesgo                                                               | Mitigación                                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Data API del proyecto exige GRANTs explícitos para tablas nuevas     | Paso 4: probar acceso como `authenticated` y aplicar `GRANT SELECT` si hace falta, documentado en el SQL |
| Historial remoto ya trae 2 migraciones de prueba fuera del espejo    | Registrado en out-of-scope; el espejo solo cubre migraciones nuevas desde esta spec                      |
| Desync entre espejo en repo y historial remoto                       | El prefijo `<version>` se copia del historial real tras aplicar; nunca se inventa localmente             |
| Trigger `set_updated_at` en `public` es ejecutable por cualquier rol | Es `security invoker` y solo setea un timestamp; sin riesgo de elevación de privilegios                  |

## Lo que **no** está en esta spec

- Resto de tablas del modelo (`users`, `rooms`, `children`, `posts`, etc.), integración del cliente Supabase en la app, políticas de escritura/CRUD, config.toml/CLI local, limpieza de migraciones de prueba.

Cada una de esas, si llega, va en su propia spec.
