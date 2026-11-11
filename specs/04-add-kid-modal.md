# SPEC 04 — Modal Agregar niño (UI estática)

> **Estado:** Aprobado
> **Depende de:** SPEC 02
> **Fecha:** 2026-11-11
> **Objetivo:** Implementar la pantalla `agregar-nino.dc.html` como un modal que se abre al pulsar «Agregar niño» en `/kids`, con sus 5 campos y cierre por overlay/Esc/Cancelar/Guardar, sin guardar nada.

## Scope

**In:**

- Componente cliente `app/components/AddKidModal.tsx` (`"use client"`) que renderiza: el botón «Agregar niño» (estilos exactos del actual de SPEC 02) y, al pulsarlo, el modal con: overlay fijo `rgba(63,54,46,.45)` cubriendo el viewport, y card replicando el mockup — max-width 520px, bg `#FBF4EC`, borde 1px `#ECE0D0`, radius 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`, overflow hidden.
- Header del card: «Cancelar» (`#94887B`, 700, 15px) · «Agregar niño» (Fredoka 600, 18px) · «Guardar» (`#D9583C`, 800, 15px); borde inferior 1px `#ECE0D0`, padding 20px 26px.
- Campos (labels 12px/800/tracking .7px/`#94887B`; inputs radius 14px, borde 1.5px `#EADFD0`, bg blanco, padding 13px 16px, 15px): NOMBRE COMPLETO («Ej. Martina López»), fila FECHA DE NACIMIENTO («dd/mm/aaaa», input de texto) + SALA (select nativo `appearance-none`, única opción «Soles» en peso 700 con chevron SVG `#B0A290`), ALERGIAS (ETIQUETAS) («Ej. Maní, Lactosa»), NOTAS MÉDICAS (textarea min-height 90px, resize vertical, line-height 1.5, «Indicaciones, medicación, contactos…»).
- Cierre del modal con 4 vías: «Cancelar», «Guardar», tecla Esc y click en overlay (click dentro del card no cierra). «Guardar» no guarda ni navega nada.
- Mientras el modal está abierto, el fondo no scrollea (lock de `body` con restore al cerrar).
- Animación de entrada ~180ms: overlay fade y card `scale(.97)→1`; cierre instantáneo. Keyframes como tokens `--animate-*` en el `@theme` de `app/globals.css` (patrón Tailwind 4, sin plugin).
- A11y básica: `role="dialog"`, `aria-modal="true"`, `aria-label="Agregar niño"`, cierre por Esc.
- Cambio en `app/kids/page.tsx`: el `<a>` inerte «Agregar niño» se reemplaza por `<AddKidModal />`; el resto de `/kids` queda igual.

**Out of scope (para futuras specs):**

- Agregar el niño a la lista (estado o BD), validación de campos y estados de error.
- Vincular padres, edición de perfil, salas nuevas o dropdown custom de salas.
- Ruta propia (`/kids/agregar`) o intercepting routes — es modal por decisión del usuario.
- Persistencia, APIs, backend.
- Animación de salida, focus trap, responsive móvil.

## Modelo de datos

Esta feature no introduce estructuras de datos nuevas. Labels, placeholders y valores («Soles») son literales del mockup dentro del componente (criterio de SPEC 03). No se toca `app/data/kids.ts`.

## Plan de implementación

1. Leer la doc de Next 16 en `node_modules/next/dist/docs/` sobre client components (`"use client"`, event handlers, hidratación); confirmar que sin data fetching no aplica nada de `cacheComponents`.
2. Añadir a `app/globals.css` los tokens `--animate-modal-overlay-in` y `--animate-modal-card-in` con sus `@keyframes` dentro del `@theme` (fade 180ms; fade+scale 180ms).
3. Crear `app/components/AddKidModal.tsx`: estado `open`, botón trigger, overlay + card con los 5 campos del mockup, efecto que agrega listener de Esc y bloquea el scroll del body, cierre por click en overlay (`stopPropagation` en el card), atributos aria. Manual: abrir `/kids`, pulsar el botón y ver el mockup.
4. En `app/kids/page.tsx`, reemplazar el `<a>` por `<AddKidModal />`. Manual: `/kids` cerrado queda idéntico a SPEC 02.
5. Verificar: `npm run lint` (sin errores nuevos), `npm run build`, dev server y capturas Playwright en `.playwright-mcp/` (1280×800): `/kids` cerrado, modal abierto contra `agregar-nino.dc.html` renderizado, y las 4 vías de cierre.

## Criterios de aceptación

- [ ] `npm run lint` no agrega errores (los 2 preexistentes de `support.js` siguen siendo los únicos) y `npm run build` completa sin errores.
- [ ] `/kids` con el modal cerrado es visualmente idéntico a SPEC 02 (mismo header, buscador, divisor y grilla de 8).
- [ ] Click en «Agregar niño» abre el modal con el overlay `rgba(63,54,46,.45)` cubriendo el viewport y el fondo sin scroll mientras está abierto.
- [ ] El card replica el mockup: header Cancelar/título/Guardar, labels 12px tracking .7px `#94887B`, inputs radius 14px borde 1.5px `#EADFD0`, placeholders exactos de los 4 campos.
- [ ] FECHA DE NACIMIENTO y SALA están en una fila de 2 columnas (gap 14px) y SALA es un `<select>` nativo `appearance-none` con «Soles» en peso 700 + chevron del mockup.
- [ ] NOTAS MÉDICAS es un textarea de min-height 90px con `resize: vertical`.
- [ ] Al abrir, overlay y card aparecen con fade (+scale 0.97→1) de ~180ms; el cierre es instantáneo.
- [ ] El modal cierra con «Cancelar», «Guardar», Esc y click en overlay; un click dentro del card no lo cierra.
- [ ] Tras cerrar, `/kids` queda igual: 8 niños, sin navegación ni datos agregados.
- [ ] El card tiene `role="dialog"`, `aria-modal="true"` y `aria-label="Agregar niño"`.
- [ ] Captura 1280×800 del modal abierto coincide con `agregar-nino.dc.html` renderizado en layout, colores, tipografía y espaciados.

## Decisiones

- **Sí:** modal client-side con `useState`. Elección del usuario; `/kids` sigue siendo server component y solo este componente es cliente.
- **Sí:** trigger (botón) dentro del mismo archivo para compartir el estado sin props cruzados ni estados elevados.
- **Sí:** «Guardar» solo cierra. Elección del usuario; convención de UI estática de SPEC 01–03.
- **Sí:** select nativo estilizado para SALA. Elección del usuario; operable por teclado y visualmente idéntico al mockup.
- **Sí:** fecha como input de texto «dd/mm/aaaa». Elección del usuario; un `type="date"` alteraría el estilo con el ícono nativo.
- **Sí:** cierre por Esc y click en overlay además de los botones. Elección del usuario; comportamiento estándar de modal.
- **Sí:** animación fade+scale de entrada (~180ms), sin animación de salida. Elección del usuario; el cierre instantáneo evita estados de desmontaje.
- **Sí:** keyframes en `globals.css` vía `@theme` de Tailwind 4 (sin plugin `tailwindcss-animate`).
- **Sí:** a11y básica (role, aria-modal, Esc, scroll-lock). Sin focus trap ni retorno de foco — va con la spec de formularios reales.
- **Sí:** scroll-lock del body mientras el modal está abierto.
- **No:** agregar niños reales, validación ni persistencia. Fuera de alcance de esta etapa.
- **No:** ruta `/kids/agregar` ni intercepting routes. La pantalla vive solo sobre `/kids`.
- **No:** dropdown custom de salas. Solo existe «Soles» en los mocks.

## Riesgos

| Riesgo                                                | Mitigación                                                              |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Select nativo renderiza flecha propia según navegador | `appearance-none` total + chevron SVG del mockup; verificado en captura |
| No existe screenshot PNG de `agregar-nino`            | Comparación contra el `.dc.html` renderizado (patrón SPEC 02/03)        |
| El modal solo se monta tras interacción (hidratación) | El overlay no existe en el HTML inicial; no hay mismatch posible        |

## Lo que **no** está en esta spec

- Agregar niños reales a la lista, validación ni estados de error.
- Vincular padres, salas nuevas, dropdown custom.
- Persistencia, BD, APIs.
- Focus trap y responsive móvil.

Cada una de esas, si llega, va en su propia spec.
