# SPEC 07 — Crear publicación (modal desde «Nueva publicación»)

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 02, SPEC 05
> **Fecha:** 2026-11-12
> **Objetivo:** Implementar `crear-publicacion.dc.html` como modal que abre el botón «Nueva publicación» del Sidebar, con publicación persistida en localStorage que aparece en el feed.

## Scope

**In:**

- Nuevo `app/components/CreatePostModal.tsx` (`"use client"`), disparado por el botón «Nueva publicación» del Sidebar. Card max-w 580px, bg `#FBF4EC`, borde 1px `#ECE0D0`, radius 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`, overlay `rgba(63,54,46,.45)` (patrón SPEC 06), animaciones existentes.
  - Header: «Cancelar» (15px 700 `#94887B`, cierra) · «Nueva publicación» (Fredoka 600 18px) · «Publicar» (15px 800 `#D9583C`, envía). Borde inferior `#ECE0D0`.
  - PARA: chips de los 8 niños estáticos (`app/data/kids.ts`, avatar circular 26px con initial y colores propios) + chip «Toda la sala». Selección múltiple de niños; «Toda la sala» es exclusiva (elegirla deselecciona niños, y elegir un niño deselecciona «Toda la sala»). Seleccionado: borde+bg `#3F362E` texto blanco; sin seleccionar: borde `#ECE0D0` bg `#FFFDF9` texto `#6E6359`.
  - TIPO: 7 pills radius 999px — seleccionada: bg sólido + texto blanco; no seleccionada: bg pastel + texto de color. Selección única, «Comida» por defecto. Colores por tipo (sólido/pastel): Comida `#9A7B1E`/`#F4EAD0`; Siesta `#7B5FC0`/`#E7DCF6`; Actividad `#2E89A6`/`#C7E7F1`; Logro `#3E9B6C`/`#CFEBD8`; Ánimo `#C56486`/`#F9D2DE`; Foto `#D9684A`/`#FBD8CC`; Anuncio `#4E72C8`/`#CCD8F4`.
  - DESCRIPCIÓN: textarea (min-height 120px, resize vertical, radius 14px, borde 1.5px `#EADFD0`, bg blanco, placeholder «Contá cómo le fue hoy…»). Requerida (trim); error en línea borde `#D9583C` + mensaje 12px, el modal no cierra.
  - FOTOS: grilla de thumbs 96×96 radius 14px + tile «Agregar» dashed `#DBCDBA`. Drag & drop de imágenes sobre la zona + click (input file oculto `accept="image/*"` multiple). Cada archivo se reescala en cliente (canvas, borde máx 480px, JPEG 0.7) a data URL. «×» en esquina quita la foto antes de publicar.
  - Cierre: «Cancelar», Esc y click en overlay (dentro del card no); scroll-lock; `role="dialog"` + `aria-modal="true"` + `aria-label="Nueva publicación"`. Formulario reseteado al reabrir.
- Nuevo `app/lib/posts.ts` (client-safe, espejo de `parent-invites.ts`): clave `POSTS_STORAGE_KEY = "opendaycare:posts:v1"`, `loadStoredPosts()`/`saveStoredPosts()`/`subscribeToPosts()` con guard de `window`, try/catch y fallback a memoria, `validatePostForm()`, `buildPostFromForm()` y `fileToScaledDataUrl()`.
- `app/data/feed.ts`: `PostKind` extendido a `"achievement" | "activity" | "announcement" | "meal" | "nap" | "mood" | "photo"`; `FeedPost` gana `photos?: string[]` (data URLs).
- `app/components/PostCard.tsx`: `kindConfig` cubre los 7 tipos (badge con etiqueta ES y colores pastel de arriba) y renderiza `photos` (1 foto → cover h-200; varias → grilla 2 col). Los posts estáticos no cambian.
- `app/components/Sidebar.tsx` → `"use client"`: el `<Link href="/crear-publicacion">` pasa a `<button>` que abre el modal (estado `open` + `CreatePostModal` condicional). Sigue recibiendo `active`; props serializables.
- Nuevo `app/components/FeedList.tsx` (`"use client"`): reemplaza el map estático de `app/page.tsx` — `useSyncExternalStore` (snapshot de server `[]`, patrón SPEC 06) hace merge de `feedPosts` + guardados, ordenados por `time` desc. Nueva publicación: `authorName` = primer niño seleccionado (o `currentUser.name` si «Toda la sala»), `audience` = «familia de X e Y» o «toda la sala», `time` = HH:MM actual, `hearts`/`comments` = 0.

**Out of scope (para futuras specs):**

- QuickCreateCard («Compartí un momento…») queda inerte — solo abre el modal el botón «Nueva publicación» (decisión del usuario).
- Ruta `/crear-publicacion` como página (el href se elimina).
- Edición/eliminación de publicaciones, hearts y comentarios reales, subir fotos desde el feed.
- Backend, BD, APIs, toasts, focus trap, responsive móvil.

## Modelo de datos

```ts
// app/lib/posts.ts
export const POSTS_STORAGE_KEY = "opendaycare:posts:v1";
export type PostFormValues = {
  kidIds: string[]; // [] = selección vacía
  wholeRoom: boolean; // «Toda la sala»
  kind: PostKind; // default "meal"
  description: string;
  photos: string[]; // data URLs
};
export type PostFormErrors = { description?: string };
export type StoredPost = {
  id: string; // crypto.randomUUID()
  kind: PostKind;
  authorName: string;
  initial: string;
  time: string; // "HH:MM"
  audience: string;
  body: string;
  photos: string[];
};
```

Persistencia: array JSON de `StoredPost` bajo `POSTS_STORAGE_KEY`. Sin migración — la clave termina en `:v1`.

## Plan de implementación

1. Crear `app/lib/posts.ts` (tipos, storage, validación, `buildPostFromForm`, `fileToScaledDataUrl`). Manual: sin UI aún; lint/build limpios.
2. `app/data/feed.ts` + `PostCard.tsx`: extender `PostKind`, `photos` y `kindConfig` a 7 tipos. Manual: el feed se ve idéntico (regresión).
3. Crear `CreatePostModal.tsx` fiel al mockup: chips PARA, pills TIPO, textarea, fotos con drag & drop y validación al publicar. Manual: lint/build; se visualiza en el paso 4.
4. `Sidebar.tsx` → client con trigger y modal condicional; se elimina el href. Manual: el botón abre el modal en `/` y `/kids`; Esc/overlay/Cancelar cierran.
5. Crear `FeedList.tsx` y usarlo en `app/page.tsx`. Manual: publicar → aparece arriba con su badge; F5 → persiste.
6. Verificar: `npm run lint` (sin errores nuevos), `npm run build`, dev server y capturas Playwright en `.playwright-mcp/` (modal abierto vs mockup, error de descripción vacía, drag & drop con preview, feed con la publicación nueva).

## Criterios de aceptación

- [ ] `npm run lint` no agrega errores (los 2 preexistentes de `support.js` siguen siendo los únicos) y `npm run build` completa sin errores.
- [ ] El botón «Nueva publicación» del Sidebar abre el modal en todas las páginas donde vive; «Cancelar», Esc y click en overlay cierran; click dentro del card no; scroll-lock activo.
- [ ] El modal replica el mockup: header con los 3 actions, secciones PARA/TIPO/DESCRIPCIÓN/FOTOS con labels 12px `#94887B` y tipografía Fredoka en títulos.
- [ ] PARA muestra los 8 niños estáticos con sus iniciales/colores + «Toda la sala»; selección múltiple; «Toda la sala» deselecciona niños y elegir un niño deselecciona «Toda la sala».
- [ ] TIPO muestra 7 pills; la seleccionada es sólida con texto blanco y las demás pastel; «Comida» viene seleccionada; solo una a la vez.
- [ ] Publicar con descripción vacía muestra error en línea (borde `#D9583C` + mensaje 12px) y el modal no cierra.
- [ ] Arrastrar imágenes sobre la zona FOTOS las agrega como thumbs con preview (reescaladas); click en «Agregar» abre el selector; «×» quita una foto.
- [ ] Publicar con datos válidos cierra el modal y la publicación aparece arriba del feed con badge y autor correctos; corazones/comentarios en 0.
- [ ] Tras F5 la publicación persiste en `opendaycare:posts:v1` sin duplicarse.
- [ ] Reabrir el modal muestra el formulario reseteado (sin niños, sin Toda la sala, Comida, descripción vacía, sin fotos).
- [ ] QuickCreateCard sigue inerte y el card del modal tiene `role="dialog"`, `aria-modal="true"` y `aria-label="Nueva publicación"`.
- [ ] Captura 1280×800 del modal abierto coincide con `crear-publicacion.dc.html` renderizado en layout, colores, tipografía y espaciados.

## Decisiones

- **Sí:** modal sobre el feed. Elección del usuario; precedente SPEC 04/06, no se crea la ruta `/crear-publicacion`.
- **Sí:** solo el botón «Nueva publicación» abre el modal; QuickCreateCard queda inerte. Elección del usuario.
- **Sí:** persistencia en localStorage `opendaycare:posts:v1` y publicación visible en el feed. Elección del usuario; patrón SPEC 05/06.
- **Sí:** chips PARA con los 8 niños estáticos + «Toda la sala» exclusiva. Elección del usuario (todos los estáticos, no solo los 3 del mockup).
- **Sí:** `PostKind` extendido a 7 tipos con `kindConfig` completo. Elección del usuario; el badge del feed muestra el tipo real elegido.
- **Sí:** pill sólida = seleccionada, pastel = no seleccionada, «Comida» por defecto. Elección del usuario; derivado de los dos estilos visibles en el mockup.
- **Sí:** fotos reescaladas en canvas (480px, JPEG 0.7) persistidas como data URLs. Elección del usuario; sobreviven F5 sin reventar la cuota de localStorage.
- **Sí:** `authorName` = primer niño seleccionado; «Toda la sala» → «Caro Giménez». Consistente con los posts estáticos (Mateo como autor) y el anuncio general.
- **Sí:** «×» para quitar fotos antes de publicar. Necesario con archivos reales; el mockup no lo muestra pero no hay forma de corregir sin él.
- **No:** editar publicaciones, hearts/comentarios funcionales, fotos en QuickCreateCard, backend/API. Specs propias si llegan.

## Riesgos

| Riesgo                                      | Mitigación                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| Cuota de localStorage con data URLs         | try/catch en `saveStoredPosts`; si excede, se guarda el post sin fotos |
| Hidratación: storage solo existe en cliente | `useSyncExternalStore` con snapshot de server `[]` (patrón SPEC 06)    |
| Sidebar pasa a client en todas las páginas  | Sus props ya son serializables; `app/page.tsx` y `/kids` no cambian    |
| Orden del feed con horas nuevas             | Sort desc por `time` (HH:MM cero-rellenado ordena lexicográfico)       |

## Lo que **no** está en esta spec

- QuickCreateCard funcional, ruta `/crear-publicacion`, edición/eliminación de posts, hearts/comentarios reales, backend/BD/APIs, toasts, focus trap, responsive móvil.

Cada una de esas, si llega, va en su propia spec.
