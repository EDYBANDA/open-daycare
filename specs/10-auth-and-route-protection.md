# SPEC 10 — Autenticación email+password y protección de rutas

> **Estado:** Draft
> **Depende de:** SPEC 03, SPEC 09
> **Fecha:** 2026-11-25
> **Objetivo:** Implementar autenticación real email+password contra Supabase (login vía Server Action y logout real), proteger las rutas privadas redirigiendo desde `proxy.ts` y mostrar el usuario real de `public.users` en el sidebar.

## Por qué existe esta spec

SPEC 03 dejó el login como UI estática y excluyó explícitamente autenticación real y protección de rutas; SPEC 09 dejó lista la tabla `users` pero con pasos pendientes (auth user de Caro, `seed_staff_user`). Esta spec conecta la app con Supabase Auth de verdad y es la primera feature server-side bajo `cacheComponents`.

## Scope

**In:**

- **Prerrequisito (completar SPEC 09):** verificar que la BD responde por MCP (si el proyecto está pausado, el usuario lo reactiva en el dashboard); verificar si existe el auth user `caro@opendaycare.com` — si falta, paso manual del usuario en el dashboard (contraseña elegida por el usuario, auto-confirm) y verificación del trigger; aplicar migración `seed_staff_user` + espejo en `supabase/migrations/` si falta; marcar los 3 criterios pendientes de SPEC 09.
- **Login real (`/login`):**
  - `app/login/page.tsx` pasa a `"use client"` con `<form action={formAction}>` + `useActionState`: input EMAIL vacío (se elimina el `defaultValue` del mockup), ambos campos `required` (email además `type="email"`); botón «Iniciar sesión» deshabilitado con texto de carga mientras corre la action.
  - Nuevo `app/login/actions.ts` (`"use server"`):
    - `signInAction(prevState, formData)`: `createClient(await cookies())` de `utils/supabase/server.ts` → `supabase.auth.signInWithPassword({ email, password })`; error → estado `{ error: "Email o contraseña incorrectos." }`; éxito → `revalidatePath("/", "layout")` + `redirect("/")` (redirect fuera de try/catch).
    - `signOutAction()`: `supabase.auth.signOut()` → `revalidatePath("/", "layout")` → `redirect("/login")`.
  - Error en línea bajo el botón (estilo de error de SPEC 07).
- **Protección de rutas (proxy):**
  - `utils/supabase/middleware.ts` `updateSession`: tras el `getUser()` existente, redirección bidireccional: sin usuario y ruta ∉ públicas → redirect `/login`; con usuario y ruta ∈ `/login`|`/activar-cuenta` → redirect `/`.
  - Constante `PUBLIC_PATHS = ["/login", "/activar-cuenta"]` en el mismo archivo; matcher de `proxy.ts` sin cambios.
- **Sidebar con usuario real:**
  - Nuevo `app/components/UserBlock.tsx` (server component async): `createClient` → `getUser()` → `select("full_name, role")` de `public.users` (`eq("id", user.id)`); mapea `user_role` a ES: `staff`→«Personal», `parent`→«Familia», `admin`→«Admin»; `full_name` vacío → «Usuario»; initial = primera letra.
  - `/`, `/kids`, `/kids/[id]` renderizan el Sidebar pasándole `<Suspense fallback={esqueleto}>` con `UserBlock` (children; Sidebar sigue `"use client"`); el resto de cada página queda en el shell estático.
  - `app/components/Sidebar.tsx`: «Cerrar sesión» pasa de `<Link href="/login">` a submit de `<form action={signOutAction}>` sin cambios visuales.
- Verificación: lint + build + dev + flujo completo con Playwright en `.playwright-mcp/`.

**Out of scope (para futuras specs):**

- «¿Olvidaste tu contraseña?» funcional (sigue inerte) y correos.
- `/activar-cuenta` real (`invitations` no existe): sigue estática y pública.
- Signup público y flujos de familia; roles como autorización (solo se muestran).
- `FeedHeader` («Buenas, Caro») y `QuickCreateCard` («C»): siguen con literales de `app/data/feed.ts`.
- «Sala Soles» desde BD (`rooms` no existe); `redirectTo` post-login; uso de `client.ts`; responsive móvil.

## Modelo de datos

No crea estructuras nuevas en la BD: usa `auth.users` (Supabase Auth) y `public.users` (SPEC 09). Nuevas estructuras de app:

```ts
// app/login/actions.ts
export type LoginActionState = { error: string | null };

// utils/supabase/middleware.ts
const PUBLIC_PATHS = ["/login", "/activar-cuenta"];
// !user && ruta no pública → redirect("/login"); user && ruta pública → redirect("/")

// app/components/UserBlock.tsx
type SidebarUser = {
  fullName: string; // users.full_name; fallback "Usuario"
  roleLabel: string; // staff→"Personal", parent→"Familia", admin→"Admin"
  initial: string;   // primera letra de full_name
};
```

## Plan de implementación

1. **Prerrequisito BD:** reintento MCP; si no conecta → pausa para que el usuario reactive el proyecto. Verificar `auth.users`/`public.users`; si falta el auth user → paso manual (dashboard) + verificación del trigger; si falta el seed → `supabase_apply_migration` `seed_staff_user` + espejo `supabase/migrations/<version>_seed_staff_user.sql`; marcar los 3 criterios pendientes de SPEC 09.
2. **Protección de rutas:** redirects bidireccionales en `utils/supabase/middleware.ts`. Manual: sin sesión `/` y `/kids` redirigen a `/login`.
3. **Server actions:** crear `app/login/actions.ts` (`signInAction`, `signOutAction`). Manual: lint/build limpios.
4. **Formulario real:** reescribir `app/login/page.tsx` con `useActionState`, email vacío, error en línea y estado de carga. Manual: credenciales correctas → `/`; incorrectas → «Email o contraseña incorrectos.».
5. **Sidebar real:** crear `UserBlock.tsx` + `<Suspense>` en las 3 páginas pasándolo al Sidebar; «Cerrar sesión» → form con `signOutAction`. Manual: «Caro Giménez» + «Personal» + «C»; logout → `/login` sin sesión.
6. **Verificación final:** `npm run lint`, `npm run build`, dev server y capturas Playwright en `.playwright-mcp/` del flujo completo.

## Criterios de aceptación

- [ ] La BD responde por MCP y `caro@opendaycare.com` existe en `auth.users` con su fila `staff`/«Caro Giménez»/Sala Soles; los 3 criterios pendientes de SPEC 09 quedan marcados.
- [ ] Sin sesión, `/`, `/kids` y `/kids/[id]` redirigen a `/login`.
- [ ] Con sesión, `/login` y `/activar-cuenta` redirigen a `/`.
- [ ] Contraseña incorrecta muestra «Email o contraseña incorrectos.» en línea y permanece en `/login`.
- [ ] Login con las credenciales de Caro llega a `/` con sesión; F5 mantiene la sesión (refresh del proxy).
- [ ] El sidebar muestra «Caro Giménez», «Personal» e initial «C» desde `public.users` (no literales).
- [ ] «Cerrar sesión» desloguea y redirige a `/login`; tras el logout las rutas privadas vuelven a redirigir a `/login`.
- [ ] `npm run lint` no agrega errores (los 2 preexistentes de `support.js` siguen siendo los únicos) y `npm run build` completa sin errores.
- [ ] Capturas del flujo completo en `.playwright-mcp/`.

## Decisiones

- **Sí:** login vía Server Action (`signInWithPassword` + `redirect` + `revalidatePath("/", "layout")`). Patrón del template oficial de Supabase (Context7); cookies se setean server-side y el router cache se invalida.
- **Sí:** protección en `proxy.ts`/`updateSession`. La doc de `@supabase/ssr` exige que la refresh viva en el middleware; corre en cada request sin tocar el prerender de `cacheComponents`. Elección del usuario (bidireccional).
- **Sí:** `getUser()` sobre `getSession()` — valida contra el auth server en vez de confiar en cookies client-supplied (recomendación explícita de la doc).
- **Sí:** email vacío. Elección del usuario; el prefill era solo del mockup.
- **Sí:** mensaje de error único en español sin mapear detalles técnicos; evita leak y mantiene la UI ES.
- **Sí:** sidebar con datos reales vía server component async + `<Suspense>`. Elección del usuario; único patrón compatible con `cacheComponents` sin volver dinámicas las páginas.
- **Sí:** mapeo de rol a etiquetas ES (`staff`→«Personal», `parent`→«Familia», `admin`→«Admin»); los valores del enum siguen en inglés en la BD (referencia 07-DB-Schema).
- **Sí:** «Cerrar sesión» con `signOutAction` en un `<form>`; mantiene ícono/estilo de SPEC 03.
- **No:** chequeo `getUser()` por página además del proxy. El matcher cubre todas las rutas; bajo `cacheComponents` forzaría streaming en páginas hoy estáticas.
- **No:** `redirectTo` post-login; siempre `/`. Simplicidad; se agrega si aparece la necesidad.
- **No:** FeedHeader/QuickCreateCard con datos reales; sidebar header con «Sala Soles» desde BD. Fuera de scope; quedan con literales (idénticos para el usuario de prueba).
- **No:** recuperación de contraseña, activación real, signup público, uso de `client.ts` en esta spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| BD inaccesible por MCP («Database is possibly not accessible») — posible proyecto pausado | Paso 1 de prerrequisito; el usuario reactiva desde el dashboard antes de continuar |
| `redirect()` dentro de `try/catch` traga `NEXT_REDIRECT` y rompe el login | Redirects siempre fuera de try/catch en las actions |
| Suspense del UserBlock parpadea en cada navegación | Fallback esqueleto mínimo; query de una sola fila cubierta por RLS self (SPEC 09) |
| RLS de `users` no devuelve la fila propia (policy rota) | Smoke test en el paso 1 con la sesión real de Caro |
| Cache del router cliente tras login/logout | `revalidatePath("/", "layout")` en ambas actions |

## Lo que **no** está en esta spec

- Recuperación de contraseña, activación real (`invitations`), signup público, flujos de familia, roles como autorización, FeedHeader/QuickCreateCard reales, «Sala Soles» desde BD, `redirectTo`, responsive móvil.

Cada una de esas, si llega, va en su propia spec.
