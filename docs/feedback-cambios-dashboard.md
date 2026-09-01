# Feedback de cambios · Dashboard Riva Bike

Cambios de negocio/UX implementados sobre el esquema de supabase (migración
`20260830154437_services_categories_site_settings_autoconsume.sql`) y el frontend
del dashboard/landing.

---

## 1. Nombre del usuario en el panel

- `InicioPage` ya muestra el nombre real vía `user_metadata.full_name`.
- Como fix de datos, la migración completa `profiles.full_name` a partir del
  auth users cuando está vacío.

## 2. Nombre + bici del cliente en órdenes

- `work-orders.supabase.ts::listWorkOrders` ahora trae el detalle enriquecido
  (`customer` y `bicycle`) mediante el RPC `get_work_order_detail` y joins.
- `OrdenesPage` muestra `nombre apellido` del cliente y `marca modelo` de la bici
  en la lista.
- `InicioPage` (órdenes recientes) muestra el nombre del cliente y la bici con
  fallbacks a `ordenNumber(estado)`.

## 3. Servicios: categorías + imagen

- Nueva tabla `service_categories` (+ slug automático).
- `services.categoria_id` FK; se migraron los datos de `services.categoria`
  (text) a la nueva relación.
- `ServiciosPage` reescrito:
  - Alta inline de categorías y selector de categoría en el formulario.
  - `ImageUpload` para la imagen del servicio (bucket `public-gallery`).
  - Fix de autofill del formulario con el modal (opción `values` del RHF).
- Frontend expone `categoria_nombre` resolviendo la relación al listar.

## 4. Inventario: imagen + últimos movimientos

- `InventarioPage`:
  - `ImageUpload` en alta/edición (bucket privado `inventory-images`, signed URL).
  - Thumbnail del producto en tabla y cards.
  - Modal de **movimientos** (historial de `stock_movements` filtrado por ítem)
    y columna "Último movimiento" en cada fila.

## 5. Consumo automático de stock

- `update_work_order_status`: al pasar `en_ejecucion → terminado` consume todos
  los repuestos con `inventory_item_id` y `consumed_at IS NULL` balanceando el
  stock vía `register_stock_movement('consumo_trabajo')` y marcando `consumed_at`.
- El RPC individual `consume_work_order_inventory_item` quedó **revocado**
  (ya no se llama desde el frontend).
- `OrdenDetallePage` ya no muestra el botón "Consumir" (el descuento es
  automático al terminar la orden).

## 6. Galería: upload + edición completa

- `GaleriaPage` reescrito:
  - Alta de trabajo (título, categoría, fecha, descripción, publicado).
  - Edición completa de cada trabajo.
  - Subida de **varias fotos** a `public-gallery` (mín. 2 por condición) y
    borrado de imágenes.
- Se agregaron `uploadGalleryImages` y `deleteGalleryImage` (supabase + mock)
  con sus hooks.

## 7. Contenido del sitio unificado

- `site_settings` ampliado con los bloques de contenido de la landing:
  About, HowWeWork (4 pasos), Reviews y Services (títulos + descripciones).
- `ContenidoPage` ahora edita todos esos bloques.
- Landing conectada con los campos nuevos:
  - `About` → `about_titulo / about_descripcion / about_check_1-2`
  - `HowWeWork` → `how_it_works_* + how_we_work_paso*`
  - `Reviews` → `reviews_titulo / reviews_subtitulo`
  - `Services` → `services_titulo / services_subtitulo`

---

## Notas / bloqueos

- La migración se aplicó **manualmente** en el SQL Editor de supabase
  (el CLI no puede hacer `db push` en este entorno: host directo IPv6
  inalcanzable + sin `SUPABASE_DB_PASSWORD`).
- Google Reviews quedó **fuera de alcance** (no se tocó).
- Los mocks (`*.mock.ts`) se mantienen como fallback de desarrollo
  (`VITE_USE_MOCKS=true`) y se actualizaron para seguir la misma API.
- Verificación: `pnpm typecheck`, `pnpm lint` y `pnpm build` pasan sin errores.
