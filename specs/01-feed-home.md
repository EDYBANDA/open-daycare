# SPEC 01 — Feed estático como home

> **Estado:** Implementado
> **Depende de:** ninguna
> **Fecha:** 2026-11-06
> **Objetivo:** Implementar la pantalla del feed de `references/pantallas/feed.dc.html` como home `/` de la app, con estilo visualmente idéntico al mockup, sin autenticación ni base de datos.

## Por qué existe esta spec

Es la primera pantalla real de la app. Establece la base visual (fuentes Fredoka/Nunito, paleta crema, patrón sidebar + feed) que heredarán las demás pantallas de `references/pantallas/`.

## Scope

**In:**

- Página `/` con layout de dos columnas: sidebar fijo de 248px + feed con scroll propio (columna de max-width 760px centrada).
- Sidebar completo: logo «OpenDayCare / Sala Soles» (único link que apunta a `/`), botón «Nueva publicación» con gradiente, nav Feed (activo) / Niños / Avisos / Mi cuenta, y tarjeta de usuario «Caro Giménez · Maestra · Soles» con icono de cerrar sesión.
- Cabecera del feed: «GUARDERÍA · SALA SOLES», «Buenas, Caro» y «12 niños · martes 17 jun».
- Tarjeta «Compartí un momento…» con avatar e icono de cámara.
- Divisor «PUBLICADO HOY».
- Las 3 publicaciones del mockup con sus variantes: LOGRO (badge verde, corazón 3, comentario 1), ACTIVIDAD (badge azul, foto placeholder dashed «Foto · pintando con témperas», corazón 5, comentario 2) y ANUNCIO (badge lila con avatar de megáfono, «Para: toda la sala», corazón 8, comentario 0).
- Contenido mock en `app/data/feed.ts` con tipos TypeScript y el contenido exacto del mockup.
- Componentes por bloque en `app/components/`.
- Fuentes Fredoka (400–700) y Nunito (400–800 + itálica) cargadas con `next/font/google`.
- Estilos con Tailwind 4 usando valores arbitrarios que replican 1:1 colores (`#F6ECDF`, `#FFFDF9`, `#ECE0D0`, `#F2937A`, `#D9583C`, etc.), radios, sombras y tamaños del mockup.
- Links sin destino renderizados pero inertes (sin navegación real).

**Out of scope (para futuras specs):**

- Autenticación (login/logout funcional).
- Base de datos, persistencia o APIs.
- Rutas reales para Niños, Avisos, Mi cuenta, crear/detalle publicación y foto.
- Interactividad de likes, comentarios, crear o editar publicaciones.
- Adaptación responsive móvil (sidebar colapsable, bottom nav).
- Cualquier otra pantalla de `references/pantallas/`.

## Modelo de datos

Estructuras nuevas, todas mock y sin persistencia:

```ts
// app/data/feed.ts
export type PostKind = "achievement" | "activity" | "announcement";

export type FeedPost = {
  id: string;
  kind: PostKind;
  authorName: string; // "Mateo" | "Anuncio general"
  initial?: string; // "M"; si falta, se renderiza el avatar de megáfono
  time: string; // "14:20"
  audience: string; // "familia de Mateo" | "toda la sala"
  body: string; // texto de la publicación
  photoLabel?: string; // "Foto · pintando con témperas" (solo kind "activity")
  hearts: number; // 3 | 5 | 8
  comments: number; // 1 | 2 | 0
};

export const currentUser = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
};
export const room = {
  name: "Sala Soles",
  childrenCount: 12,
  dateLabel: "martes 17 jun",
};
export const feedPosts: FeedPost[] = [
  /* los 3 posts del mockup, en orden 14:20 / 09:40 / 07:50 */
];
```

Los valores internos de `PostKind` están en inglés (`achievement`, `activity`, `announcement`), siguiendo la regla de código en inglés del repo; el UI copy visible sigue en español. La configuración por variante (etiqueta en español del badge, fondo, texto, punto y estilo del avatar) vive en un mapa dentro de `PostCard`, no en los datos. Todos los posts del mockup muestran «publicado por vos», que se renderiza fijo en `PostCard`.

## Plan de implementación

1. Leer la doc de Next 16 en `node_modules/next/dist/docs/` sobre `next/font` y el modelo de cache (obligatorio según `AGENTS.md` antes de escribir código).
2. Modificar `app/layout.tsx`: cargar Fredoka y Nunito con `next/font/google` (pesos del mockup) exponiendo variables CSS, y actualizar el título a «OpenDayCare».
3. Modificar `app/globals.css`: reset base del mockup (fondo `#F6ECDF`, color `#3F362E`, box-sizing, scrollbar con thumb `#E4D6C4`) y conectar las variables de fuente al tema de Tailwind para tener `font-sans` (Nunito) y `font-display` (Fredoka).
4. Crear `app/data/feed.ts` con los tipos (kinds en inglés) y los 3 posts exactos del mockup.
5. Crear `app/components/Sidebar.tsx` (logo, CTA, nav con Feed activo, tarjeta de usuario). Links inertes; logo apunta a `/`.
6. Crear `app/components/FeedHeader.tsx` y `app/components/QuickCreateCard.tsx`.
7. Crear `app/components/PostCard.tsx` con las 3 variantes (badge, avatar, foto placeholder en actividad).
8. Reescribir `app/page.tsx` componiendo Sidebar + feed (cabecera, quick create, divisor «PUBLICADO HOY», lista desde `feedPosts`).
9. Verificar: `npm run lint` (sin errores nuevos), `npm run build`, dev server y captura con Playwright en `.playwright-mcp/` comparada con `references/screenshots/feed.png`.

## Criterios de aceptación

- [x] `npm run lint` no agrega errores (los 2 preexistentes de `references/pantallas/support.js` siguen siendo los únicos).
- [x] `npm run build` completa sin errores.
- [x] `/` renderiza sidebar fijo de 248px + feed centrado de max-width 760px sobre fondo `#F6ECDF`, sin más rutas que `/`.
- [x] Títulos y nombres usan Fredoka; el resto usa Nunito (verificable en DevTools, sin fallback a fuente del sistema).
- [x] Los 3 posts aparecen con badges LOGRO (`#CFEBD8`/`#3E9B6C`), ACTIVIDAD (`#C7E7F1`/`#2E89A6`) y ANUNCIO (`#CCD8F4`/`#4E72C8`), corazones 3/5/8 y comentarios 1/2/0.
- [x] Los valores internos de `PostKind` son `achievement` | `activity` | `announcement`; los badges renderizan «LOGRO», «ACTIVIDAD» y «ANUNCIO».
- [x] El post de actividad muestra el placeholder dashed «Foto · pintando con témperas».
- [x] Ningún link del sidebar ni de los posts navega fuera de `/` (salvo el logo, que apunta a `/`).
- [x] Captura desktop (1280×800) visualmente idéntica a `references/screenshots/feed.png` en layout, colores, tipografía y espaciados.

## Decisiones

- **Sí:** links inertes renderizados. Fidelidad visual al mockup; los destinos no existen aún.
- **No:** ocultar los links no funcionales. Haría que el diseño difiera del mockup.
- **Sí:** Tailwind con valores arbitrarios (`bg-[#FFFDF9]`, `rounded-[20px]`). Es el stack del repo y permite replicar valores exactos.
- **No:** estilos inline 1:1 ni CSS Modules. Van contra la convención del repo (Tailwind 4 vía Turbopack).
- **Sí:** datos mock tipados en `app/data/feed.ts`. Facilita el reemplazo por la BD en una spec futura.
- **Sí:** componentes por bloque (`Sidebar`, `FeedHeader`, `QuickCreateCard`, `PostCard`) en `app/components/`.
- **Sí:** réplica desktop; en móvil el layout se degrada naturalmente. El responsive va en su propia spec.
- **Sí:** `next/font/google` para las fuentes (self-hosted, sin parpadeo). **No:** `<link>` a Google Fonts (bloquea el render y depende de la red).
- **Sí:** etiquetas de estado en español (Borrador/Aprobado). Primer spec del repo, fija la convención.
- **No:** design system formal con tokens `@theme` para toda la paleta. Se extraerá cuando existan más pantallas; solo se registran `font-sans`/`font-display` por necesidad de `next/font`.
- **No:** interactividad de corazones/comentarios. El alcance es solo el estilo.
- **Sí:** `PostKind` con valores en inglés (`achievement`/`activity`/`announcement`) y etiquetas visuales en español vía mapa en `PostCard`. Cumple la regla de código en inglés del repo; el HTML muestra LOGRO/ACTIVIDAD/ANUNCIO.

## Riesgos

| Riesgo                                                                                     | Mitigación                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Diferencias sutiles de espaciado/sombra al traducir inline styles a utilities              | Comparación visual lado a lado con `references/screenshots/feed.png` y ajuste de los valores arbitrarios                             |
| `next/font` sin los pesos exactos del mockup (Fredoka 400–700, Nunito hasta 800 + itálica) | Declarar los pesos explícitamente en `app/layout.tsx`                                                                                |
| Conflicto con `cacheComponents`                                                            | No hay data fetching en `/`; los datos mock son constantes en tiempo de compilación y no requieren `Suspense` ni directivas de cache |

## Lo que **no** está en esta spec

- Autenticación ni logout funcional.
- Base de datos, persistencia ni APIs.
- Rutas nuevas (Niños, Avisos, Mi cuenta, crear/detalle publicación, foto).
- Interactividad (likes, comentarios, edición).
- Versión móvil/responsive.

Cada una de esas, si llega, va en su propia spec.
