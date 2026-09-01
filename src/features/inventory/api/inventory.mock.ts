import type {
  InventoryItem,
  NewInventoryItemInput,
  RegisterStockMovementInput,
  StockMovement,
  UpdateInventoryItemInput,
} from '@/types';
import { clone, delay, uid } from '@/lib/mock/helpers';

const BASE = '2026-08-20T12:00:00.000Z';

function inv(partial: Omit<InventoryItem, 'created_at' | 'updated_at'>): InventoryItem {
  return { ...partial, created_at: BASE, updated_at: BASE };
}

let ITEMS: InventoryItem[] = [
  inv({
    id: 'inv-camara-26',
    nombre: 'Cámara 26×1.95',
    descripcion: 'Cámara para ruedas 26 pulgadas, ancho 1.95',
    stock_actual: 0,
    precio_unitario: 4200,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-cubierta-275',
    nombre: 'Cubierta 27.5×2.20',
    descripcion: 'Cubierta todo terreno para MTB 27.5',
    stock_actual: 2,
    precio_unitario: 18400,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-cubierta-29',
    nombre: 'Cubierta 29×2.10',
    descripcion: 'Cubierta MTB 29 pulgadas, perfil mixto',
    stock_actual: 5,
    precio_unitario: 20900,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-cable-freno',
    nombre: 'Cable de freno',
    descripcion: 'Cable de freno interior, 2.2m',
    stock_actual: 14,
    precio_unitario: 2600,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-pastillas',
    nombre: 'Pastillas de freno',
    descripcion: 'Juego de pastillas para freno de llanta',
    stock_actual: 0,
    precio_unitario: 7800,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-cadena-8v',
    nombre: 'Cadena 8v',
    descripcion: 'Cadena de 8 velocidades, 116 eslabones',
    stock_actual: 9,
    precio_unitario: 11600,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-camara-29',
    nombre: 'Cámara 29×1.95',
    descripcion: 'Cámara para ruedas 29 pulgadas, ancho 1.95',
    stock_actual: 11,
    precio_unitario: 5200,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-cinta-manubrio',
    nombre: 'Cinta de manubrio',
    descripcion: 'Cinta antideslizante con tapones',
    stock_actual: 6,
    precio_unitario: 3400,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-bielas',
    nombre: 'Bielas 170mm',
    descripcion: 'Juego de bielas 170mm con platos',
    stock_actual: 3,
    precio_unitario: 36500,
    imagen_url: null,
    activo: true,
  }),
  inv({
    id: 'inv-faro-led',
    nombre: 'Faro LED',
    descripcion: 'Faro delantero LED recargable',
    stock_actual: 7,
    precio_unitario: 12400,
    imagen_url: null,
    activo: true,
  }),
];

let MOVEMENTS: StockMovement[] = [];

export async function listInventoryItems(params?: {
  search?: string;
  onlyActive?: boolean;
}): Promise<InventoryItem[]> {
  await delay();
  let items = ITEMS;
  if (params?.onlyActive) items = items.filter((i) => i.activo);
  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter((i) => (i.nombre + ' ' + (i.descripcion ?? '')).toLowerCase().includes(q));
  }
  return clone(items);
}

export async function createInventoryItem(input: NewInventoryItemInput): Promise<InventoryItem> {
  await delay();
  const now = new Date().toISOString();
  const next: InventoryItem = {
    id: uid(),
    nombre: input.nombre,
    descripcion: input.descripcion ?? null,
    stock_actual: input.stock_actual,
    precio_unitario: input.precio_unitario,
    imagen_url: input.imagen_url ?? null,
    activo: input.activo ?? true,
    created_at: now,
    updated_at: now,
  };
  ITEMS = [next, ...ITEMS];
  return clone(next);
}

export async function updateInventoryItem(input: UpdateInventoryItemInput): Promise<InventoryItem> {
  await delay();
  const idx = ITEMS.findIndex((i) => i.id === input.id);
  if (idx === -1) throw new Error('Producto no encontrado');
  const updated: InventoryItem = {
    ...ITEMS[idx],
    ...input,
    updated_at: new Date().toISOString(),
  };
  ITEMS[idx] = updated;
  return clone(updated);
}

export async function registerStockMovement(
  input: RegisterStockMovementInput,
): Promise<{ movement: StockMovement; item: InventoryItem }> {
  await delay();
  const idx = ITEMS.findIndex((i) => i.id === input.inventory_item_id);
  if (idx === -1) throw new Error('Producto no encontrado');
  const item = ITEMS[idx];
  const stockAnterior = item.stock_actual;

  if (input.tipo === 'consumo_trabajo' || input.tipo === 'salida') {
    if (input.cantidad > stockAnterior) {
      throw new Error('Stock insuficiente');
    }
  }

  const delta =
    input.tipo === 'entrada' || input.tipo === 'devolucion' ? input.cantidad : -input.cantidad;
  const stockPosterior = Math.max(0, stockAnterior + delta);

  const movement: StockMovement = {
    id: uid(),
    inventory_item_id: item.id,
    tipo: input.tipo,
    cantidad: input.cantidad,
    stock_anterior: stockAnterior,
    stock_posterior: stockPosterior,
    motivo: input.motivo,
    work_order_id: input.work_order_id ?? null,
    created_by: 'mock-admin',
    created_at: new Date().toISOString(),
  };
  MOVEMENTS = [movement, ...MOVEMENTS];

  const updated: InventoryItem = { ...item, stock_actual: stockPosterior, updated_at: movement.created_at };
  ITEMS[idx] = updated;

  return { movement: clone(movement), item: clone(updated) };
}

export async function listStockMovements(params?: {
  inventoryItemId?: string;
  workOrderId?: string;
  tipo?: StockMovement['tipo'];
}): Promise<StockMovement[]> {
  await delay();
  let rows = MOVEMENTS;
  if (params?.inventoryItemId) rows = rows.filter((m) => m.inventory_item_id === params.inventoryItemId);
  if (params?.workOrderId) rows = rows.filter((m) => m.work_order_id === params.workOrderId);
  if (params?.tipo) rows = rows.filter((m) => m.tipo === params.tipo);
  return clone(rows);
}
