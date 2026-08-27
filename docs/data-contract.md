# Contrato de datos — Riva Bike

Este documento es el **contrato compartido** entre el prompt de Backend y el
prompt de Frontend. Ambos se construyen contra estas mismas formas de datos,
así pueden avanzar **en paralelo** (en dos sesiones de OpenCode distintas,
delegadas por separado) y encajar sin fricción en la fase de Integración.

La fuente de las reglas de negocio sigue siendo `docs/AGENT.md`. Este
documento solo les da forma de tipos + firma de funciones — no reemplaza las
reglas, las traduce a una interfaz concreta.

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

## Enums

```ts
export type WorkOrderStatus =
  | 'pendiente' | 'aceptado' | 'en_ejecucion' | 'terminado' | 'rechazado';

export type StockMovementType =
  | 'entrada' | 'salida' | 'ajuste' | 'consumo_trabajo' | 'devolucion';

export type WorkOrderPhotoType = 'antes' | 'durante' | 'despues';
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
```

## Datos externos (Google)

```ts
export interface GoogleReview {
  author_name: string;
  author_url: string | null;
  profile_photo_url: string | null;
  rating: number;
  text: string;
  relative_time_description: string;
}

export interface GoogleReviewsSummary {
  rating: number;
  total_reviews: number;
  reviews: GoogleReview[];
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
```

**Privados** (dashboard — cada query debe llevar `enabled: status === 'authenticated'`
usando `useAuthStore`):

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
```

---

## Qué hace cada prompt con este documento

* **`opencode-prompt-2-backend.md`** — crea las tablas/RLS/Storage que
  respaldan cada entidad de arriba, implementa las 4 RPCs con ese nombre y
  esa firma exacta, y genera `src/lib/supabase/types.ts` real al final.
* **`opencode-prompt-3-frontend.md`** — implementa cada hook + su
  `*.mock.ts`, y construye toda la UI (landing + dashboard) contra ellos,
  sin esperar a que el backend exista.
* **`opencode-prompt-4-integration.md`** — implementa (o revisa) cada
  `*.supabase.ts`, apaga `VITE_USE_MOCKS`, y verifica que cada pantalla siga
  funcionando igual con datos reales.
