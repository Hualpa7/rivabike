import type {
  Bicycle,
  CreateWorkOrderInput,
  Customer,
  StockMovement,
  WorkOrder,
  WorkOrderDetail,
  WorkOrderInventoryItem,
  WorkOrderPhoto,
  WorkOrderService,
  WorkOrderStatus,
} from '@/types';
import { clone, delay, uid } from '@/lib/mock/helpers';

const today = '2026-08-28';
const iso = (day: string, time = '14:00:00') => `${day}T${time}.000Z`;

// Clientes y bicicletas de soporte (consistentes con customers.mock y con el
// orden de ejemplo del dashboard).
const CUSTOMERS: Record<string, Customer> = {
  'cus-valeria': { id: 'cus-valeria', nombre: 'Valeria', apellido: 'Gómez', telefono: '3875 501234', direccion: 'San Martín 120, Salta', created_at: iso('2026-07-01'), updated_at: iso('2026-07-01') },
  'cus-torretto': { id: 'cus-torretto', nombre: 'Rodríguez', apellido: 'Torretto', telefono: '3876 112233', direccion: 'Rivadavia 500', created_at: iso('2026-07-02'), updated_at: iso('2026-07-02') },
  'cus-belen': { id: 'cus-belen', nombre: 'Belén', apellido: 'Mansilla', telefono: '3877 445566', direccion: 'Jujuy 340', created_at: iso('2026-07-03'), updated_at: iso('2026-07-03') },
  'cus-rulo': { id: 'cus-rulo', nombre: 'Rulo', apellido: 'Paredes', telefono: '3878 778899', direccion: null, created_at: iso('2026-07-04'), updated_at: iso('2026-07-04') },
  'cus-carla': { id: 'cus-carla', nombre: 'Carla', apellido: 'Sánchez', telefono: '3879 990011', direccion: 'Córdoba 880', created_at: iso('2026-07-05'), updated_at: iso('2026-07-05') },
  'cus-marcos': { id: 'cus-marcos', nombre: 'Marcos', apellido: 'Díaz', telefono: '3870 223344', direccion: 'Balcarce 210', created_at: iso('2026-07-06'), updated_at: iso('2026-07-06') },
};

const BICYCLES: Record<string, Bicycle> = {
  'bic-valeria': { id: 'bic-valeria', customer_id: 'cus-valeria', marca: 'Venzo', modelo: 'R29', color: 'Negro', created_at: iso('2026-07-01'), updated_at: iso('2026-07-01') },
  'bic-torretto': { id: 'bic-torretto', customer_id: 'cus-torretto', marca: 'Trek', modelo: 'Marlin 5', color: 'azul', created_at: iso('2026-07-02'), updated_at: iso('2026-07-02') },
  'bic-belen': { id: 'bic-belen', customer_id: 'cus-belen', marca: 'Raleigh', modelo: 'Paseo', color: 'blanco', created_at: iso('2026-07-03'), updated_at: iso('2026-07-03') },
  'bic-rulo': { id: 'bic-rulo', customer_id: 'cus-rulo', marca: 'Vairo', modelo: 'X Rage', color: 'rojo', created_at: iso('2026-07-04'), updated_at: iso('2026-07-04') },
  'bic-carla': { id: 'bic-carla', customer_id: 'cus-carla', marca: 'Specialized', modelo: 'Rockhopper', color: 'verde', created_at: iso('2026-07-05'), updated_at: iso('2026-07-05') },
  'bic-marcos': { id: 'bic-marcos', customer_id: 'cus-marcos', marca: 'Giant', modelo: 'Escape', color: 'gris', created_at: iso('2026-07-06'), updated_at: iso('2026-07-06') },
};

interface SeedWorkOrder {
  id: string;
  numero: string;
  customerId: string;
  bicycleId: string;
  estado: WorkOrderStatus;
  fechaEstimada: string | null;
  observaciones: string | null;
  createdDay: string;
  services: Array<Omit<WorkOrderService, 'id' | 'work_order_id' | 'subtotal'>>;
  inventoryItems: Array<Omit<WorkOrderInventoryItem, 'id' | 'work_order_id' | 'subtotal'>>;
  photos: Array<Omit<WorkOrderPhoto, 'id' | 'work_order_id'>>;
}

const SEED: SeedWorkOrder[] = [
  {
    id: 'ord-0142',
    numero: 'OT-0142',
    customerId: 'cus-valeria',
    bicycleId: 'bic-valeria',
    estado: 'en_ejecucion',
    fechaEstimada: iso('2026-08-29'),
    observaciones: 'Entrega acordada para el viernes.',
    createdDay: '2026-08-26',
    services: [
      { service_id: 'adm-aju-general', title_snapshot: 'Ajuste general', description_snapshot: 'Revisión y ajuste completo de la bici', unit_price: 12000, quantity: 1 },
      { service_id: 'adm-cambio-cadena', title_snapshot: 'Cambio de cadena', description_snapshot: 'Incluye medición de desgaste', unit_price: 14500, quantity: 1 },
    ],
    inventoryItems: [
      { inventory_item_id: 'inv-cinta-manubrio', name_snapshot: 'Cinta de manubrio', unit_price: 2000, quantity: 1, consumed_at: null },
    ],
    photos: [
      { storage_path: 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000', tipo: 'antes', descripcion: 'Estado inicial', created_at: iso('2026-08-26') },
    ],
  },
  {
    id: 'ord-0141',
    numero: 'OT-0141',
    customerId: 'cus-torretto',
    bicycleId: 'bic-torretto',
    estado: 'en_ejecucion',
    fechaEstimada: iso('2026-08-30'),
    observaciones: null,
    createdDay: '2026-08-25',
    services: [
      { service_id: 'adm-cambio-cubiertas', title_snapshot: 'Cambio de cubiertas', description_snapshot: 'Por rueda', unit_price: 18400, quantity: 2 },
      { service_id: 'adm-ajuste-frenos', title_snapshot: 'Ajuste de frenos', description_snapshot: 'Pastillas y centrado', unit_price: 8600, quantity: 1 },
      { service_id: 'adm-diagnostico', title_snapshot: 'Diagnóstico', description_snapshot: 'Revisión detallada, sin reparación', unit_price: 5200, quantity: 1 },
    ],
    inventoryItems: [
      { inventory_item_id: 'inv-pastillas', name_snapshot: 'Pastillas de freno', unit_price: 7800, quantity: 1, consumed_at: null },
    ],
    photos: [],
  },
  {
    id: 'ord-0140',
    numero: 'OT-0140',
    customerId: 'cus-belen',
    bicycleId: 'bic-belen',
    estado: 'pendiente',
    fechaEstimada: iso('2026-08-31'),
    observaciones: 'Avisar por WhatsApp cuando esté lista.',
    createdDay: '2026-08-25',
    services: [
      { service_id: 'adm-aju-general', title_snapshot: 'Ajuste general', description_snapshot: 'Revisión y ajuste completo de la bici', unit_price: 12000, quantity: 1 },
    ],
    inventoryItems: [],
    photos: [],
  },
  {
    id: 'ord-0139',
    numero: 'OT-0139',
    customerId: 'cus-rulo',
    bicycleId: 'bic-rulo',
    estado: 'terminado',
    fechaEstimada: iso('2026-08-27'),
    observaciones: null,
    createdDay: '2026-08-24',
    services: [
      { service_id: 'adm-diagnostico', title_snapshot: 'Diagnóstico', description_snapshot: 'Revisión detallada, sin reparación', unit_price: 12000, quantity: 1 },
    ],
    inventoryItems: [],
    photos: [],
  },
  {
    id: 'ord-0138',
    numero: 'OT-0138',
    customerId: 'cus-carla',
    bicycleId: 'bic-carla',
    estado: 'terminado',
    fechaEstimada: iso('2026-08-26'),
    observaciones: null,
    createdDay: '2026-08-23',
    services: [
      { service_id: 'adm-armado-rueda', title_snapshot: 'Armado de rueda trasera', description_snapshot: 'Rayos y centrado', unit_price: 24800, quantity: 1 },
    ],
    inventoryItems: [],
    photos: [],
  },
  {
    id: 'ord-0137',
    numero: 'OT-0137',
    customerId: 'cus-marcos',
    bicycleId: 'bic-marcos',
    estado: 'terminado',
    fechaEstimada: iso('2026-08-25'),
    observaciones: null,
    createdDay: '2026-08-22',
    services: [
      { service_id: 'adm-cambio-cadena', title_snapshot: 'Cambio de cadena', description_snapshot: 'Incluye medición de desgaste', unit_price: 14500, quantity: 1 },
    ],
    inventoryItems: [
      { inventory_item_id: 'inv-cadena-8v', name_snapshot: 'Cadena 8v', unit_price: 11600, quantity: 1, consumed_at: iso('2026-08-22') },
    ],
    photos: [],
  },
];

function toWorkOrder(seed: SeedWorkOrder): WorkOrder {
  const subtotalServices = seed.services.reduce((acc, s) => acc + s.unit_price * s.quantity, 0);
  const subtotalItems = seed.inventoryItems.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
  return {
    id: seed.id,
    customer_id: seed.customerId,
    bicycle_id: seed.bicycleId,
    fecha_estimada_entrega: seed.fechaEstimada,
    observaciones: seed.observaciones,
    estado: seed.estado,
    total: subtotalServices + subtotalItems,
    created_at: iso(seed.createdDay),
    updated_at: iso(seed.createdDay, '18:00:00'),
    created_by: 'mock-admin',
  };
}

function toDetail(seed: SeedWorkOrder): WorkOrderDetail {
  const services: WorkOrderService[] = seed.services.map((s, i) => ({
    id: `${seed.id}-svc-${i}`,
    work_order_id: seed.id,
    service_id: s.service_id,
    title_snapshot: s.title_snapshot,
    description_snapshot: s.description_snapshot,
    unit_price: s.unit_price,
    quantity: s.quantity,
    subtotal: s.unit_price * s.quantity,
  }));
  const inventoryItems: WorkOrderInventoryItem[] = seed.inventoryItems.map((it, i) => ({
    id: `${seed.id}-inv-${i}`,
    work_order_id: seed.id,
    inventory_item_id: it.inventory_item_id,
    name_snapshot: it.name_snapshot,
    unit_price: it.unit_price,
    quantity: it.quantity,
    subtotal: it.unit_price * it.quantity,
    consumed_at: it.consumed_at,
  }));
  const photos: WorkOrderPhoto[] = seed.photos.map((p, i) => ({
    id: `${seed.id}-ph-${i}`,
    work_order_id: seed.id,
    storage_path: p.storage_path,
    tipo: p.tipo,
    descripcion: p.descripcion,
    created_at: p.created_at,
  }));
  return {
    ...toWorkOrder(seed),
    customer: CUSTOMERS[seed.customerId],
    bicycle: BICYCLES[seed.bicycleId],
    services,
    inventoryItems,
    photos,
  };
}

const DETAILS: WorkOrderDetail[] = SEED.map(toDetail);

export async function listWorkOrders(params?: { estado?: WorkOrderStatus }): Promise<WorkOrder[]> {
  await delay();
  let rows = SEED.map(toWorkOrder);
  if (params?.estado) rows = rows.filter((o) => o.estado === params.estado);
  return clone(rows);
}

export async function getWorkOrder(id: string): Promise<WorkOrderDetail> {
  await delay();
  const detail = DETAILS.find((d) => d.id === id);
  if (!detail) throw new Error('Orden no encontrada');
  return clone(detail);
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrderDetail> {
  await delay();
  const customerId = input.customer.id ?? uid();
  const bicycleId = input.bicycle.id ?? uid();
  const customer: Customer = {
    id: customerId,
    nombre: input.customer.nombre,
    apellido: input.customer.apellido,
    telefono: input.customer.telefono,
    direccion: input.customer.direccion ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const bicycle: Bicycle = {
    id: bicycleId,
    customer_id: customerId,
    marca: input.bicycle.marca,
    modelo: input.bicycle.modelo,
    color: input.bicycle.color ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const now = new Date().toISOString();
  const id = `ord-${Date.now().toString(36)}`;
  const services: WorkOrderService[] = input.services.map((s, i) => ({
    id: `${id}-svc-${i}`,
    work_order_id: id,
    service_id: s.service_id ?? null,
    title_snapshot: s.title_snapshot,
    description_snapshot: s.description_snapshot ?? null,
    unit_price: s.unit_price,
    quantity: s.quantity,
    subtotal: s.unit_price * s.quantity,
  }));
  const inventoryItems: WorkOrderInventoryItem[] = input.inventory_items.map((it, i) => ({
    id: `${id}-inv-${i}`,
    work_order_id: id,
    inventory_item_id: it.inventory_item_id ?? null,
    name_snapshot: it.name_snapshot,
    unit_price: it.unit_price,
    quantity: it.quantity,
    subtotal: it.unit_price * it.quantity,
    consumed_at: null,
  }));
  const detail: WorkOrderDetail = {
    id,
    customer_id: customerId,
    bicycle_id: bicycleId,
    fecha_estimada_entrega: input.fecha_estimada_entrega ?? null,
    observaciones: input.observaciones ?? null,
    estado: 'pendiente',
    total:
      services.reduce((a, s) => a + s.subtotal, 0) +
      inventoryItems.reduce((a, i) => a + i.subtotal, 0),
    created_at: now,
    updated_at: now,
    created_by: 'mock-admin',
    customer,
    bicycle,
    services,
    inventoryItems,
    photos: [],
  };
  DETAILS.unshift(detail);
  return clone(detail);
}

export async function updateWorkOrderStatus(input: {
  work_order_id: string;
  new_status: WorkOrderStatus;
}): Promise<WorkOrder> {
  await delay();
  const detail = DETAILS.find((d) => d.id === input.work_order_id);
  if (!detail) throw new Error('Orden no encontrada');
  // Al pasar la orden a "terminado" el inventario se consume de forma
  // automatica (igual que en produccion via el RPC update_work_order_status).
  if (input.new_status === 'terminado') {
    const now = new Date().toISOString();
    detail.inventoryItems.forEach((it) => {
      if (!it.consumed_at) it.consumed_at = now;
    });
  }
  detail.estado = input.new_status;
  detail.updated_at = new Date().toISOString();
  return clone(toWorkOrderDetailToWorkOrder(detail));
}

function toWorkOrderDetailToWorkOrder(detail: WorkOrderDetail): WorkOrder {
  const { customer: _c, bicycle: _b, services: _s, inventoryItems: _i, photos: _p, ...workOrder } = detail;
  return workOrder;
}

export async function uploadWorkOrderPhoto(input: {
  workOrderId: string;
  file: File;
  tipo: WorkOrderPhoto['tipo'];
  descripcion?: string;
}): Promise<WorkOrderPhoto> {
  await delay();
  const detail = DETAILS.find((d) => d.id === input.workOrderId);
  if (!detail) throw new Error('Orden no encontrada');
  const storagePath = URL.createObjectURL(input.file);
  const photo: WorkOrderPhoto = {
    id: uid(),
    work_order_id: input.workOrderId,
    storage_path: storagePath,
    tipo: input.tipo,
    descripcion: input.descripcion ?? null,
    created_at: new Date().toISOString(),
  };
  detail.photos = [...detail.photos, photo];
  return clone(photo);
}

export async function consumeWorkOrderInventoryItem(input: {
  workOrderInventoryItemId: string;
}): Promise<{ item: WorkOrderInventoryItem; movement: StockMovement }> {
  await delay();
  for (const detail of DETAILS) {
    const target = detail.inventoryItems.find((i) => i.id === input.workOrderInventoryItemId);
    if (target) {
      target.consumed_at = new Date().toISOString();
      const movement: StockMovement = {
        id: uid(),
        inventory_item_id: target.inventory_item_id ?? '',
        tipo: 'consumo_trabajo',
        cantidad: target.quantity,
        stock_anterior: 0,
        stock_posterior: 0,
        motivo: `${detail.id} · ${target.name_snapshot}`,
        work_order_id: detail.id,
        created_by: 'mock-admin',
        created_at: new Date().toISOString(),
      };
      return { item: clone(target), movement: clone(movement) };
    }
  }
  throw new Error('Item no encontrado');
}

export { today };
