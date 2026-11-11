# SPEC 03 — Login y activación de cuenta (UI estática)

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-11
> **Objetivo:** Implementar las pantallas `login.dc.html` (sin el selector «INGRESO COMO Personal/Familia») y `activar-cuenta.dc.html` como rutas estáticas `/login` y `/activar-cuenta`, y conectar el logout del sidebar a `/login`, sin autenticación real.

## Por qué existe esta spec

Es la primera pantalla fuera del chrome del sidebar (layout full-page propio) y define el flujo de entrada a la app: login ↔ activar cuenta ↔ logout. Fija el patrón para las demás pantallas sin sidebar.

## Scope

**In:**

- Ruta `/login`: layout de dos columnas (grid `1.05fr 1fr`, min-height 100vh) sobre fondo `#FBF4EC`, sin sidebar.
- Panel izquierdo de marca: gradiente `linear-gradient(155deg,#F6A98E 0%,#F2937A 45%,#EC7E62 100%)`, dos círculos decorativos translúcidos, tile de logo 46px con el sol SVG + «OpenDayCare» (Fredoka 21px), titular «El día de cada niño, compartido con su familia.» (Fredoka 42px), párrafo «Publicá momentos…» y pie «🌿 Guardería Sala Soles».
- Formulario derecho (max-width 392px): «Iniciar sesión», «Ingresá para ver el día de hoy.», labels EMAIL/CONTRASEÑA (12px, tracking .7px, `#94887B`), email precargado `caro@opendaycare.com`, contraseña con placeholder `••••••••`, «¿Olvidaste tu contraseña?» inerte (`#C5503A`), botón «Iniciar sesión» (gradiente `#F4977E→#EE8164`) → `/`, pie «¿Te invitó la guardería? Activá tu cuenta» → `/activar-cuenta`.
- **Sin** el bloque «INGRESO COMO» ni los botones «Personal»/«Familia» (decisión del usuario).
- Ruta `/activar-cuenta`: columna centrada (max-width 440px) sobre `#FBF4EC` con tile de icono 58px (gradiente `#F8C3A8→#F2937A` + sol SVG), «Bienvenida a OpenDayCare», texto de invitación, tarjeta «Mateo · Sala Soles» (avatar «M» `#A9D9E8`/`#1F7A93`), campos CÓDIGO DE INVITACIÓN (`7K4P9`, Fredoka, tracking 3px), EMAIL (`lucia.fernandez@gmail.com`) y CREAR CONTRASEÑA (borde `#F2A78E`, tal cual el mockup), checkbox de autorización marcado (caja `#5FB97E`, fondo `#FBF1D6`, texto `#8A7234`), botón «Activar mi cuenta» inerte y pie «¿Ya tenés cuenta? Iniciar sesión» → `/login`.
- Cambio en `app/components/Sidebar.tsx`: el botón «Cerrar sesión» pasa de `<button>` inerte a link a `/login`, sin cambios visuales.
- Tailwind 4 con valores arbitrarios; fuentes Fredoka/Nunito ya cargadas por SPEC 01.

**Out of scope (para futuras specs):**

- Autenticación real, validación de formularios y estados de error.
- Pantalla «¿Olvidaste tu contraseña?» y familia-feed (por eso «Activar mi cuenta» queda inerte).
- Selector de rol Personal/Familia y flujo de familia.
- Protección de rutas / middleware / redirects.
- Base de datos, persistencia o APIs.
- Adaptación responsive móvil.

## Modelo de datos

Esta feature no introduce estructuras de datos nuevas. Todo el contenido (emails, código `7K4P9`, «Mateo · Sala Soles», textos) son literales en las páginas, siguiendo el criterio de UI estática de SPEC 01/02. No se crea ningún archivo en `app/data/`.

## Plan de implementación

1. Leer la doc de Next 16 en `node_modules/next/dist/docs/` sobre rutas nuevas y el modelo de cache con `cacheComponents` (obligatorio según `AGENTS.md`); confirmar que páginas estáticas sin data fetching no requieren directivas extra.
2. Crear `app/login/page.tsx` (dos columnas, panel de marca y formulario sin «INGRESO COMO»; CTA como `<a href="/">`). Manual: `/login` replica el mockup sin el selector.
3. Crear `app/activar-cuenta/page.tsx` (columna centrada completa; CTA inerte, «Iniciar sesión» → `/login`). Manual: replica el mockup.
4. Modificar `app/components/Sidebar.tsx`: logout → `<a href="/login">` manteniendo estilo y `title`. Manual: `/` y `/kids` sin cambios visuales.
5. Verificar: `npm run lint` (sin errores nuevos), `npm run build`, dev server y capturas Playwright en `.playwright-mcp/` (`/login` y `/activar-cuenta` a 1280×800) contra los `.dc.html` renderizados (no existen PNGs de referencia).

## Criterios de aceptación

- [ ] `npm run lint` no agrega errores (los 2 preexistentes de `support.js` siguen siendo los únicos) y `npm run build` completa sin errores.
- [ ] `/login` renderiza las dos columnas del mockup: panel de marca con gradiente `155deg` y círculos decorativos, formulario de max-width 392px centrado, sin sidebar.
- [ ] `/login` NO muestra «INGRESO COMO» ni los botones «Personal» y «Familia».
- [ ] El email aparece precargado con `caro@opendaycare.com` y la contraseña muestra el placeholder `••••••••`.
- [ ] «¿Olvidaste tu contraseña?» se renderiza pero no navega.
- [ ] El botón «Iniciar sesión» navega a `/` y «Activá tu cuenta» navega a `/activar-cuenta`.
- [ ] `/activar-cuenta` replica el mockup: tile de icono, «Bienvenida a OpenDayCare», tarjeta «Mateo · Sala Soles», código `7K4P9` (Fredoka, tracking 3px), email `lucia.fernandez@gmail.com`, contraseña y checkbox de autorización marcado.
- [ ] «Activar mi cuenta» se renderiza pero no navega; «Iniciar sesión» (pie) navega a `/login`.
- [ ] Ni `/login` ni `/activar-cuenta` renderizan el sidebar.
- [ ] El icono «Cerrar sesión» navega a `/login` desde `/` y `/kids`, sin cambios visuales en esas pantallas.
- [ ] Capturas desktop (1280×800) de ambas rutas visualmente idénticas a los `.dc.html` renderizados en layout, colores, tipografía y espaciados.

## Decisiones

- **Sí:** rutas `/login` y `/activar-cuenta`. Elección del usuario; consistentes con `/kids`.
- **Sí:** eliminar el selector «Personal/Familia». Elección del usuario; el flujo de familia va en specs propias.
- **Sí:** botón «Iniciar sesión» → `/`. Elección del usuario; replica el destino staff del mockup.
- **Sí:** formularios estáticos con valores precargados del mockup. Elección del usuario; convención SPEC 01/02.
- **Sí:** «Activar mi cuenta» inerte. Elección del usuario; familia-feed no existe aún.
- **Sí:** logout del sidebar → `/login`. Elección del usuario; cierra el flujo entrar/salir.
- **No:** validación cliente ni estado controlado. Va con la spec de auth real.
- **No:** archivo en `app/data/`. Solo literales; no hay estructuras reutilizables.
- **No:** `metadata` por página. Se hereda «OpenDayCare» del root layout (convención actual de `/kids`).

## Riesgos

| Riesgo                                                                 | Mitigación                                                                 |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| No existen screenshots PNG de login/activar-cuenta                     | Comparación contra los `.dc.html` renderizados (como el perfil en SPEC 02) |
| Diferencias sutiles de espaciado/sombra al traducir inline a utilities | Capturas lado a lado y ajuste de valores arbitrarios                       |
| Layout full-page (sin sidebar) bajo el root layout con `flex flex-col` | Verificar `min-h-screen` de la página en el paso de lectura de docs        |

## Lo que **no** está en esta spec

- Autenticación real, validación ni errores.
- Recuperación de contraseña y feed de familia.
- Selector de rol Personal/Familia.
- Protección de rutas / middleware.
- Versión móvil/responsive.

Cada una de esas, si llega, va en su propia spec.
