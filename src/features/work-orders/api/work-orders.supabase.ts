import { supabase } from '@/lib/supabase/client';
import type {
  CreateWorkOrderInput,
  StockMovement,
  WorkOrder,
  WorkOrderDetail,
  WorkOrderInventoryItem,
  WorkOrderPhoto,
  WorkOrderStatus,
} from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type WorkOrderRow = {
  id: string;
  customer_id: string;
  bicycle_id: string;
  fecha_estimada_entrega: string | null;
  observaciones: string | null;
  estado: string;
  total: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  customer?: {
    id: string;
    nombre: string;
    apellido: string;
    telefono: string;
  } | null;
  bicycle?: {
    id: string;
    marca: string;
    modelo: string;
    color: string | null;
  } | null;
};

function toWorkOrder(row: WorkOrderRow): WorkOrder {
  return {
    id: row.id,
    customer_id: row.customer_id,
    bicycle_id: row.bicycle_id,
    fecha_estimada_entrega: row.fecha_estimada_entrega,
    observaciones: row.observaciones,
    estado: row.estado as WorkOrderStatus,
    total: Number(row.total),
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    customer: row.customer ?? null,
    bicycle: row.bicycle ?? null,
  };
}

export async function listWorkOrders(params?: { estado?: WorkOrderStatus }): Promise<WorkOrder[]> {
  let query = db()
    .from('work_orders')
    .select(
      '*, customer:customers(id, nombre, apellido, telefono), bicycle:bicycles(id, marca, modelo, color)',
    )
    .order('created_at', { ascending: false });
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toWorkOrder);
}

export async function getWorkOrder(id: string): Promise<WorkOrderDetail> {
  const { data, error } = await db().rpc('get_work_order_detail', { p_work_order_id: id });
  if (error) throw error;
  return resolvePhotos(normalizeDetail(data));
}

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrderDetail> {
  const payload = {
    customer: {
      id: input.customer.id ?? null,
      nombre: input.customer.nombre,
      apellido: input.customer.apellido,
      telefono: input.customer.telefono,
      direccion: input.customer.direccion ?? null,
    },
    bicycle: {
      id: input.bicycle.id ?? null,
      marca: input.bicycle.marca,
      modelo: input.bicycle.modelo,
      color: input.bicycle.color ?? null,
    },
    fecha_estimada_entrega: input.fecha_estimada_entrega ?? null,
    observaciones: input.observaciones ?? null,
    services: input.services.map((s) => ({
      service_id: s.service_id ?? null,
      title_snapshot: s.title_snapshot,
      description_snapshot: s.description_snapshot ?? null,
      unit_price: s.unit_price,
      quantity: s.quantity,
    })),
    inventory_items: input.inventory_items.map((it) => ({
      inventory_item_id: it.inventory_item_id ?? null,
      name_snapshot: it.name_snapshot,
      unit_price: it.unit_price,
      quantity: it.quantity,
    })),
  };
  const { data, error } = await db().rpc('create_work_order', { payload });
  if (error) throw error;
  return resolvePhotos(normalizeDetail(data));
}

export async function updateWorkOrderStatus(input: {
  work_order_id: string;
  new_status: WorkOrderStatus;
}): Promise<WorkOrder> {
  const { data, error } = await db().rpc('update_work_order_status', {
    p_work_order_id: input.work_order_id,
    p_new_status: input.new_status,
  });
  if (error) throw error;
  return toWorkOrder(data as WorkOrderRow);
}

export async function updateWorkOrderObservaciones(input: {
  work_order_id: string;
  observaciones: string | null;
}): Promise<WorkOrderDetail> {
  const { data, error } = await db().rpc('update_work_order_observaciones', {
    p_work_order_id: input.work_order_id,
    p_observaciones: input.observaciones,
  });
  if (error) throw error;
  return resolvePhotos(normalizeDetail(data));
}

export async function uploadWorkOrderPhoto(input: {
  workOrderId: string;
  file: File;
  tipo: WorkOrderPhoto['tipo'];
  descripcion?: string;
}): Promise<WorkOrderPhoto> {
  const filePath = `${input.workOrderId}/${Date.now()}-${input.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error: uploadError } = await db()
    .storage.from('work-order-photos')
    .upload(filePath, input.file, {
      cacheControl: '3600',
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data, error } = await db()
    .from('work_order_photos')
    .insert({
      work_order_id: input.workOrderId,
      storage_path: filePath,
      tipo: input.tipo,
      descripcion: input.descripcion ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    work_order_id: data.work_order_id,
    storage_path: await resolvePhotoUrl(data.storage_path),
    tipo: data.tipo as WorkOrderPhoto['tipo'],
    descripcion: data.descripcion,
    created_at: data.created_at,
  };
}

export async function consumeWorkOrderInventoryItem(input: {
  workOrderInventoryItemId: string;
}): Promise<{ item: WorkOrderInventoryItem; movement: StockMovement }> {
  const { data, error } = await db().rpc('consume_work_order_inventory_item', {
    p_work_order_inventory_item_id: input.workOrderInventoryItemId,
  });
  if (error) throw error;
  const result = data as unknown as {
    item: WorkOrderInventoryItem;
    movement: StockMovement;
  };
  return {
    item: result.item,
    movement: result.movement,
  };
}

// ---------------------------------------------------------------------------
// Helpers de normalizacion del jsonb devuelto por las RPCs
// ---------------------------------------------------------------------------

type RawWoi = {
  id: string;
  work_order_id: string;
  inventory_item_id: string | null;
  name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  consumed_at: string | null;
};

type RawPhoto = {
  id: string;
  work_order_id: string;
  storage_path: string;
  tipo: string;
  descripcion: string | null;
  created_at: string;
};

function normalizeDetail(data: unknown): WorkOrderDetail {
  const d = data as {
    id: string;
    customer_id: string;
    bicycle_id: string;
    fecha_estimada_entrega: string | null;
    observaciones: string | null;
    estado: string;
    total: number;
    created_at: string;
    updated_at: string;
    created_by: string;
    customer: {
      id: string;
      nombre: string;
      apellido: string;
      telefono: string;
      direccion: string | null;
      created_at: string;
      updated_at: string;
    };
    bicycle: {
      id: string;
      customer_id: string;
      marca: string;
      modelo: string;
      color: string | null;
      created_at: string;
      updated_at: string;
    };
    services: Array<{
      id: string;
      work_order_id: string;
      service_id: string | null;
      title_snapshot: string;
      description_snapshot: string | null;
      unit_price: number;
      quantity: number;
      subtotal: number;
    }>;
    inventoryItems: RawWoi[];
    photos: RawPhoto[];
  };

  return {
    id: d.id,
    customer_id: d.customer_id,
    bicycle_id: d.bicycle_id,
    fecha_estimada_entrega: d.fecha_estimada_entrega,
    observaciones: d.observaciones,
    estado: d.estado as WorkOrderStatus,
    total: Number(d.total),
    created_at: d.created_at,
    updated_at: d.updated_at,
    created_by: d.created_by,
    customer: {
      id: d.customer.id,
      nombre: d.customer.nombre,
      apellido: d.customer.apellido,
      telefono: d.customer.telefono,
      direccion: d.customer.direccion,
      created_at: d.customer.created_at,
      updated_at: d.customer.updated_at,
    },
    bicycle: {
      id: d.bicycle.id,
      customer_id: d.bicycle.customer_id,
      marca: d.bicycle.marca,
      modelo: d.bicycle.modelo,
      color: d.bicycle.color,
      created_at: d.bicycle.created_at,
      updated_at: d.bicycle.updated_at,
    },
    services: d.services.map((s) => ({
      id: s.id,
      work_order_id: s.work_order_id,
      service_id: s.service_id,
      title_snapshot: s.title_snapshot,
      description_snapshot: s.description_snapshot,
      unit_price: Number(s.unit_price),
      quantity: s.quantity,
      subtotal: Number(s.subtotal),
    })),
    inventoryItems: d.inventoryItems.map((it) => ({
      id: it.id,
      work_order_id: it.work_order_id,
      inventory_item_id: it.inventory_item_id,
      name_snapshot: it.name_snapshot,
      unit_price: Number(it.unit_price),
      quantity: it.quantity,
      subtotal: Number(it.subtotal),
      consumed_at: it.consumed_at,
    })),
    photos: d.photos.map((p) => ({
      id: p.id,
      work_order_id: p.work_order_id,
      storage_path: p.storage_path,
      tipo: p.tipo as WorkOrderPhoto['tipo'],
      descripcion: p.descripcion,
      created_at: p.created_at,
    })),
  };
}

async function resolvePhotoUrl(path: string): Promise<string> {
  if (/^https?:\/\//.test(path)) return path;
  const { data, error } = await db()
    .storage.from('work-order-photos')
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return path;
  return data.signedUrl;
}

async function resolvePhotos(detail: WorkOrderDetail): Promise<WorkOrderDetail> {
  if (detail.photos.length === 0) return detail;
  const photos = await Promise.all(
    detail.photos.map(async (p) => ({ ...p, storage_path: await resolvePhotoUrl(p.storage_path) })),
  );
  return { ...detail, photos };
}
