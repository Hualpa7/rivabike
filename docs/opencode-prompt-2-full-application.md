# Prompt 2 / 2 — Resto de la aplicación (Fases 2 a 8)

> Pegar a OpenCode **después** de completar y validar el Prompt 1 (landing +
> login funcionando sobre el scaffold). Este prompt cubre las fases 2 a 8 de
> `docs/AGENT.md` sección 69. Usá `docs/AGENT.md` como fuente de verdad
> completa — este prompt es un mapa de ejecución, no un reemplazo.

---

Actuás como arquitecto de software senior y desarrollador Full Stack
React + Supabase + PostgreSQL sobre el repositorio **rivabike**. La Fase 1
(scaffold, landing pública, login) ya está implementada y validada. Ahora
segui construyendo por fases, **sin saltar de una a otra sin verificar la
anterior** (AGENT.md sección 69, último párrafo).

## Reglas no negociables (aplican a todas las fases)

* Package manager: **pnpm** únicamente.
* Estado de cliente compartido (no remoto): **Zustand** exclusivamente
  (nada de Redux ni Context ad-hoc para esto). Datos remotos: **siempre**
  TanStack Query, nunca `useEffect` + `fetch` manual contra Supabase.
* TypeScript estricto en todo. Tipos de la base de datos generados con
  `supabase gen types typescript` y usados en `createClient<Database>()`
  (hoy `src/lib/supabase/types.ts` es un placeholder — reemplazalo).
* Mobile-first en cada pantalla nueva del dashboard, no solo en la landing.
* Paleta de marca: `ink` / `paper` / `pink` / `pink.deep` (Tailwind ya
  configurado) — reutilizar los mismos tokens en dashboard y PDFs.
* RLS **siempre** activada en toda tabla nueva. Ninguna tabla queda
  accesible por default: escribí la política explícita antes de exponerla.
* No confiar en el frontend para autorización ni para cálculos de
  totales/stock — eso vive en Postgres (RLS + RPCs/funciones).
* Toda migración va versionada (`supabase/migrations`), nunca cambios
  manuales sueltos en el dashboard de Supabase sin migración
  correspondiente.
* Antes de dar una funcionalidad por terminada, pasarla por el checklist
  de AGENT.md sección 72 (funcionalidad, seguridad, validación, responsive,
  accesibilidad, errores, loading states, performance, RLS, storage,
  integridad de datos) y por las preguntas de seguridad de la sección 59.

---

## Fase 2 — Esquema de base de datos + RLS + roles + servicios + inventario

1. **Modelo relacional**: diseñar (no copiar ciegamente) las tablas
   listadas en AGENT.md sección 42, partiendo de `profiles`/`roles` para
   dejar preparado el multi-rol futuro (sección 17) sin sobre-ingenierizar
   ahora — un único superadmin hoy, estructura que soporte roles después.
2. **RLS**: público (`anon`) solo lectura de contenido publicado
   (servicios activos, galería publicada, `site_settings` públicos).
   Privado: solo el superadmin autenticado (validar por `profiles.role`,
   no solo por `authenticated`). Ver AGENT.md secciones 20–21.
3. **Storage**: crear los buckets `public-gallery` (público),
   `work-order-photos` (privado, RLS + URLs firmadas), `inventory-images`
   (privado o público según se defina) — sección 22. Validar MIME/tamaño en
   la subida (sección 46).
4. **Servicios** (`services`): CRUD completo desde el dashboard, con
   `activo` para soft-delete (sección 24). Reemplazar el mock de la
   landing (`src/features/services/mocks.ts`) por `useServices()` con
   TanStack Query contra la tabla real.
5. **Inventario** (`inventory_items` + `stock_movements`): CRUD de
   repuestos, y **ninguna** actualización directa de `stock_actual` desde
   el frontend — todo movimiento pasa por una RPC transaccional (secciones
   25–27) que registra el movimiento y previene stock negativo salvo
   decisión explícita.
6. **Relación servicio↔repuestos** (`service_inventory_items`) — sección
   28, como configuración por defecto editable al armar una orden.

**Gate de esta fase**: recorrer las preguntas de seguridad de la sección 59
para servicios e inventario antes de seguir.

## Fase 3 — Clientes, bicicletas, órdenes/presupuestos

1. Tablas `customers`, `bicycles`, `work_orders` (sección 29).
2. Estados de la orden y sus transiciones válidas (sección 30) — modelar
   como `enum`/`check constraint` en Postgres, no como string libre.
3. `work_order_services` / `work_order_inventory_items` con **snapshot**
   de nombre/descripción/precio (secciones 31, 33, 45) — nunca depender en
   tiempo real del catálogo para una orden ya creada.
4. Edición manual del precio por orden sin tocar el precio global del
   catálogo (sección 32).
5. Formulario de nueva orden como wizard (cliente → bici → servicios →
   repuestos → observaciones → fotos → resumen), sección 64. Este es un
   buen caso de uso real para **Zustand**: el estado del wizard en
   construcción (antes de guardar) vive en un store de
   `src/features/work-orders/store/`, y solo al confirmar se persiste vía
   una mutation de TanStack Query.
6. UX del catálogo al agregar un servicio a una orden: buscar → seleccionar
   → precio actual → edición opcional → snapshot (sección 65).

**Gate**: recorrer el flujo completo de una orden (sección 37) de punta a
punta en mobile antes de seguir.

## Fase 4 — Movimientos de stock, consumo real, fotografías

1. Confirmar la regla de negocio de la sección 38: no descontar stock al
   presupuestar, descontar solo al ejecutar el trabajo, siempre vía
   movimiento registrado y vinculado a `work_order_id`.
2. `work_order_photos` (antes/durante/después) — sección 36, con upload a
   `work-order-photos`, validación de archivos (sección 46).
3. Vista de historial de movimientos con filtros (sección 67).
4. Indicadores visuales de stock bajo/sin stock en la tabla de inventario
   (sección 66), con umbral configurable a futuro.

**Gate**: probar condiciones de carrera (dos movimientos simultáneos sobre
el mismo repuesto) contra la RPC transaccional.

## Fase 5 — PDFs

1. Definir la librería (AGENT.md sección 62 pide investigar antes de
   elegir entre `@react-pdf/renderer`, impresión HTML/CSS, u otra opción
   liviana — priorizar calidad de imágenes, estabilidad y mantenimiento).
2. **PDF de presupuesto** (sección 39) y **PDF de orden de trabajo/entrega**
   (sección 40), reutilizando el lenguaje visual descrito en
   `docs/design-references.md` sección 5 (header oscuro con logo,
   cajas de cliente/bici, tabla de ítems, barra de total en rosa,
   cláusula de garantía, footer con contacto) — la referencia visual es el
   PDF de `html_ejemplo.html`, pero la generación real va del lado que
   corresponda (cliente o Edge Function) sin depender de `localStorage`.
3. Botones condicionados por estado: "Generar presupuesto" en
   `pendiente`, "Generar orden de trabajo" en `terminado`.

## Fase 6 — Google Maps y Google Reviews

1. **Google Maps JavaScript API** para el mapa de contacto (sección 14) —
   key restringida por dominio, componente responsive, CTA "Cómo llegar".
2. **Places API (New)** para reseñas (sección 12) — usar `place_id`,
   Field Masks (pedir solo los campos necesarios), y sacar la lógica que
   requiera una credencial no-pública fuera del cliente (Edge Function).
   Cachear/evitar llamadas repetidas innecesarias.
3. Reemplazar los mocks de rating (`4.8/5 · 63 reseñas`) del Hero y la
   sección de reseñas de la landing por los datos reales, respetando
   atribución y políticas de Google.

## Fase 7 — CMS de landing y galería administrable

1. `site_settings` (o tabla equivalente) para hero, descripción, contacto,
   horarios, redes, CTAs — sección 15/56. Reemplazar los mocks de
   `src/lib/config/business.ts` por datos reales editables desde el
   dashboard.
2. Galería (`gallery_items`/`gallery_images`) con CRUD completo, reordenar,
   publicar/despublicar (sección 13) — la pública solo debe mostrar
   contenido publicado.

## Fase 8 — Testing, hardening, performance, accesibilidad, SEO

1. Tests unitarios y de validación, con foco especial en reglas de stock y
   de permisos/RLS (sección 71).
2. Revisar Security Advisor y Performance Advisor de Supabase (sección 58).
3. Code splitting de rutas privadas vs públicas, `React.lazy` donde
   corresponda, optimización de imágenes (sección 54).
4. SEO: title/meta description/Open Graph/headings/alt text ya iniciados
   en la Fase 1 — completar y revisar en esta fase (sección 53).
5. Accesibilidad: pasada completa de teclado + lector de pantalla sobre
   landing y dashboard (sección 52).

---

## Cómo trabajar en cada fase

Para cada fase, seguí el mismo ciclo que pide AGENT.md sección 73:
inspeccionar lo existente → entender dependencias → identificar qué ya
está hecho → analizar impacto → proponer arquitectura puntual → implementar
→ verificar → corregir. No dupliques funcionalidad ya creada en el
scaffold ni en fases anteriores, no hagas refactors masivos sin
justificarlos, y si cambiás alguna decisión tecnológica ya tomada
(pnpm, Tailwind, TanStack Query, Zustand, Motion, Supabase), explicá por
qué antes de hacerlo.
