# Prompt · Frontend (React / Vite / TypeScript)

> Sesión de OpenCode dedicada **solo a `src/`**. Se puede correr en paralelo
> con `docs/opencode-prompt-2-backend.md` (sesión distinta, ya ejecutada y
> cerrada), ya que ambas se construyen contra `docs/data-contract.md`.
> Requiere que `docs/opencode-prompt-1-project-setup.md` ya esté aplicado
> (repo scaffoldeado con Vite + TS + Tailwind + pnpm).

---

Actuás como **arquitecto frontend senior, especializado en React + TypeScript
+ Tailwind, y en UX/UI de producto**, sobre el repositorio **rivabike**. Tu
alcance en esta sesión es **exclusivamente `src/`**. No tocás Supabase
(migraciones, RLS, Storage, RPCs): eso ya está implementado, auditado y
cerrado en una sesión de Backend separada. No necesitás credenciales reales
de Supabase para completar esta sesión — trabajás con datos mock.

## Fuentes de verdad (en este orden de autoridad)

1. **`docs/AGENT.md`** — reglas de negocio y filosofía del proyecto. Para
   esta sesión importan especialmente las secciones 3–10 (stack, UI,
   animaciones), 9–15 (landing pública), 16–19 (autenticación), 23
   (dashboard), 50–54 (UX, responsive, accesibilidad, performance), 64–68
   (formulario de nueva orden, UX de catálogo/inventario).
2. **`docs/data-contract.md`** — la forma exacta de cada entidad, cada RPC y
   cada hook de TanStack Query. Implementá exactamente esos nombres y esas
   firmas, no una versión "parecida". La arquitectura **mock-first** que
   describe (`*.mock.ts` / `*.supabase.ts` / `index.ts` conmutado por
   `VITE_USE_MOCKS`) es obligatoria para toda función de acceso a datos que
   aparezca en ese documento.
3. **Los 5 archivos HTML entregados por OpenDesign** (`riva-bike-404.html`,
   `riva-bike-login.html`, `riva-bike-forgot.html`, `riva-bike-landing.html`,
   `riva-bike-dashboard.html`) + `DESIGN-MANIFEST.json` + `DESIGN-HANDOFF.md`
   — son el **contrato visual**. Tratalos como un contrato: si una elección
   de implementación entra en conflicto, priorizá igualar los píxeles y el
   comportamiento exportado, y después refactorizá internamente. No
   reinterpretes el diseño con "buen gusto propio" — extraé, no inventes.

Cuando el contrato visual (punto 3) y el contrato de datos (punto 2) piden
cosas que no coinciden exactamente (un campo que el mockup muestra pero la
tabla real no tiene, por ejemplo), **no improvises un campo nuevo en el
backend ni inventes una columna** — resolvé según la sección 8
("Traducción mockup → contrato de datos") de este documento, que ya
identificó cada uno de esos casos.

---

## 1. Reglas no negociables

* **Mobile-first siempre.** Verificar sin scroll horizontal en la matriz de
  viewports de `DESIGN-MANIFEST.json`: 360×800, 390×844, 430×932, 600×960,
  820×1180, 1024×768, 1366×768, 1440×900, 1920×1080.
* **Tokens de diseño exactos** (sección 3 de este documento) — no sustituir
  por colores/tipografía por defecto de ningún framework. El dark mode se
  activa con `[data-theme="dark"]` en `<html>` (no la estrategia `class`
  típica de Tailwind) — persistido en `localStorage('riva-theme')` y con
  `prefers-color-scheme` como valor inicial, igual que en los 5 HTML.
* **Arquitectura mock-first obligatoria** para toda función listada en
  `data-contract.md`: `src/features/<feature>/api/{fn}.mock.ts`,
  `{fn}.supabase.ts` (stub `throw new Error('not implemented')`),
  `index.ts` (conmuta por `VITE_USE_MOCKS`). Construís **toda** la UI contra
  los mocks. `.env.example` debe traer `VITE_USE_MOCKS=true`.
* **react-router-dom** para rutas. Cada pantalla de `riva-bike-dashboard.html`
  (`data-screen`) se convierte en su propia ruta anidada bajo `/dashboard`,
  no en un `div` que se esconde por estado — ver sección 6.
* **TanStack Query** para todo dato remoto (mock o real, da igual). Nunca
  `useEffect` + `fetch` manual para esto.
* **react-hook-form + zod (+ `@hookform/resolvers`)** para todo formulario:
  login, recuperar contraseña, wizard de nueva orden, edición de servicio,
  ajuste de stock, configuración del sitio, contacto.
* **Motion** solo donde el mockup ya anima algo con intención (reveal on
  scroll del hero/secciones, entrada de modales, hover de cards). Nunca
  agregar animación nueva que el mockup no tenga. `prefers-reduced-motion`
  siempre respetado (ya está resuelto a nivel CSS global en los 5 HTML —
  preservar esa regla).
* **TypeScript estricto, cero `any`.** Los tipos de `data-contract.md` van
  literales en `src/types/`.
* **Accesibilidad preservada, no inventada de cero:** los 5 HTML ya
  resolvieron `:focus-visible`, `aria-modal`, `role="dialog"`,
  `aria-labelledby`, `aria-current="page"`, `aria-pressed`, devolución de
  foco al cerrar modales, navegación por teclado del slider antes/después
  (`ArrowLeft/ArrowRight/Home/End`). Portá ese comportamiento exacto a los
  componentes React, no lo simplifiques.
* **No agregar dependencias nuevas sin justificar** (AGENT.md sección 3).
  Ver sección 9 de este documento: la lista cerrada de librerías alcanza
  para todo, incluyendo el carrusel de imágenes y el slider antes/después
  (Pointer Events nativos, tal como ya están resueltos en el HTML — no
  hace falta Embla, Swiper, ni react-compare-slider).
* **Nombres de archivo/carpeta en kebab-case o el patrón que ya define
  `data-contract.md`** (`listServices.mock.ts` tal cual, camelCase para las
  funciones). No renombrar el patrón.

---

## 2. Qué NO hacer

* No tocar `supabase/`, no crear migraciones, no invocar la API de
  administración de Supabase.
* No completar ningún `*.supabase.ts` real — quedan como stub. Eso lo hace
  la sesión de Integración (`opencode-prompt-4-integration.md`).
* No apagar `VITE_USE_MOCKS`.
* No conectar la Google Places API real ni pedir la API key — esa pieza
  se resuelve aparte, más adelante, por decisión explícita del dueño del
  proyecto. `useGoogleReviews()` se implementa igual (mock primero, stub
  después), simplemente no se activa todavía.
* No inventar copy de marketing genérico. Los 5 HTML ya traen copy real en
  es-AR (hero, testimonios, servicios, condiciones) — reutilizalo tal cual,
  no lo reemplaces por texto placeholder.

---

## 3. Design tokens (extraídos de `riva-bike-404.html`, fuente congelada)

Van como variables CSS globales en `src/styles/tokens.css` (importado una
sola vez), y el `tailwind.config` referencia esas variables — **no**
hardcodear hex en `tailwind.config`, así el toggle de tema no requiere
recompilar clases.

```css
:root {
  --ink: #0A0A0A;
  --paper: #FFFFFF;
  --pink: #EF7D97;
  --pink-deep: #E8546F;

  --bg: var(--paper);
  --surface: #FFFFFF;
  --surface-2: color-mix(in oklch, var(--ink) 4%, var(--paper));
  --fg: var(--ink);
  --muted: color-mix(in oklch, var(--ink) 62%, var(--paper));
  --border: color-mix(in oklch, var(--ink) 14%, var(--paper));
  --accent: var(--pink);
  --accent-strong: var(--pink-deep);
  --on-accent: var(--paper);
  --accent-soft: color-mix(in oklch, var(--accent) 16%, transparent);
  --fg-soft: color-mix(in oklch, var(--fg) 6%, transparent);
  --ink-soft: color-mix(in oklch, var(--ink) 94%, var(--paper));
  --shadow: color-mix(in oklch, var(--ink) 24%, transparent);

  --ok-bg: color-mix(in oklch, #2E9E5B 14%, transparent);
  --ok-fg: #1F7A45;
  --danger-bg: color-mix(in oklch, #D13C3C 14%, transparent);
  --danger-fg: #B43030;

  --font-display: 'Archivo', 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace;

  --radius: 10px;
  --radius-lg: 14px;
  --gutter: 24px;
  color-scheme: light;
}

html[data-theme='dark'] {
  color-scheme: dark;
  --bg: #0B0B0E;
  --surface: #141419;
  --surface-2: #1B1B22;
  --fg: #F5F5F7;
  --muted: color-mix(in oklch, var(--paper) 66%, transparent);
  --border: color-mix(in oklch, var(--paper) 16%, transparent);
  --accent: #F48BA5;
  --accent-strong: #FFA3B8;
  --on-accent: #1A0B0F;
  --accent-soft: color-mix(in oklch, var(--accent) 24%, transparent);
  --fg-soft: color-mix(in oklch, var(--fg) 7%, transparent);
  --ink-soft: color-mix(in oklch, var(--paper) 10%, transparent);
  --shadow: color-mix(in oklch, #000000 60%, transparent);

  --ok-bg: color-mix(in oklch, #3ECB78 16%, transparent);
  --ok-fg: #5FDE95;
  --danger-bg: color-mix(in oklch, #FF6B6B 18%, transparent);
  --danger-fg: #FF8A8A;
}
```

Reglas globales a preservar tal cual (van en el mismo archivo o en
`src/styles/base.css`): `::selection { background: var(--accent-strong) }`,
`:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }`,
y el bloque `@media (prefers-reduced-motion: reduce)` que anula duraciones de
animación/transición a `0.001ms`.

**Tipografía:** Google Fonts `Archivo` (400/500/600/700) + `Inter`
(400/500/600), cargadas con `preconnect` igual que en los 5 HTML.

**Radios:** `--radius` 10px (inputs/cards chicos), `--radius-lg` 14px (cards
grandes/paneles), `999px` (botones tipo píldora, chips, theme-toggle —
círculo perfecto).

**Motion:** transiciones de botones/inputs en `0.18s–0.2s ease`; animación
`wheelSpin` (rueda decorativa, 22s–40s `linear infinite`, dirección
alternada); entrada de modal `transform: translateY(...) scale(...)` →
`translateY(0) scale(1)`.

---

## 4. Estructura de carpetas (AGENT.md sección 6, aplicada)

```text
src/
├── app/
│   ├── router/           # createBrowserRouter, definición de rutas (sección 6)
│   ├── providers/        # QueryClientProvider, AuthProvider, ThemeProvider
│   └── config/
├── components/
│   ├── ui/                # Modal, Button, Input, Textarea, Field, Chip,
│   │                       # ThemeToggle, StatusBadge genérico, PriceRow,
│   │                       # TotalBar, StepWizard, Skeleton, EmptyState
│   ├── layout/             # PublicLayout (nav+footer), DashboardShell
│   │                       # (Topbar+Sidebar+BottomBarDrawer)
│   ├── forms/               # campos reutilizados entre formularios
│   ├── landing/             # Hero, Nosotros, ComoTrabajamos, Opiniones,
│   │                       # ServiciosGrid, ServiceModal, TrabajosGaleria,
│   │                       # TrabajoModal, BeforeAfterSlider, ImageCarousel,
│   │                       # ContactoForm, ContactoMapa
│   └── dashboard/           # WorkOrderStatusBadge, InventoryStockBadge,
│                           # KpiCard, OrderRow, InventoryTable/Cards, etc.
├── features/
│   ├── auth/                # signIn/signOut/requestPasswordReset + useAuthStore
│   ├── landing/              # api/ de useSiteSettings, useGoogleReviews
│   ├── services/             # api/ + hooks de Service (públicos y admin)
│   ├── inventory/            # api/ + hooks de InventoryItem/StockMovement
│   ├── customers/            # api/ + useCustomerSearch
│   ├── work-orders/          # api/ + hooks de WorkOrder/WorkOrderDetail
│   ├── gallery/               # api/ + hooks de GalleryItem/GalleryImage
│   └── settings/              # api/ + hooks de SiteSettings admin
├── hooks/                    # hooks genéricos no atados a una feature
├── lib/
│   ├── supabase/              # client.ts (createClient<Database>), types.ts
│   │                         # (ya generado por Backend)
│   ├── google/                 # wrapper del Maps JS API (browser key)
│   └── utils/                  # fmt() moneda es-AR, fechas, etc.
├── pages/                     # componentes de página que arma el router
├── types/                     # tipos literales de data-contract.md
├── schemas/                   # esquemas zod (uno por formulario)
└── styles/                    # tokens.css, base.css
```

---

## 5. Rutas (`react-router-dom`)

```text
/                              → Landing (pública)
/login                         → Login
/olvide-password               → Forgot password
/dashboard                     → redirige a /dashboard/inicio
/dashboard/inicio              → Inicio (KPIs, accesos rápidos)
/dashboard/servicios           → Trabajos / Servicios
/dashboard/inventario          → Inventario
/dashboard/ordenes             → Presupuestos / Órdenes
/dashboard/ordenes/nueva       → Wizard de nueva orden (6 pasos)
/dashboard/ordenes/:id         → Detalle de orden (hoy es un modal en el
                                  mockup; ver nota en sección 6.6 — se
                                  implementa como ruta real, no solo modal)
/dashboard/galeria             → Galería
/dashboard/contenido           → Contenido del sitio
/dashboard/configuracion       → Configuración
*                               → 404
```

Todo lo bajo `/dashboard/*` va envuelto en un `<ProtectedRoute>` que
redirige a `/login` si `useAuthStore().status !== 'authenticated'` (AGENT.md
sección 16). El shell (`DashboardShell`: topbar + sidebar desktop +
bottom-bar drawer mobile) es un layout route que envuelve todas las
sub-rutas, así el estado de "pantalla activa" lo maneja el router, no un
`data-screen` manual como en el HTML.

---

## 6. Descomposición en componentes

### 6.1 Páginas de acceso (404 / Login / Forgot)

Estas tres son casi 1:1 con el HTML, sin datos remotos complejos.

* **`pages/NotFoundPage.tsx`** — usa `components/ui/ThemeToggle`, layout
  centrado con las dos ruedas decorativas (`bg-wheel`) como SVG/CSS puro.
* **`pages/LoginPage.tsx`** — layout split (`brand-panel` desktop / oculto
  <920px) + `LoginForm` (`components/forms/LoginForm.tsx`) con
  react-hook-form + zod (`schemas/login.schema.ts`: email + password
  requeridos, email válido). Al enviar, llama a
  `features/auth/api/signIn` (Supabase Auth real — ver sección 7, esto NO
  es mock-first). Mostrar/ocultar contraseña con estado local (`useState`),
  igual que `show-pwd` del HTML. Mensaje de estado con `role="status"
  aria-live="polite"` (`form-msg`), success → redirige a `/dashboard`.
* **`pages/ForgotPasswordPage.tsx`** — mismo layout, un solo campo email,
  llama a `features/auth/api/requestPasswordReset`. El mensaje de éxito no
  debe confirmar ni negar si el correo existe (buena práctica ya reflejada
  en el copy del HTML: "Si el correo existe, vas a recibir un enlace…" —
  preservar ese texto exacto).

### 6.2 Landing pública (`pages/LandingPage.tsx`)

Una sola ruta, secciones ancladas por `id` (`#inicio`, `#servicios`,
`#trabajos`, `#contacto`), navegadas desde `components/layout/PublicLayout`
(navbar con estado `scrolled` + fondo con blur incluso en `top:0` — ver
`plan-riva-bike.md` punto 2 — y el bottom-sheet de menú mobile).

Componentes de sección (todos en `components/landing/`), en orden:

1. **`Hero`** — titular, rating (estrellas + valor, ver 6.2.1), 2 CTAs
   (`Solicitar presupuesto` → abre WhatsApp o scrollea a `#contacto`;
   `Ver nuestros trabajos` → `#trabajos`), imagen de bici. Reveal-on-mount
   con Motion. En mobile: reposicionar imagen según `plan-riva-bike.md`
   punto 1 (`TODO[hero-mobile]`, `TODO[hero-padding]`).
2. **`Nosotros`** — texto + 2 bullets ("Especialistas en bicis", "Trabajo
   con garantía").
3. **`ComoTrabajamos`** — 4 pasos (Traés tu bici → Diagnóstico y presupuesto
   → Reparación → Retirás tu bici). Es una secuencia real: los números
   numerados SÍ están justificados acá (a diferencia de la advertencia
   genérica de `frontend-design.md` sobre 01/02/03 decorativos).
4. **`Opiniones`** — grid de 3 testimonios. Fuente de datos:
   `useGoogleReviews()` (`data-contract.md`). Mapeo directo, sin
   discrepancias: `rating` → estrellas, `text` → cita, `author_name` →
   nombre + inicial como avatar, `relative_time_description` → "hace 2
   semanas". Mientras `VITE_USE_MOCKS=true`, el mock debe devolver
   exactamente los 3 testimonios reales que ya están en el HTML (Matías R.,
   Carolina G., Facundo L. — copy literal, no lo reescribas). Estado
   `isLoading` → skeleton de 3 cards; `error` o `total_reviews === 0` →
   ocultar la sección entera (no mostrar un grid vacío).
5. **`ServiciosGrid` + `ServiceModal`** — grid de `Service[]` desde
   `useServices({ onlyActive: true })`. Cada card abre `ServiceModal` (ver
   6.2.2) con `ImageCarousel`.
6. **`TrabajosGaleria` + `TrabajoModal`** — grid de cards clicables (fotos
   de bicis) desde `useGalleryItems({ onlyPublished: true })`. Cada card
   abre `TrabajoModal` con `BeforeAfterSlider` (ver 6.2.3).
7. **`Contacto`** — info (WhatsApp/dirección/horarios desde
   `useSiteSettings()`) + `ContactoMapa` + `ContactoForm`.

Todas las secciones usan el patrón `reveal-section`/`reveal-item` (aparecen
al hacer scroll vía `IntersectionObserver`) — implementalo como un hook
`useRevealOnScroll()` reutilizable en `hooks/`, envuelto con Motion
(`whileInView`), respetando `prefers-reduced-motion`.

#### 6.2.1 Rating del hero

`hero-rating` en el HTML es texto estático ("★★★★★ 4.9 · +500 bicis
reparadas"). Conectalo también a `useGoogleReviews()` (mismo hook que
Opiniones) para que el número sea real y no quede desincronizado de la
sección de abajo; si `total_reviews === 0` (sin reseñas configuradas
todavía), usar el copy estático original como fallback en vez de mostrar
"0.0 · 0 reseñas".

#### 6.2.2 `ServiceModal` — atención, discrepancia con el contrato

El HTML muestra, por servicio: título, subtítulo, **3 imágenes**
(antes/durante/después en un carrusel), descripción, precio, **tiempo
estimado** (`tm`) y **"qué incluye"** (`ic`). El tipo `Service` del
contrato solo tiene **una** `imagen_url` y no tiene tiempo estimado ni
"incluye". Resolución (no se toca el backend, ya cerrado):

* El carrusel se arma con `[imagen_url]` (un solo slide) cuando el dato
  real solo trae una imagen — el componente `ImageCarousel` debe soportar
  1..N imágenes sin romperse (con 1 imagen, ocultar flechas/dots).
* "Tiempo estimado" e "incluye" **no se muestran** en la versión conectada
  a datos reales (no existen en el modelo) — sacalos del modal real, o
  dejalos como texto fijo genérico ("Consultanos el plazo estimado") si el
  hueco visual queda raro. No inventes columnas nuevas.
* El mock (`listServices.mock.ts`) sí puede tener 3 imágenes por prolijidad
  visual en desarrollo, pero el componente tiene que degradar bien a 1.

#### 6.2.3 `TrabajoModal` + `BeforeAfterSlider` — misma advertencia

El HTML muestra: nombre, subtítulo ("Taller · 2024"), descripción, **lista
de tareas realizadas** (`lst`), **precio referencial**, **tiempo**, y 2
imágenes (antes/después) para el slider arrastrable. `GalleryItem` +
`GalleryImage[]` del contrato traen: `titulo, descripcion, categoria,
fecha, publicado` + N imágenes (`storage_path`) — **sin precio, sin tiempo,
sin lista de tareas estructurada**. Resolución:

* `BeforeAfterSlider` recibe las 2 primeras `GalleryImage` del ítem como
  "antes"/"después" (si el ítem tiene menos de 2 imágenes, mostrar una sola
  foto estática sin slider, no romper).
* Precio/tiempo/lista de tareas: no existen en el modelo → sacarlos del
  modal conectado a datos reales, o degradarlos a texto libre dentro de
  `descripcion` si el dueño del taller decide escribirlos ahí a mano (es su
  decisión de contenido, no del componente).
* El slider en sí (`BeforeAfterSlider`, `components/landing/`) se porta
  **tal cual** el JS del HTML: `pointerdown/pointermove/pointerup` sobre un
  "handle", `clip-path: inset()` sobre la imagen "antes", soporte de
  teclado (`ArrowLeft/ArrowRight/Home/End`, paso de 5%), sin ninguna
  librería — es ~40 líneas de lógica ya resueltas en
  `riva-bike-landing.html` líneas 1620–1653.

#### 6.2.4 `ContactoForm`

El HTML tiene un `<form id="contacto-form">` con nombre/teléfono/mensaje
**sin ningún handler de envío real** (ni backend, ni tabla en
`data-contract.md` para esto). Resolución: el submit arma un mensaje
prellenado y abre `https://wa.me/543878224212?text=...` (`window.open`),
consistente con el copy ya existente ("Respondemos por WhatsApp…") y con
`AGENT.md` (no hay entidad `contact_messages` en el contrato — no se
inventa). Mostrar `form-status` con confirmación ("Te llevamos a WhatsApp
para enviar tu consulta") antes de redirigir, no un submit silencioso.

#### 6.2.5 `ContactoMapa`

Hoy es `.map-ph` (placeholder). AGENT.md sección 14 pide Google Maps
JavaScript API real, no un mapa falso. Implementalo en
`components/landing/ContactoMapa.tsx` usando `lib/google/` con la
`VITE_GOOGLE_MAPS_BROWSER_KEY`. Como con las reviews: si la env var no está
seteada (no la vamos a configurar en esta sesión), el componente debe
degradar con gracia a un placeholder con la dirección en texto + botón
"Cómo llegar" (link a Google Maps), nunca a una pantalla rota o un error en
consola visible al usuario.

### 6.3 `DashboardShell` (`components/layout/DashboardShell.tsx`)

* **Topbar:** logo (link a `/dashboard/inicio`) + botón "Cerrar sesión"
  (`signOut()` de `features/auth`).
* **Sidebar (desktop, ≥ el breakpoint del HTML):** los 7 links de nav +
  bloque de usuario (avatar con iniciales, nombre, `ThemeToggle`).
* **Bottom-bar drawer (mobile):** una sola fila con `overflow-x` scroll,
  las 7 categorías + chip "Nueva" acentuado al inicio, sin scrollbar
  visible, `aria-current="page"` en el ítem activo — portar tal cual
  `dashboard-plan.md` punto 7.
* El estado "activo" de cada link se deriva de `useLocation()` de
  react-router, no de una variable JS manual como en el HTML.

### 6.4 Dashboard · Inicio (`pages/dashboard/InicioPage.tsx`)

* **KPIs** (`components/dashboard/KpiCard`): órdenes pendientes, en
  ejecución hoy, alertas de stock, facturado del mes. Fuente:
  `useWorkOrders()` + `useInventoryItems()` combinados y derivados en el
  propio componente (no existe una RPC de agregación dedicada — calcular
  client-side: contar por `estado`, sumar `total` de órdenes `terminado`
  del mes actual, contar `inventory_items` con `stock_actual` bajo el
  umbral, ver 6.5). No es una limitación grave con el volumen de un taller
  chico, pero documentalo con un comentario en el código para que quede
  claro que es agregación client-side, no una vista de Postgres.
* **Órdenes recientes:** `PriceRow` por cada `WorkOrder` reciente (usar
  `customer.nombre` + primer `title_snapshot` de sus servicios como
  subtítulo).
* **Stock bajo:** lista de `InventoryItem` bajo el umbral (ver 6.5),
  cada fila con botón "Ver inventario".
* **Acciones rápidas:** botones a `/dashboard/inventario` y
  `/dashboard/ordenes`, más CTA grande "Nueva orden" → `/dashboard/ordenes/nueva`.

### 6.5 Dashboard · Inventario (`pages/dashboard/InventarioPage.tsx`)

* `InventoryTable` (desktop, `≥` breakpoint) / `InventoryCards` (mobile) —
  mismo dato, dos presentaciones, como ya resuelve el HTML. Columnas:
  Producto · Stock · Precio · Estado · Último movimiento · Acciones.
* Búsqueda (`search` input) + chips de filtro (Todos/Con stock/Stock
  bajo/Sin stock) — filtrado client-side sobre el resultado de
  `useInventoryItems()` (no hace falta ir al server por esto).
* **Discrepancia con el contrato — "Estado" y "Último movimiento":**
  `InventoryItem` no tiene columna `categoria` ni un umbral de stock bajo
  por ítem (`min` en el HTML). Resolución:
  * *Categoría:* no se muestra en la versión conectada a datos reales — no
    existe en el modelo. Si hace falta agrupar visualmente, es una mejora
    futura de backend (columna nueva), no algo que se resuelva inventando
    datos acá.
  * *Umbral de stock bajo:* usar una constante única de configuración de
    frontend (`LOW_STOCK_THRESHOLD`, ej. `5`) aplicada a todos los ítems
    por igual, en vez del `min` por producto del mockup. Documentar esa
    simplificación con un comentario; un umbral por producto real requiere
    una columna nueva en `inventory_items` (fuera de alcance de esta
    sesión).
  * *Último movimiento:* sí existe de verdad — viene de
    `useStockMovements({ inventoryItemId })`, tomar el más reciente por
    `created_at`.
* Tocar una fila abre un modal de ajuste de stock que en realidad son
  **dos acciones distintas** del contrato, no confundirlas:
  * Editar `nombre/descripcion/precio_unitario/imagen_url/activo` →
    `useUpdateInventoryItem()` (edición simple de catálogo).
  * Registrar una entrada/salida/ajuste de stock → `useRegisterStockMovement()`
    (cantidad + tipo + motivo). El backend audita esto — el modal debe
    dejar claro que esto es un *movimiento*, no una edición directa del
    número de stock (el propio backend bloquea el `UPDATE` directo de
    `stock_actual`, así que la UI tiene que ofrecer el flujo correcto desde
    el vamos).

### 6.6 Dashboard · Nueva orden — wizard de 6 pasos (`pages/dashboard/NuevaOrdenPage.tsx`)

Portar el wizard tal cual (`StepWizard` en `components/ui/`, con barra de
progreso `step-chip`/`step-connector`, botones Volver/Cancelar/Siguiente,
navegación con foco cómodo para pulgar en mobile). Un formulario
react-hook-form por el wizard completo (no un form por paso), con
`schemas/work-order-wizard.schema.ts` en zod, validado por paso antes de
avanzar (`trigger()` de RHF sobre los campos del paso actual).

**Discrepancia con el contrato — Paso 1 (Cliente) y Paso 2 (Bici):**

| Campo en el HTML | ¿Existe en el contrato? | Resolución |
|---|---|---|
| "Nombre y apellido" (1 campo) | `Customer` separa `nombre`/`apellido` | Partir en **dos** inputs (Nombre, Apellido) |
| Email | `Customer` no tiene email | Sacar el campo del formulario real |
| Teléfono | ✅ `telefono` | tal cual |
| Marca, Modelo, Color | ✅ en `Bicycle` | tal cual |
| Rodado | `Bicycle` no tiene este campo | Sacar el campo, o (si el dueño lo quiere) concatenarlo dentro de `modelo` (ej. "R29") — decisión de UX, documentar la que se tome |
| N° de chasis / detalle | `Bicycle` no tiene este campo | Sacar el campo del formulario real |

Antes de crear cliente/bici nuevos, el paso 1 debe ofrecer
`useCustomerSearch(query)` (autocomplete) para reutilizar un cliente
existente en vez de duplicarlo — así se pasa `customer.id` /`bicycle.id`
en el payload de `createWorkOrder` en vez de recrearlos (ver
`data-contract.md`, `customer: { id?: string; ... }`).

Paso 3 (Servicios) y Paso 4 (Repuestos): listas seleccionables
(`pick-list`/`pick-item`, patrón ya resuelto en el HTML) desde
`useServicesAdmin()` y `useInventoryItems({ onlyActive: true })`
respectivamente, con selección múltiple + cantidad. Paso 5:
observaciones + fecha estimada de entrega. Paso 6: resumen con
`TotalBar` (reusar el mismo componente visual del `html_ejemplo.html` de
referencia: barra oscura, monto grande en rosa) — el total mostrado es
**siempre** el que devuelve `createWorkOrder()` después de guardar, nunca
un cálculo del cliente que se muestre como definitivo (el backend
recalcula igual, pero la UI no debe insinuar que el número del paso 6 es
distinto de lo que se va a guardar).

Al confirmar → `useCreateWorkOrder()` → éxito: redirige a
`/dashboard/ordenes/:id` (el detalle recién creado). Error: mostrar el
mensaje del backend en el idioma de la UI (nunca el error crudo de
Postgres — envolver con un mensaje humano tipo "No se pudo guardar la
orden, intentá nuevamente").

### 6.7 Dashboard · Trabajos / Servicios (`pages/dashboard/ServiciosPage.tsx`)

Lista (`svc-row`) desde `useServicesAdmin()` (trae activos e inactivos,
ver `data-contract.md`). Botón "Nuevo servicio" + lápiz de editar por fila
→ mismo modal (`ServiceFormModal`, `components/dashboard/`) en modo
crear/editar, react-hook-form + zod, campos: título, descripción, precio
base, imagen (opcional), switch activo/inactivo →
`useCreateService()`/`useUpdateService()`/`useToggleServiceActive()`.

### 6.8 Dashboard · Presupuestos / Órdenes (`pages/dashboard/OrdenesPage.tsx` + `pages/dashboard/OrdenDetallePage.tsx`)

**Discrepancia con el contrato — estados:** el HTML muestra 3 badges
visuales ("Pendiente" / "En curso" / "Lista"), pero `WorkOrderStatus` tiene
**5** valores reales (`pendiente`, `aceptado`, `en_ejecucion`, `terminado`,
`rechazado`). No comprimir a 3 — construir `WorkOrderStatusBadge`
(`components/dashboard/`) con **5** variantes visuales, derivando color y
texto del token de acento existente (no inventar colores nuevos fuera de
la paleta):

| Estado | Texto sugerido | Tono |
|---|---|---|
| `pendiente` | Pendiente | neutro/`--muted` |
| `aceptado` | Aceptado | `--accent` |
| `en_ejecucion` | En curso | `--accent-strong` (el `.status.wip` del HTML) |
| `terminado` | Lista | verde (`--ok-fg`/`--ok-bg`) |
| `rechazado` | Rechazada | rojo (`--danger-fg`/`--danger-bg`) |

Lista con KPIs (En curso/Pendientes/Listas este mes — mismo criterio de
agregación client-side que 6.4) + `total-bar` con facturado del mes.
**Importante:** el mockup abre el detalle de orden en un modal
(`modalOrd`); en la implementación real, el detalle es su propia ruta
(`/dashboard/ordenes/:id`, ver sección 5) para que sea linkeable y
soporte volver atrás del navegador — mantené la misma composición visual
del modal (card centrada / sheet mobile) pero como contenido de página, no
como overlay. Ahí van los botones de transición de estado
(`useUpdateWorkOrderStatus()`, solo mostrando los botones de las
transiciones válidas de la tabla del contrato — nunca un botón que dispare
una transición inválida), la carga de fotos (`useUploadWorkOrderPhoto()`,
con selector de `tipo`: antes/durante/después) y, durante `en_ejecucion`,
el botón "Consumir repuesto" por cada `WorkOrderInventoryItem` sin
`consumed_at` (`useConsumeWorkOrderInventoryItem()`).

### 6.9 Dashboard · Galería (`pages/dashboard/GaleriaPage.tsx`)

Grid (`gal-item`) desde `useGalleryItemsAdmin()`. "Subir foto" →
`useCreateGalleryItem()` + subida a Storage (bucket `public-gallery`,
validar MIME/tamaño en el cliente también, aunque el backend ya lo valida
en política — doble validación, mejor UX de error temprano). Reordenar →
`useReorderGalleryItems()` (drag simple con Pointer Events, o botones
subir/bajar si el drag complica el alcance — decisión de la sesión, no
bloqueante).

### 6.10 Dashboard · Contenido del sitio (`pages/dashboard/ContenidoPage.tsx`)

**Discrepancia con el contrato:** el HTML lista 5 bloques editables
(hero-título, hero-subtítulo, presentación de servicios, "nosotros",
contacto), pero `SiteSettings` solo tiene `hero_eyebrow`/`hero_titulo`
como texto de hero editable, y `descripcion` genérica — no hay
`hero_subtitulo`, `svc_intro` ni un bloque de texto "nosotros" separado.
Resolución: esta pantalla edita **exactamente** los campos que
`SiteSettings` define (`hero_eyebrow`, `hero_titulo`, `descripcion`, y el
resto de campos de contacto/redes que ya viven ahí) vía
`useUpdateSiteSettings()`. No muestres filas editables para bloques que no
tienen columna real — mejor 4 filas reales que 5 con una rota.

### 6.11 Dashboard · Configuración (`pages/dashboard/ConfiguracionPage.tsx`)

El HTML no llegó a mockear esta pantalla (quedó como placeholder "Sección
pendiente"). Construila desde cero siguiendo el lenguaje visual del resto
del dashboard (cards, `field`/`input`, switches), con un formulario
completo mapeado **1:1** contra `SiteSettings`: nombre del negocio, logo,
teléfono, WhatsApp, dirección, email, horarios, Instagram, Facebook,
Google Place ID, Google Maps URL. Un solo `useUpdateSiteSettings()` al
guardar todo el formulario (no un save por campo).

### 6.12 Sistema de modales (`components/ui/Modal.tsx`)

Un único componente reutilizado por `ServiceModal`, `TrabajoModal`,
`ServiceFormModal` (dashboard) y `InventoryAdjustModal` (dashboard) — el
detalle de orden **no** usa este sistema, ver 6.8. Portar el patrón exacto
de `dashboard-plan.md` §10 y el JS de `riva-bike-landing.html`:

* Overlay fijo con backdrop + blur; sheet centrada en desktop
  (`max-width: 460px`), anclada abajo a lo ancho en mobile (`< 640px`).
* Cierre por botón, click en el overlay (no en la sheet), y `Escape`.
* `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al
  título.
* Foco al primer control interactivo al abrir; foco devuelto al elemento
  que lo abrió al cerrar (`lastFocus` pattern del HTML).
* Animación de entrada `translateY + scale`, respeta
  `prefers-reduced-motion`.
* Implementar con un portal a `document.body` (`createPortal`), no anidado
  en el árbol normal, para que el `z-index`/overlay funcionen sin
  sorpresas.

---

## 7. Autenticación — no sigue el patrón mock-first

`data-contract.md` no incluye login/logout/recuperar-contraseña en su lista
de hooks (son un caso aparte, no datos de negocio). El proyecto de
Supabase **ya existe, está auditado y tiene un usuario superadmin real**,
así que `features/auth/api/` se conecta **directo** a Supabase Auth desde
esta misma sesión (no hay mock ni stub acá):

```ts
// features/auth/api/signIn.ts
export async function signIn(email: string, password: string) { ... }
// features/auth/api/signOut.ts
export async function signOut() { ... }
// features/auth/api/requestPasswordReset.ts
export async function requestPasswordReset(email: string) { ... }
```

`app/providers/AuthProvider.tsx` expone `useAuthStore()` (Context, AGENT.md
sección 63 — no Redux, no Zustand, no hace falta acá) con
`{ session, user, status: 'loading' | 'authenticated' | 'unauthenticated', signIn, signOut }`,
suscripto a `supabase.auth.onAuthStateChange`. Todos los hooks privados de
`data-contract.md` llevan `enabled: status === 'authenticated'`, tal como
pide el propio contrato.

---

## 8. Traducción mockup → contrato de datos (resumen consolidado)

Esta tabla junta todas las discrepancias detectadas entre los 5 HTML y
`data-contract.md`, para no tener que ir a buscarlas sueltas por el resto
del documento:

| # | Pantalla | Campo/dato en el mockup | Estado en el contrato | Resolución |
|---|---|---|---|---|
| 1 | Modal de servicio | 3 imágenes (antes/durante/después) | `Service.imagen_url` es una sola | Carrusel soporta 1..N; con 1 imagen oculta flechas/dots |
| 2 | Modal de servicio | Tiempo estimado, "incluye" | No existen en `Service` | Sacar del modal conectado a datos reales |
| 3 | Modal de trabajo (galería) | Precio, tiempo, lista de tareas | No existen en `GalleryItem` | Sacar del modal, o degradar a texto libre en `descripcion` |
| 4 | Wizard paso 1 | "Nombre y apellido" en 1 campo | `Customer` separa `nombre`/`apellido` | Partir en 2 inputs |
| 5 | Wizard paso 1 | Email | `Customer` no tiene email | Sacar el campo |
| 6 | Wizard paso 2 | Rodado, N° de chasis | `Bicycle` no los tiene | Sacar, o concatenar rodado en `modelo` (decisión de UX) |
| 7 | Inventario | Categoría por producto | `InventoryItem` no tiene `categoria` | No mostrar; mejora futura de backend |
| 8 | Inventario | Umbral de stock bajo por producto (`min`) | No existe columna | Constante global `LOW_STOCK_THRESHOLD` en frontend |
| 9 | Presupuestos/Órdenes | 3 estados visuales | `WorkOrderStatus` tiene 5 | `WorkOrderStatusBadge` con 5 variantes (tabla en 6.8) |
| 10 | Presupuestos/Órdenes | Detalle en modal | — | Se implementa como ruta `/dashboard/ordenes/:id`, no modal |
| 11 | Contenido del sitio | 5 bloques editables | `SiteSettings` cubre hero (parcial) + descripción | Editar solo los campos reales existentes |
| 12 | Contacto (landing) | Formulario sin backend | No hay tabla `contact_messages` | Envía por WhatsApp (`wa.me`), no se persiste en DB |
| 13 | Contacto (landing) | Mapa placeholder | — | Google Maps JS API real con `VITE_GOOGLE_MAPS_BROWSER_KEY`, degrada a placeholder si falta la key |
| 14 | Home / Presupuestos | "Facturado este mes" | No hay RPC de agregación | Cálculo client-side sobre `useWorkOrders()` |

---

## 9. Librerías

Ya decididas en `AGENT.md` sección 78 — no se agrega nada fuera de esta
lista sin justificar explícitamente peso/mantenimiento/utilidad real
(sección 3):

* `react-router-dom` — rutas.
* `@supabase/supabase-js` — cliente (ya tipado con `Database` real, ver
  `docs/opencode-prompt-2-backend.md` paso 6).
* `@tanstack/react-query` — todo dato remoto, mock o real.
* `react-hook-form` + `zod` + `@hookform/resolvers` — todo formulario.
* `motion` — reveal on scroll, entrada de modales, microinteracciones ya
  presentes en el mockup. Nada más.
* Tailwind CSS — utilidades de layout/spacing/responsive; los tokens de
  color/tipografía vienen de `src/styles/tokens.css` (sección 3), no de
  paleta por defecto de Tailwind.

**Explícitamente NO se agregan** (todo esto ya está resuelto sin librería
en los 5 HTML, portarlo tal cual a React con Pointer Events / CSS nativo):
librería de carrusel (Embla/Swiper), librería de slider comparador
(react-compare-slider), librería de iconos (los SVG del mockup se portan
como componentes locales `components/ui/icons/`, son deliberadamente
simples y de la identidad de marca — un set genérico tipo lucide-react no
los reemplaza fielmente), librería de fechas (usar `Intl.DateTimeFormat`
nativo), librería de utilidades de className (template literals/ternarios
alcanzan para la densidad de este proyecto).

---

## 10. Mocks — usar los datos reales que ya trae el diseño

Los 5 HTML traen datos de ejemplo completos y coherentes en es-AR
(`SVC`, `TRABAJOS`, `INVENTORY`, `SERVICES`, `ORDERS` — están embebidos en
`riva-bike-landing.html` y `riva-bike-dashboard.html`). **Usalos como base
de los `*.mock.ts`**, adaptados a la forma exacta de cada tipo del
contrato (recortando los campos que no existen según la sección 8, no
inventando datos nuevos de cero). Esto mantiene la identidad de marca
(nombres de repuestos, precios en pesos argentinos realistas, copy) desde
el primer commit del frontend, sin esperar a la Integración. Simular
latencia real (`await new Promise(r => setTimeout(r, 300 + Math.random() * 400))`)
en cada mock, para que los estados `loading`/skeleton se vean y se prueben
de verdad durante el desarrollo.

---

## 11. Definición de terminado

Antes de cerrar esta sesión, verificar:

* [ ] Cada función de `data-contract.md` tiene su `*.mock.ts` +
      `*.supabase.ts` (stub) + `index.ts` conmutado por
      `VITE_USE_MOCKS`; `.env.example` trae `VITE_USE_MOCKS=true`.
* [ ] Cada hook de TanStack Query listado en `data-contract.md` está
      implementado con el nombre exacto.
* [ ] Las 10 pantallas (404, login, forgot, landing, + 8 del dashboard)
      renderizan sin scroll horizontal en los 9 viewports de
      `DESIGN-MANIFEST.json`.
* [ ] Dark mode funciona en las 10 pantallas vía `[data-theme="dark"]`,
      persistido y con `prefers-color-scheme` como valor inicial.
* [ ] Los 14 puntos de la tabla de la sección 8 quedaron resueltos como
      se indica, ninguno "pendiente".
* [ ] `WorkOrderStatusBadge` maneja los 5 estados reales, no 3.
* [ ] Rutas `/dashboard/*` protegidas, redirigen a `/login` sin sesión.
* [ ] Accesibilidad: focus visible en todo control interactivo, modales
      con foco atrapado y devuelto, navegación por teclado del slider
      antes/después, `aria-current`/`aria-pressed`/`aria-live` presentes
      donde el HTML original los tenía.
* [ ] `prefers-reduced-motion` respetado globalmente.
* [ ] Cero `any` en TypeScript; `tsc --noEmit` limpio.
* [ ] Ninguna dependencia fuera de la lista de la sección 9.
* [ ] Comparación visual final contra los 5 HTML originales — si algo no
      coincide y no está justificado en la sección 8, es una desviación a
      corregir, no una mejora de "buen gusto".
