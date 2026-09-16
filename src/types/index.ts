// Tipos de dominio compartidos (config).

export type StockMovementType =
  | 'entrada'
  | 'salida'
  | 'ajuste'
  | 'consumo_trabajo'
  | 'devolucion';

export type WorkOrderPhotoType = 'antes' | 'durante' | 'despues';

export type CustomerReviewStatus = 'pendiente' | 'aprobada' | 'rechazada';

// Umbral de stock minimo para marcar "stock bajo" en el inventario.
export const LOW_STOCK_THRESHOLD = 5;

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

export interface ServiceCategory {
  id: string;
  nombre: string;
  slug: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  titulo: string;
  descripcion: string;
  precio_base: number;
  activo: boolean;
  imagen_url: string | null;
  plazo: string | null;
  categoria: string | null;
  categoria_id: string | null;
  categoria_nombre: string | null;
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
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  code: string;
  customer_id: string;
  bicycle_id: string;
  fecha_estimada_entrega: string | null;
  observaciones: string | null;
  total: number;
  senia: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  customer?: Pick<Customer, 'id' | 'nombre' | 'apellido' | 'telefono'> | null;
  bicycle?: Pick<Bicycle, 'id' | 'marca' | 'color'> | null;
}

export interface WorkOrderService {
  id: string;
  work_order_id: string;
  service_id: string | null;
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
  consumed_at: string | null;
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

// ---------------------------------------------------------------------------
// Presupuestos (nomenclatura P-XXXX; no consumen stock)
// ---------------------------------------------------------------------------

export type PresupuestoStatus = 'pendiente' | 'aceptado' | 'rechazado';

export interface Presupuesto {
  id: string;
  code: string;
  customer_id: string;
  bicycle_id: string;
  observaciones: string | null;
  estado: PresupuestoStatus;
  total: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  customer?: Pick<Customer, 'id' | 'nombre' | 'apellido' | 'telefono'> | null;
  bicycle?: Pick<Bicycle, 'id' | 'marca' | 'color'> | null;
}

export interface PresupuestoService {
  id: string;
  presupuesto_id: string;
  service_id: string | null;
  title_snapshot: string;
  description_snapshot: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface PresupuestoInventoryItem {
  id: string;
  presupuesto_id: string;
  inventory_item_id: string | null;
  name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface PresupuestoDetail extends Presupuesto {
  customer: Customer;
  bicycle: Bicycle;
  services: PresupuestoService[];
  inventoryItems: PresupuestoInventoryItem[];
}

export interface GalleryItem {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  fecha: string | null;
  orden: number;
  publicado: boolean;
  check_1: string | null;
  check_2: string | null;
  check_3: string | null;
  check_4: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  gallery_item_id: string;
  storage_path: string;
  orden: number;
  tipo: 'antes' | 'despues' | null;
}

export type GalleryItemWithImages = GalleryItem & { images: GalleryImage[] };

export interface SiteSettings {
  nombre_negocio: string;
  logo_url: string | null;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  email: string | null;
  horarios: string | null;
  instagram: string | null;
  google_place_id: string | null;
  google_maps_url: string | null;
  descripcion: string | null;
  hero_eyebrow: string | null;
  hero_titulo: string | null;
  hero_imagen_url: string | null;
  about_titulo: string | null;
  about_descripcion: string | null;
  about_check_1: string | null;
  about_check_2: string | null;
  about_check_1_descripcion: string | null;
  about_check_2_descripcion: string | null;
  how_it_works_titulo: string | null;
  how_it_works_subtitulo: string | null;
  how_it_works_descripcion: string | null;
  how_we_work_paso1_titulo: string | null;
  how_we_work_paso1_descripcion: string | null;
  how_we_work_paso2_titulo: string | null;
  how_we_work_paso2_descripcion: string | null;
  how_we_work_paso3_titulo: string | null;
  how_we_work_paso3_descripcion: string | null;
  how_we_work_paso4_titulo: string | null;
  how_we_work_paso4_descripcion: string | null;
  reviews_titulo: string | null;
  reviews_subtitulo: string | null;
  services_titulo: string | null;
  services_subtitulo: string | null;
}

// ---------------------------------------------------------------------------
// Reseñas de clientes (OAuth)
// ---------------------------------------------------------------------------

export interface CustomerReview {
  id: string;
  user_id: string;
  nombre_visible: string;
  rating: number;
  texto: string;
  estado: CustomerReviewStatus;
  motivo_rechazo: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerReviewPhoto {
  id: string;
  review_id: string;
  storage_path: string;
  orden: number;
  created_at: string;
}

export type CustomerReviewWithPhotos = CustomerReview & { photos: CustomerReviewPhoto[] };

// ---------------------------------------------------------------------------
// Inputs de mutaciones (formas tipadas para RHF + Zod y para los mocks)
// ---------------------------------------------------------------------------

export interface NewServiceInput {
  titulo: string;
  descripcion: string;
  precio_base: number;
  categoria?: string | null;
  categoria_id?: string | null;
  activo?: boolean;
  imagen_url?: string | null;
  plazo?: string | null;
}

export interface UpdateServiceInput {
  id: string;
  titulo?: string;
  descripcion?: string;
  precio_base?: number;
  categoria?: string | null;
  categoria_id?: string | null;
  activo?: boolean;
  imagen_url?: string | null;
  plazo?: string | null;
}

export interface NewInventoryItemInput {
  nombre: string;
  descripcion?: string | null;
  stock_actual: number;
  precio_unitario: number;
  imagen_url?: string | null;
  activo?: boolean;
}

export interface UpdateInventoryItemInput {
  id: string;
  nombre?: string;
  descripcion?: string | null;
  stock_actual?: number;
  precio_unitario?: number;
  imagen_url?: string | null;
  activo?: boolean;
}

export interface RegisterStockMovementInput {
  inventory_item_id: string;
  tipo: StockMovementType;
  cantidad: number;
  motivo: string | null;
  work_order_id?: string | null;
}

export interface CreatePresupuestoInput {
  customer: {
    id?: string;
    nombre: string;
    apellido: string;
    telefono: string;
    direccion?: string | null;
  };
  bicycle: {
    id?: string;
    marca: string;
    color?: string | null;
  };
  observaciones?: string | null;
  services: Array<{
    service_id?: string | null;
    title_snapshot: string;
    description_snapshot?: string | null;
    unit_price: number;
    quantity: number;
  }>;
  inventory_items: Array<{
    inventory_item_id?: string | null;
    name_snapshot: string;
    unit_price: number;
    quantity: number;
  }>;
}

export interface CreateWorkOrderInput {
  customer: {
    id?: string;
    nombre: string;
    apellido: string;
    telefono: string;
    direccion?: string | null;
  };
  bicycle: {
    id?: string;
    marca: string;
    color?: string | null;
  };
  fecha_estimada_entrega?: string | null;
  observaciones?: string | null;
  senia?: number | null;
  services: Array<{
    service_id?: string | null;
    title_snapshot: string;
    description_snapshot?: string | null;
    unit_price: number;
    quantity: number;
  }>;
  inventory_items: Array<{
    inventory_item_id?: string | null;
    name_snapshot: string;
    unit_price: number;
    quantity: number;
  }>;
}

export interface NewGalleryItemInput {
  titulo: string;
  descripcion?: string | null;
  categoria?: string | null;
  fecha?: string | null;
  publicado?: boolean;
  check_1?: string | null;
  check_2?: string | null;
  check_3?: string | null;
  check_4?: string | null;
}

export interface UpdateGalleryItemInput {
  id: string;
  titulo?: string;
  descripcion?: string | null;
  categoria?: string | null;
  fecha?: string | null;
  publicado?: boolean;
  check_1?: string | null;
  check_2?: string | null;
  check_3?: string | null;
  check_4?: string | null;
}

export interface GalleryChecks {
  check_1: string | null;
  check_2: string | null;
  check_3: string | null;
  check_4: string | null;
}

export interface NewCustomerReviewInput {
  nombre_visible: string;
  rating: number;
  texto: string;
}

export interface UpdateCustomerReviewInput {
  review_id: string;
  nombre_visible: string;
  rating: number;
  texto: string;
}

export interface ModerateCustomerReviewInput {
  reviewId: string;
  newEstado: 'aprobada' | 'rechazada';
  motivoRechazo?: string;
}

export interface DeleteCustomerReviewInput {
  reviewId: string;
}

/** Condiciones que se imprimen en los PDFs (órdenes de trabajo y presupuestos). */
export type PdfCondicionesTipo = 'orden' | 'presupuesto';

export interface PdfCondiciones {
  id: string;
  tipo: PdfCondicionesTipo;
  items: string[];
  updated_at: string;
}
