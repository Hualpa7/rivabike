# Contrato de datos — Riva Bike

Este documento es el **contrato compartido** entre el prompt de Backend y el
prompt de Frontend. Ambos se construyen contra estas mismas formas de datos,
así pueden avanzar **en paralelo** (en dos sesiones de OpenCode distintas,
delegadas por separado) y encajar sin fricción en la fase de Integración.

La fuente de las reglas de negocio sigue siendo `docs/AGENT.md`. Este
documento solo les da forma de tipos + firma de funciones — no reemplaza las
reglas, las traduce a una interfaz concreta.

> **Actualización**: se agregó la sección "Reseñas de clientes (OAuth)" —
> feature nueva, ya implementada y auditada en el backend real (no es
> especulativa). Ver `supabase/migrations/20260903011918_customer_reviews_oauth_feature.sql`
> en el repo para el detalle exacto de RLS/RPCs si hace falta.

---

## Arquitectura clave: mock-first por función

Cada función de acceso a datos vive en `src/features/<feature>/api/` con
**dos implementaciones** que exponen exactamente la misma firma:

```text
src/features/services/api/
├── listServices.mock.ts       # datos en memoria (implementa el Frontend)
├── listServices.supabase.ts   # llamada real a Supabase (implementa Backend/Integracion)
└── index.ts                   # re-exporta una u otra segun VITE_USE_MOCKS
```

```ts
// index.ts
import { listServices as mock } from './listServices.mock';
import { listServices as real } from './listServices.supabase';

export const listServices =
  import.meta.env.VITE_USE_MOCKS === 'true' ? mock : real;
```

Reglas de esta convención:

* El prompt de **Frontend** implementa todos los `*.mock.ts` (con datos de
  ejemplo coherentes entre sí y latencia simulada) y construye toda la UI +
  hooks de TanStack Query contra ellos. Deja cada `*.supabase.ts` como stub:
  `export const listServices = (): never => { throw new Error('not implemented'); }`.
  Esto aplica **también** a la feature de reseñas de clientes, aunque el
  backend ya esté implementado de verdad — se mantiene la misma disciplina
  para no acoplar el desarrollo de frontend al estado del backend.
* El prompt de **Backend** trabaja exclusivamente en Supabase (migraciones,
  RLS, Storage, RPCs) y **no edita `src/`**, salvo regenerar
  `src/lib/supabase/types.ts` al final. No necesita tocar los `*.supabase.ts`.
* El prompt de **Integración** es el único que completa los `*.supabase.ts`
  reales y apaga `VITE_USE_MOCKS`.
* `.env.example` incluye `VITE_USE_MOCKS=true` — así el proyecto corre
  completo (landing + dashboard) sin necesitar un Supabase real hasta que
  llegue la Integración.

---

## Convenciones generales

* IDs: `uuid` en Postgres → `string` en TS.
* Timestamps: `timestamptz` → `string` ISO 8601 en TS.
* Dinero: `numeric` en Postgres → `number` en TS (pesos argentinos, sin
  decimales en la UI).
* Ningún campo opcional queda implícito: se marca `| null` explícito, nunca
  `undefined`, para que los mocks y las respuestas reales de Supabase (que
  devuelve `null`, no `undefined`) tengan la misma forma.

## Modelo de identidades — importante para toda la app

Hay **dos identidades completamente separadas**, aunque ambas se autentican
con Supabase Auth:

1. **Staff** (`superadmin` / `admin` / `empleado`): tiene fila en
   `public.profiles`. Es la única identidad con acceso al `/dashboard`.
   Login con email/password, alta manual (nunca automática).
2. **Clientes que dejan reseñas**: se autentican vía OAuth (Google/Facebook).
   **Nunca** tienen fila en `profiles`. No pueden acceder a ninguna pantalla
   de `/dashboard` bajo ninguna circunstancia — el backend ni siquiera se lo
   permite a nivel de datos, pero el frontend tiene que reflejar esto en el
   ruteo (ver `useAuthStore` más abajo).

`useAuthStore` (ver sección de Auth del prompt de frontend) expone
`isStaff: boolean`, derivado de si existe o no una fila propia en
`profiles`. **`status === 'authenticated'` ya NO implica ser staff** — un
usuario que dejó una reseña con Google también tiene `status:
'authenticated'`. Cualquier hook o ruta que antes asumía "autenticado =
admin" tiene que revisarse contra `isStaff`, no solo contra `status`.

## Enums

```ts
export type WorkOrderStatus =
  | 'pendiente' | 'aceptado' | 'en_ejecucion' | 'terminado' | 'rechazado';

export type StockMovementType =
  | 'entrada' | 'salida' | 'ajuste' | 'consumo_trabajo' | 'devolucion';

export type WorkOrderPhotoType = 'antes' | 'durante' | 'despues';

export type CustomerReviewStatus = 'pendiente' | 'aprobada' | 'rechazada';
```

Transiciones válidas de `WorkOrderStatus` (AGENT.md sección 30 y 37) — tanto
el RPC del backend como los botones del frontend deben respetar esta tabla:

```text
pendiente      -> aceptado | rechazado
aceptado       -> en_ejecucion
en_ejecucion   -> terminado
terminado      -> (final)
rechazado      -> (final)
```

Transiciones válidas de `CustomerReviewStatus`:

```text
pendiente  -> aprobada | rechazada     (solo admin, via moderateCustomerReview)
rechazada  -> pendiente                 (solo el dueño, editando/reenviando)
aprobada   -> (final para el usuario — no editable; solo admin puede eliminarla)
```

## Entidades

```ts
export interface Service {
  id: string;
  titulo: string;
  descripcion: string;
  precio_base: number;
  activo: boolean;
  imagen_url: string | null;
  categoria: string | null;
  orden: number | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  stock_actual: number;
  precio_unitario: number;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceInventoryItem {
  service_id: string;
  inventory_item_id: string;
  cantidad: number;
}

export interface StockMovement {
  id: string;
  inventory_item_id: string;
  tipo: StockMovementType;
  cantidad: number;
  stock_anterior: number;
  stock_posterior: number;
  motivo: string | null;
  work_order_id: string | null;
  created_by: string;
  created_at: string;
}

export interface Customer {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bicycle {
  id: string;
  customer_id: string;
  marca: string;
  modelo: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  customer_id: string;
  bicycle_id: string;
  fecha_estimada_entrega: string | null;
  observaciones: string | null;
  estado: WorkOrderStatus;
  total: number; // calculado y validado en backend — ver AGENT.md seccion 34
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface WorkOrderService {
  id: string;
  work_order_id: string;
  service_id: string | null; // null si fue un item ad-hoc (no venia del catalogo)
  title_snapshot: string;
  description_snapshot: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface WorkOrderInventoryItem {
  id: string;
  work_order_id: string;
  inventory_item_id: string | null;
  name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  consumed_at: string | null; // se completa al descontar stock real (seccion 38)
}

export interface WorkOrderPhoto {
  id: string;
  work_order_id: string;
  storage_path: string;
  tipo: WorkOrderPhotoType;
  descripcion: string | null;
  created_at: string;
}

export interface WorkOrderDetail extends WorkOrder {
  customer: Customer;
  bicycle: Bicycle;
  services: WorkOrderService[];
  inventoryItems: WorkOrderInventoryItem[];
  photos: WorkOrderPhoto[];
}

export interface GalleryItem {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  fecha: string | null;
  orden: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  gallery_item_id: string;
  storage_path: string;
  orden: number;
}

// Todos los campos de configuracion del negocio son de naturaleza publica
// (AGENT.md seccion 56) — solo lectura publica, escritura solo admin.
export interface SiteSettings {
  nombre_negocio: string;
  logo_url: string | null;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  email: string | null;
  horarios: string | null;
  instagram: string | null;
  facebook: string | null;
  google_place_id: string | null;
  google_maps_url: string | null;
  descripcion: string | null;
  hero_eyebrow: string | null;
  hero_titulo: string | null;
  hero_imagen_url: string | null;
}

// --- Reseñas de clientes (OAuth) ---

export interface CustomerReview {
  id: string;
  user_id: string;
  nombre_visible: string;
  rating: number; // 1-5
  texto: string; // maximo 500 caracteres, validado en frontend y en backend
  estado: CustomerReviewStatus;
  motivo_rechazo: string | null; // lo carga el admin al rechazar; visible para el usuario
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerReviewPhoto {
  id: string;
  review_id: string;
  storage_path: string; // formato obligatorio: "{user_id}/{archivo}" (lo exige la policy de Storage)
  orden: number;
  created_at: string;
}

export interface CustomerReviewWithPhotos extends CustomerReview {
  photos: CustomerReviewPhoto[];
}
```

---

## RPCs transaccionales (Postgres, implementadas por el Backend)

```ts
// Unico punto de entrada para tocar stock. Nunca UPDATE directo (seccion 26-27).
registerStockMovement(input: {
  inventory_item_id: string;
  tipo: StockMovementType;
  cantidad: number;
  motivo: string | null;
  work_order_id?: string | null;
}): Promise<{ movement: StockMovement; item: InventoryItem }>

// Crea cliente+bici (o reutiliza existentes por id) + orden + snapshots de
// servicios/repuestos en una sola transaccion (seccion 31, 45).
createWorkOrder(input: {
  customer: { id?: string; nombre: string; apellido: string; telefono: string; direccion?: string | null };
  bicycle: { id?: string; marca: string; modelo: string; color?: string | null };
  fecha_estimada_entrega?: string | null;
  observaciones?: string | null;
  services: Array<{ service_id?: string | null; title_snapshot: string; description_snapshot?: string | null; unit_price: number; quantity: number }>;
  inventory_items: Array<{ inventory_item_id?: string | null; name_snapshot: string; unit_price: number; quantity: number }>;
}): Promise<WorkOrderDetail>

// Valida la transicion (tabla de arriba) antes de aplicarla.
updateWorkOrderStatus(input: {
  work_order_id: string;
  new_status: WorkOrderStatus;
}): Promise<WorkOrder>

// Descuenta stock real de UN item de la orden durante la ejecucion (seccion
// 38) — internamente llama a registerStockMovement con
// tipo='consumo_trabajo' y work_order_id, y marca consumed_at.
consumeWorkOrderInventoryItem(input: {
  work_order_inventory_item_id: string;
}): Promise<{ item: WorkOrderInventoryItem; movement: StockMovement }>
```

### RPCs de reseñas de clientes

```ts
// Requiere sesion (cualquier usuario autenticado, NO hace falta ser
// staff). El backend rechaza la llamada si el usuario ya tiene 5 reseñas
// en estado 'pendiente' — el frontend debe reflejar ese limite en la UI
// (deshabilitar el boton "Nueva reseña", mostrar cuantas tiene) pero
// nunca confiar solo en esa validacion visual.
createCustomerReview(input: {
  nombre_visible: string;
  rating: number; // 1-5
  texto: string; // maximo 500 caracteres
}): Promise<CustomerReview>

// Solo el dueño de la reseña. Si estaba en 'rechazada', guardar la vuelve
// a 'pendiente' automaticamente (y cuenta de nuevo contra el limite de 5
// pendientes — el backend puede rechazar el reenvio si ya tiene otras 5).
// No se puede editar una reseña 'aprobada' (el backend lo rechaza).
updateCustomerReview(input: {
  review_id: string;
  nombre_visible: string;
  rating: number;
  texto: string;
}): Promise<CustomerReview>

// Solo staff. Maximo 3 reseñas 'aprobada' simultaneas por usuario (el
// backend lo valida y rechaza la 4ta). motivo_rechazo es OBLIGATORIO
// cuando new_estado='rechazada' — el backend lo rechaza si viene vacio.
moderateCustomerReview(input: {
  review_id: string;
  new_estado: 'aprobada' | 'rechazada';
  motivo_rechazo?: string | null;
}): Promise<CustomerReview>

// Solo staff. Borra la reseña (cascade borra sus fotos en la base) y
// devuelve los storage_paths para que el frontend las borre tambien de
// Storage con supabase.storage.from('customer-review-photos').remove(paths)
// — Postgres no puede invocar la Storage API directamente.
deleteCustomerReview(input: {
  review_id: string;
}): Promise<{ deleted_review_id: string; storage_paths: string[] }>
```

Las fotos de reseñas (`customer_review_photos`) **no** tienen RPC propia:
se suben a Storage y se inserta la fila de metadata directamente (protegido
por RLS), mismo patrón que `work_order_photos`/`gallery_images`. El único
detalle no obvio: el `storage_path` de subida tiene que empezar con el
`user_id` del usuario autenticado (`{auth.uid()}/{archivo}`) — la política
de Storage lo exige para poder validar ownership antes de que exista la fila
de metadata.

---

## Hooks de TanStack Query esperados

El **Frontend** implementa estos hooks (y sus mocks). El **Backend** solo
necesita garantizar que las tablas/RPCs de arriba puedan respaldarlos.

**Públicos** (sin sesión, usados en la landing):

```ts
useServices(params?: { onlyActive?: boolean }): UseQueryResult<Service[]>
useGalleryItems(params?: { onlyPublished?: boolean }): UseQueryResult<(GalleryItem & { images: GalleryImage[] })[]>
useSiteSettings(): UseQueryResult<SiteSettings>
useGoogleReviews(): UseQueryResult<GoogleReviewsSummary>
useApprovedCustomerReviews(): UseQueryResult<CustomerReviewWithPhotos[]>
```

**De reseñas de clientes** (requiere sesión — cualquier usuario
autenticado vía OAuth o email, **no hace falta ser staff**.
`enabled: status === 'authenticated'`):

```ts
useMyCustomerReviews(): UseQueryResult<CustomerReviewWithPhotos[]>
useCreateCustomerReview(): UseMutationResult<CustomerReview, Error, NewCustomerReviewInput>
useUpdateCustomerReview(): UseMutationResult<CustomerReview, Error, UpdateCustomerReviewInput>
useUploadCustomerReviewPhoto(): UseMutationResult<CustomerReviewPhoto, Error, { reviewId: string; file: File }>
useDeleteCustomerReviewPhoto(): UseMutationResult<void, Error, { photoId: string; storagePath: string }>
```

**Privados de staff** (dashboard — cada query debe llevar
`enabled: status === 'authenticated' && isStaff` usando `useAuthStore`;
**ya no alcanza con `status === 'authenticated'` a secas**, ver el modelo
de identidades más arriba):

```ts
useServicesAdmin(): UseQueryResult<Service[]>
useCreateService(): UseMutationResult<Service, Error, NewServiceInput>
useUpdateService(): UseMutationResult<Service, Error, UpdateServiceInput>
useToggleServiceActive(): UseMutationResult<Service, Error, { id: string; activo: boolean }>

useInventoryItems(params?: { search?: string; onlyActive?: boolean }): UseQueryResult<InventoryItem[]>
useCreateInventoryItem(): UseMutationResult<InventoryItem, Error, NewInventoryItemInput>
useUpdateInventoryItem(): UseMutationResult<InventoryItem, Error, UpdateInventoryItemInput>
useRegisterStockMovement(): UseMutationResult<{ movement: StockMovement; item: InventoryItem }, Error, RegisterStockMovementInput>
useStockMovements(params?: { inventoryItemId?: string; workOrderId?: string; tipo?: StockMovementType }): UseQueryResult<StockMovement[]>

useCustomerSearch(query: string): UseQueryResult<Customer[]> // autocomplete en el wizard de nueva orden

useWorkOrders(params?: { estado?: WorkOrderStatus }): UseQueryResult<WorkOrder[]>
useWorkOrder(id: string): UseQueryResult<WorkOrderDetail>
useCreateWorkOrder(): UseMutationResult<WorkOrderDetail, Error, CreateWorkOrderInput>
useUpdateWorkOrderStatus(): UseMutationResult<WorkOrder, Error, { id: string; newStatus: WorkOrderStatus }>
useUploadWorkOrderPhoto(): UseMutationResult<WorkOrderPhoto, Error, { workOrderId: string; file: File; tipo: WorkOrderPhotoType; descripcion?: string }>
useConsumeWorkOrderInventoryItem(): UseMutationResult<{ item: WorkOrderInventoryItem; movement: StockMovement }, Error, { workOrderInventoryItemId: string }>

useGalleryItemsAdmin(): UseQueryResult<(GalleryItem & { images: GalleryImage[] })[]>
useCreateGalleryItem(): UseMutationResult<GalleryItem, Error, NewGalleryItemInput>
useUpdateGalleryItem(): UseMutationResult<GalleryItem, Error, UpdateGalleryItemInput>
useReorderGalleryItems(): UseMutationResult<void, Error, { orderedIds: string[] }>

useSiteSettingsAdmin(): UseQueryResult<SiteSettings>
useUpdateSiteSettings(): UseMutationResult<SiteSettings, Error, Partial<SiteSettings>>

useCustomerReviewsAdmin(params?: { estado?: CustomerReviewStatus }): UseQueryResult<CustomerReviewWithPhotos[]>
useModerateCustomerReview(): UseMutationResult<CustomerReview, Error, { reviewId: string; newEstado: 'aprobada' | 'rechazada'; motivoRechazo?: string }>
useDeleteCustomerReviewAdmin(): UseMutationResult<{ deletedReviewId: string; storagePaths: string[] }, Error, { reviewId: string }>
```

---

## Qué hace cada prompt con este documento

* **`opencode-prompt-2-backend.md`** — crea las tablas/RLS/Storage que
  respaldan cada entidad de arriba, implementa las RPCs con ese nombre y
  esa firma exacta, y genera `src/lib/supabase/types.ts` real al final.
  **Ya ejecutado y auditado**, incluyendo la feature de reseñas.
* **`opencode-prompt-3-frontend.md`** (+ su addendum de reseñas) —
  implementa cada hook + su `*.mock.ts`, y construye toda la UI (landing +
  dashboard + flujo público de reseñas) contra ellos, sin esperar a que el
  backend exista.
* **`opencode-prompt-4-integration.md`** — implementa (o revisa) cada
  `*.supabase.ts`, apaga `VITE_USE_MOCKS`, y verifica que cada pantalla siga
  funcionando igual con datos reales.
