# SPEC 05 — Guardar niño nuevo desde el modal

> **Estado:** Implementado
> **Depende de:** SPEC 04
> **Fecha:** 2026-11-11
> **Objetivo:** Al presionar «Guardar» en el modal con datos válidos, crear el niño y mostrarlo en la grilla de `/kids` (persistido en localStorage), con validación en línea por campo.

## Scope

**In:**

- Estado controlado de los 5 campos en `AddKidModal.tsx` (hoy solo la fecha lo es): nombre, fecha, sala, alergias, notas médicas.
- Validación al presionar «Guardar»: nombre requerido (trim), fecha completa, válida (la máscara y el chequeo de calendario existentes se conservan) y no futura. Errores en línea por campo, mismo estilo que el actual de fecha (borde `#D9583C` + mensaje 12px). El modal no cierra si hay errores. Alergias y notas: opcionales.
- Nuevo módulo `app/lib/kids.ts` (client-safe): clave `KIDS_STORAGE_KEY = "opendaycare:kids:v1"`, `loadStoredKids()`/`saveStoredKids()` con guard de `window` y try/catch (fallback silencioso a memoria), `validateKidForm()` y `buildKidFromForm()` (deriva `id` con `crypto.randomUUID()`, `initial` = 1ª letra mayúscula, `age` = años cumplidos, `avatarBg`/`avatarText` rotando los 5 pares de los estáticos, `birthDate` «12 mar 2022» con meses abreviados en español, `enrollment` = mes actual «nov 2026», `allergyLabel` = 1ª etiqueta en MAYÚSCULAS, `allergyNote` = «Alergias: …» + notas médicas, `parents: []`).
- Nuevo `app/components/KidsBoard.tsx` (`"use client"`): reemplaza el contenido de `page.tsx` — fila título + AddKidModal, buscador, «SALA SOLES · N niños» y grilla. Estado: los 8 estáticos de `app/data/kids.ts` + niños de localStorage, merge en `useEffect` post-mount. `onSave(kid)` del modal → append + `saveStoredKids`.
- `KidCard.tsx`: prop opcional `href` — con href renderiza `<Link>` (niños estáticos, hacia `/kids/[id]`); sin href un `<div>` idéntico en estilos (niños de localStorage).
- Al guardar con éxito: modal cierra, campos se resetean al reabrir, el niño aparece al final de la grilla y el contador suma.
- `app/kids/page.tsx` queda como server shell (Sidebar + `<KidsBoard />`).

**Out of scope (para futuras specs):**

- Perfil `/kids/[id]` para niños nuevos (su tarjeta no navega) — spec propia: requiere resolver ids cliente contra un server cacheado.
- Vincular padres, edición, salas nuevas, buscador funcional.
- Backend, BD, APIs, sync multi-dispositivo.
- Toast de éxito, focus trap, responsive móvil.

## Modelo de datos

Esta feature no agrega estructuras nuevas: reusa el tipo `Kid` de `app/data/kids.ts`, sin cambios.

```ts
// app/lib/kids.ts
export const KIDS_STORAGE_KEY = "opendaycare:kids:v1";
export type KidFormValues = {
  name: string;
  birthDate: string; // "dd/mm/aaaa"
  room: string;
  allergies: string;
  medicalNotes: string;
};
export type KidFormErrors = { name?: string; birthDate?: string };
```

Persistencia: array JSON de objetos `Kid` bajo `KIDS_STORAGE_KEY`. Sin migración — la clave termina en `:v1`.

## Plan de implementación

1. Crear `app/lib/kids.ts` (storage, validación, `buildKidFromForm`). Manual: sin UI aún; lint/build limpios.
2. `AddKidModal`: controlar los 5 campos, validar al Guardar con errores en línea, `onSave(kid)` con reset + cierre solo si válido. Manual: guardar vacío → errores visibles, modal no cierra.
3. `KidCard`: prop `href` opcional. Manual: `/kids` sin cambios visuales.
4. `KidsBoard` + `page.tsx` como shell; merge de localStorage en `useEffect`. Manual: guardar un niño → aparece; F5 → persiste sin duplicarse.
5. Verificar: `npm run lint` (sin errores nuevos), `npm run build`, dev server y capturas Playwright en `.playwright-mcp/` (flujo guardado válido, caso inválido, grilla con 9 niños).

## Criterios de aceptación

- [x] `npm run lint` no agrega errores (los 2 preexistentes de `support.js` siguen siendo los únicos) y `npm run build` completa sin errores.
- [x] Guardar con nombre vacío muestra error en NOMBRE COMPLETO (borde + mensaje) y el modal no cierra.
- [x] Guardar con fecha incompleta, calendario imposible o futura muestra su error y el modal no cierra.
- [x] Guardar con datos válidos cierra el modal y el niño aparece al final de la grilla con initial, «X años» correctos, chip de alergia en MAYÚSCULAS si hay etiquetas, y colores de la paleta existente.
- [x] El contador pasa de «8 niños» a «9 niños».
- [x] Tras F5 el niño persiste en localStorage y no se duplica.
- [x] La tarjeta del niño nuevo no navega; las de los estáticos siguen navegando a su perfil.
- [x] Reabrir el modal muestra los campos vacíos.
- [x] «31/02/2024» sigue rechazada (regresión del fix de máscara).

## Decisiones

- **Sí:** localStorage. Elección del usuario; sin backend en el repo, la alternativa en memoria hacía de Guardar un no-op persistente.
- **No:** BD/API. Merece spec propia si llega.
- **Sí:** validación al intentar guardar + errores en línea. Elección del usuario; un botón deshabilitado esconde qué falta.
- **Sí:** primera alergia → chip, lista completa + notas → `allergyNote`. Elección del usuario; coincide con las notas de los estáticos.
- **Sí:** tarjeta del niño nuevo sin link; el perfil va en spec propia. Elección del usuario; evita rework de `/kids/[id]` con `cacheComponents` en esta etapa.
- **Sí:** paleta de avatar determinística (total % 5). Sin aleatoriedad en render y solo colores del diseño.
- **Sí:** `id` = `crypto.randomUUID()`. Un slug del nombre colisionaría con los estáticos («sofia», «emma»…).
- **Sí:** merge de localStorage en `useEffect` post-mount. Evita mismatch de hidratación; localStorage no existe en el server.
- **Sí:** reset del formulario al reabrir el modal.
- **Sí:** try/catch en storage con fallback a memoria. El modo privado no rompe la app.
- **No:** toast de éxito. No existe patrón de toasts en la app.

## Riesgos

| Riesgo                                         | Mitigación                                             |
| ---------------------------------------------- | ------------------------------------------------------ |
| localStorage deshabilitado (modo privado)      | try/catch → funciona en memoria, sin persistir         |
| Hidratación: storage solo existe en cliente    | merge en `useEffect`; primer render idéntico al server |
| `crypto.randomUUID` ausente en browsers viejos | Baseline de Next 16 ya lo exige; aceptado              |
| Nacido hoy → «0 años»                          | Aceptado; el cálculo de años cumplidos lo cubre        |

## Lo que **no** está en esta spec

- Perfil del niño nuevo, vincular padres, edición, salas nuevas, buscador funcional, backend/BD, toasts, responsive móvil.

Cada una de esas, si llega, va en su propia spec.
