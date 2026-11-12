# SPEC 06 — Vincular padre (modal con invitación persistida)

> **Estado:** Implementado
> **Depende de:** SPEC 02
> **Fecha:** 2026-11-12
> **Objetivo:** Implementar `vincular-padre.dc.html` como modal que abre «Vincular otro padre» en el perfil del niño, con código aleatorio por apertura y envío que agrega un padre PENDIENTE persistido en localStorage.

## Scope

**In:**

- `LinkedParentsCard.tsx` pasa a client component (`"use client"`): recibe `kidId` y `kidName` además de `parents`; la lista mostrada = padres estáticos + invitaciones de localStorage filtradas por `kidId` (vía `useSyncExternalStore` con snapshot de server vacía — patrón de `KidsBoard`). El `<a>` inerte «Vincular otro padre» se reemplaza por el trigger del modal (fila visualmente idéntica: círculo dashed 40px + texto `#C5503A`). Keys únicas: estáticos por `name`, invitados por su `id`.
- Nuevo `app/lib/parent-invites.ts` (client-safe, espejo de `app/lib/kids.ts`): clave `PARENT_INVITES_STORAGE_KEY = "opendaycare:parent-invites:v1"`, `loadStoredInvites()`/`saveStoredInvites()`/`subscribeToInvites()` con guard de `window`, try/catch y fallback a memoria, `generateInviteCode()` (5 caracteres de alfabeto sin ambiguos `ABCDEFGHJKMNPQRSTUVWXYZ23456789`), `validateInviteForm()` (nombre requerido trim; email requerido + formato `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), `buildParentFromInvite()` (`status: "pending"`, `initial` = 1ª letra mayúscula, `avatarBg` rotando los 5 fondos usados por padres: `#C9B6E8`, `#A9C7E8`, `#F4DC8E`, `#F4B8CC`, `#B9DEC4`).
- Nuevo `app/components/LinkParentModal.tsx` (`"use client"`): contiene el trigger (fila «Vincular otro padre») y el modal — overlay `rgba(63,54,46,.45)` `p-[40px_24px]`, card max-w 480px bg `#FBF4EC` borde 1px `#ECE0D0` radius 24px sombra `0 20px 50px -24px rgba(63,54,46,.35)`, animaciones `animate-modal-overlay-in`/`animate-modal-card-in` ya existentes.
  - Header: título «Vincular padre» (Fredoka 600 18px) + subtítulo «a {kidName}» (13px `#A89A8B`) a la izquierda; botón X (34×34, radius 10px, bg `#F0E6D8`, color `#94887B`) a la derecha.
  - Callout azul: bg `#E3ECFB` radius 14px, ícono círculo-i `#4E72C8`, texto 13.5px `#3F5694` con nombre dinámico: «Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {kidName}.»
  - Campos: NOMBRE DEL PADRE/MADRE («Ej. Diego Fernández») y EMAIL (`type="email"`, «correo@ejemplo.com») — mismos estilos de label/input de `AddKidModal`, errores en línea idénticos (borde `#D9583C` + mensaje 12px). El modal no cierra si hay errores.
  - PARENTESCO: 3 pills flex-1 radius 999px — seleccionada: borde `#9FB8EC` bg `#CCD8F4` texto `#4E72C8`; sin seleccionar: borde `#ECE0D0` bg `#FFFDF9` texto `#6E6359`. Mamá seleccionada por defecto (mockup); única selección a la vez.
  - Caja de código: bg `#FBF1D6`, borde dashed 1.5px `#E6D08A`, radius 16px; «CÓDIGO DE INVITACIÓN» 12px `#A88526`, código Fredoka 600 34px tracking 7px `#8A7234` (regenerado en cada apertura), «Vence en 7 días» 13px `#A88526`.
  - CTA «Enviar invitación»: gradiente `linear-gradient(180deg,#F4977E,#EE8164)`, blanco 800 15.5px, sombra del mockup, ícono send — valida y, si es válido, `onSend(invite)` + cierra.
  - Cierre: X, Esc y click en overlay (click dentro del card no cierra), scroll-lock del body mientras está abierto, `role="dialog"` + `aria-modal="true"` + `aria-label="Vincular padre"`. Campos reseteados (Mamá seleccionada) y código regenerado al reabrir.
- `app/kids/[id]/page.tsx`: pasa `kidId={kid.id}` y `kidName={kid.name}` a `LinkedParentsCard`. Sigue siendo server component con `"use cache"`; props serializables.
- Al enviar con éxito: modal cierra y el padre aparece al final de PADRES VINCULADOS con «{parentesco} · invitación enviada» + badge PENDIENTE (`statusConfig` existente). Tras F5 persiste; invitaciones de otros niños no aparecen (filtro por `kidId`).

**Out of scope (para futuras specs):**

- Envío real de correo, activación de la cuenta con el código (flujo de SPEC 03), cambio pending→active.
- Vincular padres en niños creados con SPEC 05 (no tienen página de perfil).
- Dedupe de email (se permiten invitaciones repetidas al mismo correo), editar/eliminar invitaciones, «Vence en 7 días» dinámico.
- Backend, BD, APIs, toasts, focus trap, responsive móvil.

## Modelo de datos

```ts
// app/lib/parent-invites.ts
export const PARENT_INVITES_STORAGE_KEY = "opendaycare:parent-invites:v1";
export type ParentInvite = {
  id: string; // crypto.randomUUID()
  kidId: string; // "mateo", "sofia", …
  name: string;
  email: string;
  relation: string; // "Mamá" | "Papá" | "Tutor/a"
  code: string; // 5 chars, ej. "7K4P9"
  createdAt: string; // ISO
};
export type InviteFormValues = {
  name: string;
  email: string;
  relation: string;
};
export type InviteFormErrors = { name?: string; email?: string };
```

Persistencia: array JSON de `ParentInvite` bajo `PARENT_INVITES_STORAGE_KEY`. Sin migración — la clave termina en `:v1`. El tipo `LinkedParent` de `app/data/kids.ts` no cambia; los invitados se derivan con `buildParentFromInvite()`.

## Plan de implementación

1. Crear `app/lib/parent-invites.ts` (tipos, storage espejo de `kids.ts`, `generateInviteCode`, `validateInviteForm`, `buildParentFromInvite`). Manual: sin UI aún; lint/build limpios.
2. Crear `app/components/LinkParentModal.tsx`: trigger + modal fiel al mockup con campos controlados, pills, código generado al abrir, validación al enviar y cierre por X/Esc/overlay. Manual: lint/build; se visualiza en el paso 3.
3. `LinkedParentsCard.tsx` → client: props `kidId`/`kidName`, `useSyncExternalStore` para invitaciones, merge estáticos + derivadas (filtro `kidId`), reemplazo del `<a>` por el trigger del modal y `handleSend` → `saveStoredInvites([...stored, invite])`. Manual: abrir perfil de Mateo, pulsar «Vincular otro padre», enviar formulario válido → aparece PENDIENTE al final.
4. `app/kids/[id]/page.tsx`: pasar `kidId` y `kidName`. Manual: F5 → el padre invitado persiste; el perfil de Sofía no lo muestra.
5. Verificar: `npm run lint` (sin errores nuevos), `npm run build`, dev server y capturas Playwright en `.playwright-mcp/` (modal abierto contra `vincular-padre.dc.html` renderizado, caso con errores de validación, envío exitoso, lista tras F5).

## Criterios de aceptación

- [x] `npm run lint` no agrega errores (los 2 preexistentes de `support.js` siguen siendo los únicos) y `npm run build` completa sin errores.
- [x] El click en «Vincular otro padre» abre el modal con overlay y fondo sin scroll; X, Esc y click en overlay cierran; un click dentro del card no.
- [x] El modal replica el mockup: header con título + «a {nombre}» + X, callout azul, labels/placeholders exactos, pills con Mamá seleccionada, caja dashed amarilla y CTA naranja con ícono send.
- [x] El código mostrado tiene 5 caracteres y cambia en cada reapertura del modal.
- [x] Enviar con nombre vacío o email vacío/mal formado muestra error en línea (borde `#D9583C` + mensaje 12px) y el modal no cierra.
- [x] Enviar con datos válidos cierra el modal y agrega el padre al final de PADRES VINCULADOS: initial, «{parentesco} · invitación enviada» y badge PENDIENTE, con color de avatar de la paleta rotada.
- [x] Tras F5 el padre invitado persiste en `opendaycare:parent-invites:v1` sin duplicarse y no aparece en el perfil de otro niño.
- [x] Reabrir el modal muestra campos vacíos (Mamá seleccionada) y un código nuevo.
- [x] Captura 1280×800 del modal abierto coincide con `vincular-padre.dc.html` renderizado en layout, colores, tipografía y espaciados.
- [x] El card del modal tiene `role="dialog"`, `aria-modal="true"` y `aria-label="Vincular padre"`.

## Decisiones

- **Sí:** modal sobre el perfil. Elección del usuario; mismo precedente que SPEC 04 (mockup de página → modal), la página del perfil sigue cacheada y el cambio queda contenido en client components.
- **Sí:** persistencia en localStorage con clave propia `opendaycare:parent-invites:v1` (no en `opendaycare:kids:v1`). Los 8 niños estáticos viven en `app/data/kids.ts` del lado server; guardarlos completos en kids storage duplicaría sus tarjetas en `/kids` (KidsBoard concatena estáticos + stored). Elección del usuario (con persistencia).
- **Sí:** `useSyncExternalStore` con snapshot de server vacía para hidratar invitaciones. Patrón real de SPEC 05 (`KidsBoard`); primer render idéntico al server.
- **Sí:** código aleatorio por apertura, alfabeto sin caracteres ambiguos (sin 0/O/1/I). Elección del usuario; generado en el handler de apertura → cero riesgo de hidratación.
- **Sí:** Mamá preseleccionada y «Vence en 7 días» literal. Paridad exacta con el mockup (criterio de captura).
- **Sí:** avatar del invitado rotando los 5 fondos existentes de padres (total % 5). Determinístico, sin colores nuevos.
- **Sí:** validación al intentar enviar + errores en línea, mismo estilo que `AddKidModal`. Patrón SPEC 05.
- **No:** dedupe por email. Se admiten repeticiones (simplicidad, consistente con SPEC 05 que no deduplica niños).
- **No:** correo real / activación con código / cambio a ACTIVA. El flujo de SPEC 03 queda desacoplado; va en su propia spec si llega.
- **No:** toast de éxito; la señal es el nuevo renglón PENDIENTE en la lista.

## Riesgos

| Riesgo                                       | Mitigación                                             |
| -------------------------------------------- | ------------------------------------------------------ |
| localStorage deshabilitado (modo privado)    | try/catch → fallback a memoria, la app no rompe        |
| Hidratación: storage solo existe en cliente  | `useSyncExternalStore` con snapshot de server `[]`     |
| Colisión de keys React con nombres repetidos | El invitado lleva `id` (randomUUID) como key           |
| Niños de SPEC 05 sin página de perfil        | Aceptado: el trigger solo existe en perfiles estáticos |

## Lo que **no** está en esta spec

- Correo real, activación con el código, estado ACTIVA, dedupe, edición/eliminación de invitaciones.
- Vincular padres en niños nuevos de SPEC 05.
- Backend/BD/APIs, toasts, focus trap, responsive móvil.

Cada una de esas, si llega, va en su propia spec.
