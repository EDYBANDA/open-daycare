<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — dev server at http://localhost:3000 (Turbopack is the default bundler for dev and build in Next 16).
- `npm run lint` — ESLint flat config (`eslint.config.mjs`), lints the whole repo.
- `npm run build` — production build.
- No test infrastructure exists. Verify changes with `lint` + `build` + the dev server.

Known issue: `npm run lint` fails with 2 pre-existing errors in `references/pantallas/support.js` (a generated, vendored file — do not edit or fix it). Judge your changes by "no new errors", not by a clean exit.

## Stack quirks (verified against next@16.4.5)

- App Router in `app/`; path alias `@/*` maps to the repo root (no `src/`).
- `cacheComponents: true` + `partialPrefetching: true` in `next.config.ts` — the Cache Components model is ON:
  - Route segment configs (`export const dynamic`, `revalidate`, `fetchCache`) are not available; use `use cache`, `cacheLife`, `cacheTag`, and `io()` (preferred over `connection()`).
  - Uncached request-time data must sit inside a `<Suspense>` boundary or the build fails with blocking validation errors.
  - Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` before writing any data fetching.
- Tailwind 4 is wired through Turbopack rules (`@tailwindcss/turbopack` in `next.config.ts`). There is no PostCSS config and none is needed — do not add one.
- `experimental.agentFeedback: true` — on blocking dev-overlay errors, use the labeled fixes and their "Copy prompt" output; they contain the canonical Next 16 pattern.

## Architecture

- The Next.js app is still the create-next-app scaffold; all app code lives in `app/` (single route `/` so far).
- `references/` is design input, NOT app code and not part of the build:
  - `references/pantallas/*.dc.html` — Spanish screen mockups for the daycare app (login, feed, niños, crear-publicación, resumen-día, …) rendered by the vendored `support.js` runtime.
  - `references/screenshots/*.png` — captures of those screens.
  - Build the real UI in `app/` to match these references; UI copy is Spanish.

## Spec workflow

- Repo-local skills drive feature work: `/spec` (`.agents/skills/spec`), `/spec-impl` (`.agents/skills/spec-impl`) and `/spec-verify` (`.opencode/command/spec-verify.md`).
- `/spec` writes `specs/NN-slug.md` with state `Draft`; only the user flips it to `Approved`.
- Cualquier spec relacionada con la base de datos (tablas, esquema, RLS, migraciones, etc.) debe crearse en `specs/database/` (ej. `specs/database/NN-slug.md`).
- `/spec-impl` requires an Approved spec, then creates and switches to a `spec-NN-slug` branch (`specs/.spec-config.yml` defaults `AutoCreateBranch: true`).
- `/spec-verify` runs the `spec-verifier` agent (`.opencode/agent/spec-verifier.md`): verifies each Acceptance criteria item, fixes minor issues, re-verifies, and marks passing checks in the spec file.

## MCPs

- Playwright: screenshots y cualquier cosa relacionada con Playwright tienen que estar en la carpeta `.playwright-mcp`.
- Context7: usar este MCP para traer la documentación actualizada del framework.
- Supabase: herramientas MCP conectadas al proyecto (SQL, migraciones, logs, advisors, edge functions, etc.).

## Supabase

- Usar el MCP de Supabase para consultar/esquema/migraciones; inspeccionar las tablas existentes antes de cambiar el esquema.
- Al depurar, revisar primero logs y advisors (seguridad/rendimiento) antes de hacer cambios.
- Skills repo-local: `supabase` (`.agents/skills/supabase`) y `supabase-postgres-best-practices` (`.agents/skills/supabase-postgres-best-practices`) — cargarlas SIEMPRE antes de escribir o modificar algo en la base de datos (tablas, columnas, RLS, índices, triggers, migraciones, SQL).
- Referencia de esquema (no implementado aún): `07-DB-Schema` (referencia de proyecto) — tablas, columnas y relaciones previstas.

## Spec Driven Development - Skills

-/spec Usaremos esta habilidad para crear las especificaciones.
-/spec-impl Usaremos esta skill para hacer las implementaciones.
-/spec-verify Usaremos este comando para verificar los criterios de aceptación de una spec con el agente spec-verifier.

## Skills de Supabase

-/supabase Cualquier tarea que involucre Supabase (Database, Auth, Edge Functions, Realtime, Storage, RLS, migraciones, debugging).
-/supabase-postgres-best-practices Cargar antes de escribir o cambiar algo en Postgres: esquema, RLS, índices, funciones, migraciones, rendimiento.

## Reglas de código

- Usar código limpio, nombres, funciones, variables, etc. en inglés.
