# SPEC 02 — Lista y perfil de niños (UI estática)

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-09
> **Objetivo:** Implementar las pantallas `ninos.dc.html` (lista) y `perfil-nino.dc.html` (perfil) como rutas `/kids` y `/kids/[id]` con datos mock y estilo idéntico al mockup, sin backend ni interactividad.

## Por qué existe esta spec

Es la segunda pantalla real de la app y la primera con navegación entre rutas y ruta dinámica. Además convierte el sidebar en chrome compartido entre `/` y `/kids`, patrón que heredarán Avisos y Mi cuenta.

## Scope

**In:**

- Ruta `/kids` con el layout de dos columnas de SPEC 01 (sidebar 248px + main con scroll propio, columna de max-width 880px centrada).
- Cabecera de gestión: kicker «GESTIÓN», título «Niños» y botón «Agregar niño» con gradiente (inerte).
- Buscador «Buscar niño…» solo visual (input sin lógica).
- Divisor «SALA SOLES · 8 niños» (el 8 sale de `kids.length`) + grilla de 2 columnas con las 8 tarjetas del mockup en orden.
- `KidCard`: avatar circular con inicial y color por niño, nombre, subtítulo de edad/padres, elemento lateral según regla (badge de alergía > badge VINCULAR si no tiene padres > chevron) y hover del mockup (borde `#F2A78E`, `translateY(-2px)`).
- Ruta dinámica `/kids/[id]` (columna de max-width 820px) con `generateStaticParams` (8 páginas estáticas) y `notFound()` para ids desconocidos.
- Perfil: link «Volver a Niños» → `/kids`, cabecera (avatar 84px, nombre, edad + sala, botón «Editar» inerte), caja «Alergias y notas» solo si el niño tiene nota, tarjeta de datos (Fecha de nacimiento / Sala / Ingreso), botón «Resumen del día» (inerte) y `LinkedParentsCard` («PADRES VINCULADOS», filas con badge ACTIVA/PENDIENTE, link «Vincular otro padre» inerte).
- Datos mock tipados en `app/data/kids.ts`: los 8 niños del mockup con perfil completo (Mateo exacto al mockup; los otros 7 coherentes con sus subtítulos y badges de la lista).
- Refactor de `app/components/Sidebar.tsx`: prop `active` (`"feed" | "kids"`), links reales Feed → `/` y Niños → `/kids`; Avisos y Mi cuenta siguen inertes. `app/page.tsx` pasa `active="feed"` sin cambios visuales.

**Out of scope (para futuras specs):**

- Pantallas Agregar niño, Vincular padre, Resumen del día, login y cualquier otra de `references/pantallas/`.
- Interactividad: filtro del buscador, vincular, editar, resumen, logout.
- Base de datos, persistencia o APIs.
- Adaptación responsive móvil.
- 404 custom.

## Modelo de datos

Estructuras nuevas, mock y sin persistencia, en `app/data/kids.ts`:

```ts
export type ParentStatus = "active" | "pending";

export type LinkedParent = {
  name: string; // "Lucía Fernández"
  initial: string; // "L"
  relation: string; // "Mamá" | "Papá"
  status: ParentStatus; // "active" → ACTIVA, "pending" → PENDIENTE
  avatarBg: string; // "#C9B6E8"
};

export type Kid = {
  id: string; // "mateo" → /kids/mateo
  name: string; // "Mateo Fernández"
  initial: string; // "M"
  age: number; // 3 → "3 años"
  avatarBg: string; // "#A9D9E8"
  avatarText: string; // "#1F7A93"
  allergyLabel?: string; // "MANÍ" | "LACTOSA" (badge de la lista)
  allergyNote?: string; // nota larga de la caja del perfil
  birthDate: string; // "12 mar 2022"
  room: string; // "Soles"
  enrollment: string; // "feb 2025"
  parents: LinkedParent[];
};

export const kids: Kid[] = [
  /* los 8, en el orden del mockup */
];
```

Convenciones:

- Subtítulo de la tarjeta («2 padres vinculados» / «1 padre vinculado» / «sin padres vinculados»), badges ACTIVA/PENDIENTE y la regla del elemento lateral se calculan en los componentes, no van en los datos.
- Valores internos en inglés (`active`, `pending`), copy visible en español.
- Mateo replica exactamente el mockup; los otros 7 respetan edad, cantidad de padres y alergias que muestra la lista.

## Plan de implementación

1. Leer la doc de Next 16 en `node_modules/next/dist/docs/` sobre rutas dinámicas, `generateStaticParams`, `PageProps` y el modelo de cache con `cacheComponents` (obligatorio según `AGENTS.md`).
2. Crear `app/data/kids.ts` con los tipos y los 8 niños (colores, padres y textos del mockup; Mateo exacto).
3. Refactorizar `app/components/Sidebar.tsx` (prop `active`, links reales Feed/Niños) y actualizar `app/page.tsx` con `<Sidebar active="feed" />`. Manual: `/` queda idéntica a SPEC 01.
4. Crear `app/components/KidCard.tsx` (subtítulo pluralizado + regla del elemento lateral + hover).
5. Crear `app/kids/page.tsx` componiendo Sidebar(`active="kids"`), cabecera, buscador, divisor y grilla de `KidCard` enlazando a `/kids/[id]`.
6. Crear `app/components/LinkedParentsCard.tsx` (filas de padres + «Vincular otro padre» inerte).
7. Crear `app/kids/[id]/page.tsx` con `generateStaticParams`, `await props.params`, `notFound()` y la composición del perfil.
8. Verificar: `npm run lint` (sin errores nuevos), `npm run build`, dev server y capturas Playwright en `.playwright-mcp/` (`/kids` y `/kids/mateo` a 1280×800) contra `references/screenshots/ninos.png` y `perfil-nino.dc.html`.

## Criterios de aceptación

- [x] `npm run lint` no agrega errores (los 2 preexistentes de `support.js` siguen siendo los únicos) y `npm run build` completa sin errores.
- [x] `/` se ve idéntica a SPEC 01 (Feed activo) y su link «Niños» navega a `/kids`.
- [x] `/kids` muestra el sidebar con «Niños» activo, el buscador visual, el divisor «SALA SOLES · 8 niños» y la grilla de 2 columnas con los 8 niños en el orden del mockup.
- [x] Cada tarjeta muestra avatar con inicial/color del mockup, subtítulo correcto y elemento lateral correcto (MANÍ en Mateo, LACTOSA en Tomás, VINCULAR en Valentina, chevron en el resto).
- [x] El hover de una tarjeta aplica borde `#F2A78E` y elevación `translateY(-2px)`.
- [x] Las tarjetas navegan a `/kids/[id]` y cada perfil muestra los datos de ese niño (nombre, edad, sala, nacimiento, ingreso, padres).
- [x] `/kids/mateo` reproduce `perfil-nino.dc.html`: caja «Alergias y notas» con el texto exacto, filas «12 mar 2022» / «Soles» / «feb 2025», Lucía con ACTIVA, Diego con PENDIENTE y «Vincular otro padre».
- [x] Un niño sin `allergyNote` (p. ej. Sofía) no renderiza la caja de alergias.
- [x] Un id inexistente (p. ej. `/kids/pepe`) devuelve 404.
- [x] «Agregar niño», «Editar», «Resumen del día», «Vincular otro padre» y el logout se renderizan pero no navegan.

## Decisiones

- **Sí:** rutas `/kids` y `/kids/[id]` con slugs cortos (`mateo`, `sofia`, …). Elección del usuario.
- **Sí:** mocks completos para los 8 niños. Elección del usuario; facilita el reemplazo por BD.
- **Sí:** refactor del `Sidebar` con prop `active` en vez de duplicar (~150 líneas compartidas).
- **Sí:** links reales solo a rutas existentes (Feed → `/`, Niños → `/kids`); el resto inertes (convención SPEC 01).
- **Sí:** buscador solo visual. Elección del usuario.
- **Sí:** `generateStaticParams` + `notFound()`. Páginas estáticas en compile time; encaja con `cacheComponents` sin `Suspense`.
- **No:** 404 custom. La de Next basta.
- **No:** mover el Sidebar a un layout compartido. Con 3 páginas, composición por página como en SPEC 01; se reevalúa con más pantallas.
- **No:** tocar `app/layout.tsx`. `LayoutProps<"/">` sigue siendo válido para el root layout con varias rutas (verificado en docs).
- **Sí:** cada pantalla replica su propio mockup aunque discrepen (feed dice «12 niños», lista «8 niños»). `room.childrenCount: 12` se mantiene; `/kids` usa `kids.length` (8).
- **No:** interactividad ni responsive. Specs propias.

## Riesgos

| Riesgo                                                                        | Mitigación                                                             |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Diferencias sutiles de espaciado/sombra al traducir inline styles a utilities | Comparación visual con `ninos.png` y el `.dc.html` renderizado         |
| Ruta dinámica bajo `cacheComponents`                                          | Paso 1 de lectura de docs; `generateStaticParams` con datos constantes |
| No existe screenshot del perfil (`perfil-nino.png`)                           | Verificación contra `perfil-nino.dc.html` renderizado en navegador     |

## Lo que **no** está en esta spec

- Pantallas Agregar niño, Vincular padre, Resumen del día y login.
- Interactividad (buscar, vincular, editar, logout).
- Base de datos, persistencia ni APIs.
- Versión móvil/responsive.

Cada una de esas, si llega, va en su propia spec.
