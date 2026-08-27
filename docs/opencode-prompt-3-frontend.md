# Prompt · Frontend (UI completa, landing + dashboard)

> Sesión de OpenCode dedicada **solo a `src/`**. Se puede correr en paralelo
> con `docs/opencode-prompt-2-backend.md` (sesión distinta) porque ambas se
> construyen contra `docs/data-contract.md`. Requiere que
> `docs/opencode-prompt-1-project-setup.md` ya esté aplicado.

---

Actuás como desarrollador Full Stack React + especialista en UX/UI sobre el
repositorio **rivabike**. Tu alcance en esta sesión es **exclusivamente**
`src/` (componentes, páginas, features, hooks, estilos). **No creés
migraciones ni toqués nada de Supabase** — trabajás contra mocks siguiendo
`docs/data-contract.md`, para no depender de que el backend ya exista.

Fuente de reglas visuales: `docs/design-references.md`. Fuente de reglas
funcionales: `docs/AGENT.md` (secciones 9–15, 23–25, 29, 36, 39–40, 50–54,
62, 64–68). Fuente de la forma exacta de cada hook/mock:
`docs/data-contract.md` — implementá esos hooks con esos nombres y esas
firmas exactas.

## Reglas no negociables

* Package manager: **pnpm**.
* Datos remotos: **siempre** TanStack Query, nunca `fetch`/`useEffect`
  manual. Estado de cliente/UI: **Zustand** (wizards, filtros) — nunca
  Redux ni Context ad-hoc para esto.
* Seguí la convención mock-first de `docs/data-contract.md`: cada función de
  datos en `src/features/<feature>/api/`, con `*.mock.ts` implementado de
  verdad y `*.supabase.ts` como stub (`throw new Error('not implemented')`).
  `.env` con `VITE_USE_MOCKS=true`.
* TypeScript estricto, sin `any` sin justificar.
* **Mobile-first** en cada pantalla nueva, dashboard incluido — no solo la
  landing.
* Paleta: solo `ink` / `paper` / `pink` / `pink.deep` (ya en
  `tailwind.config.ts`).
* Animaciones con `motion`, sutiles, respetando `prefers-reduced-motion`.

## Opcional: OpenDesign para el Hero / landing

Si vas a iterar el diseño visual de la landing con **OpenDesign** antes de
codearla:

1. Apuntalo al repo `rivabike` — puede leer `tailwind.config.ts` /
   `src/index.css` y extraer los tokens `ink`/`paper`/`pink` en vez de que
   se los repitas.
2. Dale como referencias de intención los dos Figma de
   `docs/design-references.md` (secciones 3–4) y el resumen de patrones ya
   escrito ahí — no le pidas que copie textos ni activos de esos Figma.
3. El resultado de OpenDesign es HTML de exploración, no componentes React.
   Usalo para cerrar la dirección visual del Hero y del resto de secciones,
   y **después** portealo vos (o esta misma sesión de OpenCode) a
   `src/pages/LandingPage.tsx` + `src/components/landing/*`, conservando el
   sistema de tokens de Tailwind ya scaffoldeado — no seas literal con
   markup/CSS que no encaje con esa arquitectura.

Si preferís no usar OpenDesign, seguí `docs/design-references.md`
directamente como ya indicaba el Prompt 1.

## Qué construir

### 1. Landing pública — terminarla

Sobre lo ya scaffoldeado en `src/pages/LandingPage.tsx`: Hero definitivo,
nav con estado transparente/sólido, secciones texto+imagen ("Quiénes
somos", "Por qué elegirnos"), "Cómo trabajamos" en píldoras, servicios
destacados (ahora vía `useServices()`), reseñas (vía `useGoogleReviews()`),
galería pública (vía `useGalleryItems({ onlyPublished: true })`, con lazy
loading de imágenes), contacto con Google Maps (usando
`src/lib/google/mapsLoader.ts` ya scaffoldeado) + formulario, footer con
`useSiteSettings()`. Reemplazá cualquier mock inline de la Fase 1 por estos
hooks reales (que a su vez usan `*.mock.ts` por ahora).

### 2. Login completo

Formulario de `/login`, "olvidé mi contraseña", actualización de
contraseña, logout — como ya indicaba el Prompt 1, si no se hizo ahí.

### 3. Dashboard

* **Servicios** — tabla + CRUD (`useServicesAdmin`, `useCreateService`,
  `useUpdateService`, `useToggleServiceActive`), UX de sección 65 (buscar →
  seleccionar → precio actual → editar → snapshot) reutilizada más abajo en
  el wizard de órdenes.
* **Inventario** — tabla con columnas de sección 66 (Producto, Stock,
  Precio, Estado, Último movimiento, Acciones), indicadores de stock
  bajo/sin stock, CRUD, historial de movimientos filtrable (sección 67, vía
  `useStockMovements`), registrar movimiento manual (`useRegisterStockMovement`,
  el mock debe replicar la regla de no permitir stock negativo para que la
  UI se comporte igual que el backend real).
* **Clientes/bicicletas** — autocomplete de cliente existente
  (`useCustomerSearch`) dentro del wizard de nueva orden.
* **Órdenes** — wizard con estado en un store de **Zustand**
  (`src/features/work-orders/store/`): cliente → bici → servicios →
  repuestos → observaciones → fotos → resumen (sección 64), que al
  confirmar dispara `useCreateWorkOrder()`. Tabla de órdenes filtrable por
  estado, vista de detalle (`useWorkOrder(id)`), cambio de estado
  (`useUpdateWorkOrderStatus`) con los botones habilitados solo para
  transiciones válidas (tabla en `data-contract.md`), subida de fotos
  antes/durante/después (`useUploadWorkOrderPhoto`).
* **Galería admin** — CRUD, reordenar, publicar/despublicar.
* **Configuración** — formulario de `site_settings`
  (`useSiteSettingsAdmin` / `useUpdateSiteSettings`).

### 4. PDFs

* Elegir la librería (AGENT.md sección 62 — `@react-pdf/renderer` es la
  opción por defecto razonable; justificá si elegís otra).
* Componente de **presupuesto** y componente de **orden de
  trabajo/entrega**, con el lenguaje visual de `docs/design-references.md`
  sección 5 (referencia `html_ejemplo.html`: header oscuro con logo, cajas
  de cliente/bici, tabla de ítems, barra de total en rosa, cláusula de
  garantía, footer con contacto) — pero construidos con datos reales de
  `useWorkOrder(id)` (mock por ahora), no hardcodeados.
* Botones condicionados por estado: "Generar presupuesto" en `pendiente`,
  "Generar orden de trabajo" en `terminado`.

### 5. Mocks

* Un dataset coherente en memoria: los repuestos que aparecen en
  `service_inventory_items` de un servicio mockeado deben existir en el
  inventario mockeado, las órdenes mockeadas deben referenciar
  clientes/bicicletas mockeados, etc.
* Simular latencia (`await sleep(300–600)`) en cada mock para que los
  estados `loading` se vean reales en desarrollo.
* `useRegisterStockMovement` (mock) y las reglas de transición de estado
  (mock) deben replicar las mismas validaciones que se le pidió al Backend,
  para que el comportamiento no cambie sorpresivamente en la Integración.

### 6. Calidad

* Cada pantalla nueva pasa el checklist de AGENT.md sección 72:
  responsive (mobile primero), accesibilidad, loading/empty/error states,
  manejo de errores con mensajes genéricos (sección 48), performance
  (imágenes optimizadas, lazy loading, code splitting de rutas privadas).

## Definición de terminado

No cierres esta sesión sin poder navegar landing + dashboard completos con
`VITE_USE_MOCKS=true`, sin errores de consola, con todos los formularios
validando con Zod y todos los estados de carga/vacío/error visibles al
simular esos casos en los mocks.
