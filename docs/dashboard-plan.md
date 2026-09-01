# Plan — Riva Bike Dashboard: panel privado del taller

> Plan para aprobar antes de generar (modo diseño). El brief es de OpenDesign,
> así que el layout tiene libertad creativa; lo fijo es la marca y estas 3
> pantallas. Fuente: `opendesign-brief-dashboard.md`.

## Artifact

- Archivo **nuevo y aparte** de `riva-bike-landing.html`.
- Nombre semántico: `riva-bike-dashboard.html`.
- Identidad visual = la de la landing (tokens de `design-references.md`).

---

## 1. Tokens y lenguaje visual (reutilizados)

| Token      | Hex       | Uso |
|------------|-----------|-----|
| `ink`      | `#0A0A0A` | fondos oscuros (navbar/sidebar, total-bar), texto |
| `paper`    | `#FFFFFF` | fondo base, texto sobre oscuro |
| `pink`     | `#EF7D97` | acento (badges, estados, hover secundario) |
| `pink-deep`| `#E8546F` | precios destacados, CTA hover, focus ring |

Grises: derivar de `ink`/`paper` con opacidad, no inventar grises de sistema.

Tipografía: **Archivo** (display) + **Inter** (body). Copia en es-ES.

Lenguaje visual de `html_ejemplo.html` (patrón, no su layout):
- Cards con borde fino, `radius` ~14px.
- Price-rows: nombre a la izquierda, precio en rosa a la derecha.
- Total-bar oscuro con monto en rosa grande.
- Botones tipo píldora (`border-radius` completo).

---

## 2. Pantalla 1 — Shell + Inicio

**Nav (mobile-first):** bottom-bar en mobile (fijo abajo, accesible con el
pulgar, max 5-6 ítems) + sidebar lateral en desktop. Ítems:
Inicio · Trabajos/Servicios · Inventario · Presupuestos/Órdenes ·
Galería · Contenido del sitio · Configuración.

**Inicio:** resumen simple para el tallerista parado:
- Tarjetas/indicadores grandes y tocables: órdenes pendientes, alertas de
  stock bajo, trabajo en curso, facturación del mes (2-3 métricas de ejemplo
  son suficientes).
- Acceso directo al flujo más usado: botón píldora grande "Nueva orden".

**Marcadores de edición:**
- `TODO[shell-nav]`: bottom-bar mobile + sidebar desktop; estados activos.
- `TODO[home-cards]`: grid de indicadores + atajo a nueva orden.

---

## 3. Pantalla 2 — Inventario

**Tabla/listado** con columnas: Producto · Stock · Precio · Estado ·
Último movimiento · Acciones.

- En mobile la tabla se convierte en cards apiladas (filas apretadas no son
  legibles de a pie).
- **Estado de stock con doble canal** (no solo color): color + texto/ícono —
  ej. badge "Stock bajo" ámbar/"Sin stock" rojo + número visible.
- Datos de ejemplo: repuestos típicos (cámaras, cubiertas, cables, pastillas
  de freno, cadenas…).
- Acciones: tocar una fila abre detalle/ajustar stock.

**Marcador de edición:**
- `TODO[inventory-table]`: listado responsive + estado de stock texto+color.

---

## 4. Pantalla 3 — Nueva orden (wizard)

Flujo en pasos secuenciales, **cómodo con una sola mano**:
1. Datos del cliente.
2. Datos de la bici.
3. Elegir servicios (lista tipo la de la landing).
4. Agregar repuestos del inventario.
5. Observaciones.
6. Resumen con subtotales y total antes de guardar.

- Barra de progreso de pasos (simple, no decorativa).
- Paso 6: total-bar oscuro con resumen de ítems y total.
- Reinicios/volver atrás con el pulgar.

**Marcador de edición:**
- `TODO[order-wizard]`: 6 pasos + progreso + resumen/total.

---

## 5. No mockear todo

Solo las 3 pantallas de arriba quedan construidas de verdad. El resto de
secciones del nav se deja como accesos (placeholder) — los patrones de UI
(tabla, indicadores, formulario, wizard) quedan cubiertos por las 3 fijas.

---

## Duda abierta (resuelta)

- **Navegación mobile: bottom-bar fija** (elegido por el usuario). La barra
  inferior queda fija abajo, accesible con el pulgar, con un ítem central
  "Nueva" que destaca la acción principal. En desktop se usa la sidebar
  lateral.

---

## Próximo paso (estado anterior)

✅ Generado `riva-bike-dashboard.html` con las 3 pantallas fijas, identidad de
la landing, mobile-first y bottom-bar.

---

# Refinamiento — segunda iteración (en curso)

Mejoras pedidas por el dueño después de revisar la primera generación.

---

## 6. Skeletons para TODAS las secciones

Hoy `Contenido del sitio` y `Configuración` quedaron como placeholders
(`.notice`). El pedido: **todas las secciones deben verse con skeleton real**,
no un aviso genérico de "pendiente".

- **Contenido del sitio**: listado de textos editables de la landing
  (hero, servicios, reseñas, contacto) con fila por bloque: nombre + estado +
  acción "editar". Cada bloque editable.
- **Configuración**: grupos de ajustes (datos del negocio, medios de pago,
  preferencias) con campos y switches (`input`/`switch`).
- Revisar que **Trabajos/Servicios, Presupuestos y Galería** (que ya tienen
  mockup) mantengan densidad coherente.

---

## 7. Bottom-bar deslizable en mobile (drawer de una sola fila)

Hoy la bottom-bar muestra solo 5 ítems fijos (Inicio, Inventario, Nueva,
Órdenes, Más) y las categorías restantes (Servicios, Galería, Contenido,
Config) no son accesibles en mobile.

**Decisión del dueño:** **una sola fila deslizable tipo drawer** con todas las
categorías. La barra es un contenedor de desplazamiento horizontal (drawer)
que muestra TODAS las categorías en una sola fila, desplazable al deslizar.

- **Ítems (una fila, en este orden):** Inicio · Trabajos/Servicios ·
  Inventario · Presupuestos/Órdenes · Galería · Contenido · Configuración.
- **Acción primaria `Nueva`** como chip acentuado al inicio de la fila.
- Interacción: **deslizar la fila horizontalmente** (`overflow-x`) para ver
  todas las categorías; cada ítem navega a su pantalla (`data-screen`).
- Implementación: `.bb-scroll` (flex + scroll horizontal sin scrollbar) con
  `.bb-item` de ancho fijo; estados activos con `aria-current="page"`.

**Estado:** ✅ aplicado en `riva-bike-dashboard.html`.

---

## 8. Modales para expandir / editar

Implementar un sistema de **modales** reutilizable para abrir detalle y
edición desde las listas, sin navegar a otra pantalla:

- **Modal editar servicio** (desde Trabajos/Servicios): nombre, descripción,
  precio, activo/inactivo.
- **Modal ajustar stock / editar producto** (desde Inventario): producto,
  stock actual, precio, min. — con botón "guardar".
- **Modal detalle de orden** (desde Presupuestos): resumen de ítems + total
  (reusa total-bar) y acciones.
- **Modal editar bloque de contenido** (desde Contenido): texto editor simple.
- Patrón común: overlay oscuro + card centrada (en mobile a lo ancho, fija
  abajo tipo sheet), fondo con blur, botón cerrar, `:focus-visible`, cierre
  con Esc, `aria-modal`. Animación fade/translate suave; respetar
  `prefers-reduced-motion`.

**Marcadores:**
- `TODO[modal-system]`: overlay + sheet + cierre (Esc/click fuera/btn).
- `TODO[modal-svc]`, `TODO[modal-inv]`, `TODO[modal-orden]`,
  `TODO[modal-content]`.

**Estado: ✅ aplicado en `riva-bike-dashboard.html` (§10).**

---

## Datos / comportamiento a mantener

- Estado por `data-*` + `localStorage` cuando aporte (ej. persistir el estado
  de edición y el ítem abierto), sin romper el flujo actual del wizard.
- Mobile: modales a lo ancho (sheet inferior); desktop: card centrada.

---

## Duda abierta para el dueño

- ~~¿Bottom-bar con **2 filas** o **panel drawer** con todas las categorías?~~
  → **Resuelto:** una sola fila deslizable (drawer) con todas las categorías
  (aplicado en `riva-bike-dashboard.html`).

---

## Notas de refinamiento aplicadas

- **Navbar superior:** se reemplazó la marca actual (círculo "R" +
  "Riva Bike" + "Panel del taller") por el **mismo logo de la landing**
  (`Riva<em>.</em>Bike` con `.tbrand` / `.tbrand em` en rosa); se mantiene el
  botón "Cerrar sesión" y el logo navega a Inicio.
- **Bottom-bar mobile:** ahora es un **drawer de una sola fila deslizable**
  con todas las categorías (+ acción `Nueva`).
- **Pendiente:** §8 modales (no incluido en este refinamiento).

---

## 9. Polish de publicación (audit + fixes directos)

Revisión estática de accesibilidad y consistencia sobre `riva-bike-dashboard.html`:

- **`:focus-visible` amplio:** cobertura global para `.btn`, `.chip`, `.bb-item`,
  `.qty-btn`, `.pick-item`, `.step-chip`, `.row-action`, `.theme-btn`,
  `.logout-btn`, `.snav a/button`, links del topbar y `a`/`button`; ring
  `--accent-strong` 2px + offset, sin forzar `border-radius` (permite
  `pick-item`/`row-action` cuadrados). Se añadió foco visible específico al
  `input` de búsqueda (hoy tenia `outline:none`).
- **Logo topbar hover:** antes era no-op (`color: var(--fg)`); ahora feedback
  visible con `--accent-strong`.
- **Estado vacío del inventario:** cuando búsqueda/filtros no devuelven filas se
  muestra mensaje "Sin resultados" + botón "Limpiar filtros" (en tabla y cards
  mobile).
- **`prefers-reduced-motion`:** regla global añadida (anima/transición/scroll
  reducidos).
- **Touch targets (mobile):** `.search` (42→44px) y `.chip` (34→44px) cumplen
  objetivo táctil mínimo; `.qty-btn` del stepper (34→40px) para no romper el
  layout de la fila del pick-list. Bottom-bar ya en 52px.

**Verificado:** tag balance OK (div 253/253, button 35/35, nav 2/2, section 8/8…);
100% de tags balanceados. Hover/focus auditados — ningún estado baja contraste.
Render 1× ejecutado (`dashboard-polish-2.png`, 155933 bytes, éxito; no
inspeccionable inline → verificación por revisión estática del layout).

---

## 10. Sistema de modales (§8, aplicado)

Sistema reutilizable en `riva-bike-dashboard.html`:

- **Patrón común:** `.modal-overlay` (fixed, backdrop oscuro + blur, `opacity`/
  `visibility`) + `.modal-sheet` (card). Desktop: centrado, `max-width:460px`,
  `transform: translateY(12px) scale(.98)` de entrada. Mobile (<640): sheet a lo
  ancho, anclado abajo (`align-items:end`), `translateY(100%)` de entrada.
- **Cierre:** botón `.modal-close`, click fuera (`e.target === overlay`) y tecla
  `Escape`; foco devuelto al elemento que abrió (`lastFocus`).
- **A11y:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `hidden`
  inicial con regla explícita `.modal-sheet[hidden]{display:none}` (evita que el
  `display:flex` ignore `[hidden]`), autorfocus del primer control.
- **Cuatro modales:**
  - `#modalSvc` — nuevo/editar servicio (nombre, descripción, precio, switch
    activo). Dispatch desde "Nuevo servicio" y `.sv-edit` de Trabajos.
  - `#modalInv` — ajustar stock (categoría, precio, min., stepper −/+). Abre
    desde la fila de tabla y desde el card mobile (`[data-inv]` = índice global
    de `INVENTORY`); al guardar actualiza y re-render. **Fix:** el índice usa
    `INVENTORY.indexOf` (no el de la fila filtrada) para que funcione con
    búsqueda/filtros activos.
  - `#modalOrd` — detalle de orden (cliente, estado, lista de ítems, total-bar
    reusado). Abre al tocar una fila (`.ord-row` con `cursor:pointer` + hover).
  - `#modalContent` — editar bloque de texto; la pantalla Contenido ahora muestra
    bloques reales (hero, servicios, nosotros, contacto) en vez del placeholder.

**Verificado:** tag balance ALL BALANCED; JS del IIFE pasa `node --check`
(sintaxis OK); `.modal-sheet[hidden]` y selectores `.sv-edit:not([data-content])`
desambiguados. No se repitió export de render.

---

## Próximo paso

§8 modales y polish §9/§10 aplicados. Queda disponible: revisar en el preview
la experiencia de los modales y ajustar sutilmente los que haga falta.
