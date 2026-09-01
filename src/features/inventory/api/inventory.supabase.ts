import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type {
  InventoryItem,
  NewInventoryItemInput,
  RegisterStockMovementInput,
  StockMovement,
  UpdateInventoryItemInput,
} from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type InventoryRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  stock_actual: number;
  precio_unitario: number;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

function toInventory(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    stock_actual: Number(row.stock_actual),
    precio_unitario: Number(row.precio_unitario),
    imagen_url: row.imagen_url,
    activo: row.activo,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toMovement(row: {
  id: string;
  inventory_item_id: string;
  tipo: string;
  cantidad: number;
  stock_anterior: number;
  stock_posterior: number;
  motivo: string | null;
  work_order_id: string | null;
  created_by: string;
  created_at: string;
}): StockMovement {
  return {
    id: row.id,
    inventory_item_id: row.inventory_item_id,
    tipo: row.tipo as StockMovement['tipo'],
    cantidad: Number(row.cantidad),
    stock_anterior: Number(row.stock_anterior),
    stock_posterior: Number(row.stock_posterior),
    motivo: row.motivo,
    work_order_id: row.work_order_id,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

export async function listInventoryItems(params?: {
  search?: string;
  onlyActive?: boolean;
}): Promise<InventoryItem[]> {
  let query = db().from('inventory_items').select('*').order('nombre', { ascending: true });
  if (params?.onlyActive) query = query.eq('activo', true);
  if (params?.search) query = query.ilike('nombre', `%${params.search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toInventory);
}

export async function createInventoryItem(input: NewInventoryItemInput): Promise<InventoryItem> {
  const { data, error } = await db()
    .from('inventory_items')
    .insert({
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      stock_actual: input.stock_actual,
      precio_unitario: input.precio_unitario,
      imagen_url: input.imagen_url ?? null,
      activo: input.activo ?? true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return toInventory(data);
}

export async function updateInventoryItem(input: UpdateInventoryItemInput): Promise<InventoryItem> {
  const patch: Database['public']['Tables']['inventory_items']['Update'] = {};
  // stock_actual se protege de UPDATE directo en backend (solo RPC): se ignora.
  if (input.nombre !== undefined) patch.nombre = input.nombre;
  if (input.descripcion !== undefined) patch.descripcion = input.descripcion;
  if (input.precio_unitario !== undefined) patch.precio_unitario = input.precio_unitario;
  if (input.imagen_url !== undefined) patch.imagen_url = input.imagen_url;
  if (input.activo !== undefined) patch.activo = input.activo;

  const { data, error } = await db()
    .from('inventory_items')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single();
  if (error) throw error;
  return toInventory(data);
}

export async function registerStockMovement(
  input: RegisterStockMovementInput,
): Promise<{ movement: StockMovement; item: InventoryItem }> {
  const { data, error } = await db().rpc('register_stock_movement', {
    p_inventory_item_id: input.inventory_item_id,
    p_tipo: input.tipo,
    p_cantidad: input.cantidad,
    p_motivo: input.motivo ?? undefined,
    p_work_order_id: input.work_order_id ?? undefined,
  });
  if (error) throw error;
  const result = data as unknown as { movement: StockMovement; item: InventoryItem };
  return {
    movement: toMovement(result.movement),
    item: toInventory(result.item),
  };
}

export async function listStockMovements(params?: {
  inventoryItemId?: string;
  workOrderId?: string;
  tipo?: StockMovement['tipo'];
}): Promise<StockMovement[]> {
  let query = db()
    .from('stock_movements')
    .select('*')
    .order('created_at', { ascending: false });
  if (params?.inventoryItemId) query = query.eq('inventory_item_id', params.inventoryItemId);
  if (params?.workOrderId) query = query.eq('work_order_id', params.workOrderId);
  if (params?.tipo) query = query.eq('tipo', params.tipo);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toMovement);
}
