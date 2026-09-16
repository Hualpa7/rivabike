import { supabase } from '@/lib/supabase/client';
import type {
  CreatePresupuestoInput,
  Presupuesto,
  PresupuestoDetail,
  PresupuestoInventoryItem,
  PresupuestoService,
  PresupuestoStatus,
} from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type PresupuestoRow = {
  id: string;
  code: string;
  customer_id: string;
  bicycle_id: string;
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
    color: string | null;
  } | null;
};

function toPresupuesto(row: PresupuestoRow): Presupuesto {
  return {
    id: row.id,
    code: row.code,
    customer_id: row.customer_id,
    bicycle_id: row.bicycle_id,
    observaciones: row.observaciones,
    estado: row.estado as PresupuestoStatus,
    total: Number(row.total),
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    customer: row.customer ?? null,
    bicycle: row.bicycle ?? null,
  };
}

export async function listPresupuestos(): Promise<Presupuesto[]> {
  const { data, error } = await db()
    .from('presupuestos')
    .select(
      '*, customer:customers(id, nombre, apellido, telefono), bicycle:bicycles(id, marca, color)',
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toPresupuesto);
}

export async function getPresupuesto(id: string): Promise<PresupuestoDetail> {
  const { data, error } = await db().rpc('get_presupuesto_detail', { p_presupuesto_id: id });
  if (error) throw error;
  return normalizeDetail(data);
}

export async function createPresupuesto(input: CreatePresupuestoInput): Promise<PresupuestoDetail> {
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
      color: input.bicycle.color ?? null,
    },
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
  const { data, error } = await db().rpc('create_presupuesto', { payload });
  if (error) throw error;
  return normalizeDetail(data);
}

export async function updatePresupuestoObservaciones(input: {
  presupuesto_id: string;
  observaciones: string | null;
}): Promise<PresupuestoDetail> {
  const { data, error } = await db().rpc('update_presupuesto_observaciones', {
    p_presupuesto_id: input.presupuesto_id,
    p_observaciones: input.observaciones,
  });
  if (error) throw error;
  return normalizeDetail(data);
}

export async function updatePresupuestoEstado(input: {
  presupuesto_id: string;
  new_estado: PresupuestoStatus;
}): Promise<Presupuesto> {
  const { data, error } = await db().rpc('update_presupuesto_estado', {
    p_presupuesto_id: input.presupuesto_id,
    p_new_estado: input.new_estado,
  });
  if (error) throw error;
  return toPresupuesto(data as PresupuestoRow);
}

export async function deletePresupuesto(input: { presupuesto_id: string }): Promise<void> {
  const { error } = await db().rpc('delete_presupuesto', {
    p_presupuesto_id: input.presupuesto_id,
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Helpers de normalizacion del jsonb devuelto por las RPCs
// ---------------------------------------------------------------------------

function normalizeDetail(data: unknown): PresupuestoDetail {
  const d = data as {
    id: string;
    code: string;
    customer_id: string;
    bicycle_id: string;
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
      color: string | null;
      created_at: string;
      updated_at: string;
    };
    services: Array<{
      id: string;
      presupuesto_id: string;
      service_id: string | null;
      title_snapshot: string;
      description_snapshot: string | null;
      unit_price: number;
      quantity: number;
      subtotal: number;
    }>;
    inventoryItems: Array<{
      id: string;
      presupuesto_id: string;
      inventory_item_id: string | null;
      name_snapshot: string;
      unit_price: number;
      quantity: number;
      subtotal: number;
    }>;
  };

  const services: PresupuestoService[] = d.services.map((s) => ({
    id: s.id,
    presupuesto_id: s.presupuesto_id,
    service_id: s.service_id,
    title_snapshot: s.title_snapshot,
    description_snapshot: s.description_snapshot,
    unit_price: Number(s.unit_price),
    quantity: s.quantity,
    subtotal: Number(s.subtotal),
  }));
  const inventoryItems: PresupuestoInventoryItem[] = d.inventoryItems.map((it) => ({
    id: it.id,
    presupuesto_id: it.presupuesto_id,
    inventory_item_id: it.inventory_item_id,
    name_snapshot: it.name_snapshot,
    unit_price: Number(it.unit_price),
    quantity: it.quantity,
    subtotal: Number(it.subtotal),
  }));

  return {
    id: d.id,
    code: d.code,
    customer_id: d.customer_id,
    bicycle_id: d.bicycle_id,
    observaciones: d.observaciones,
    estado: d.estado as PresupuestoStatus,
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
      color: d.bicycle.color,
      created_at: d.bicycle.created_at,
      updated_at: d.bicycle.updated_at,
    },
    services,
    inventoryItems,
  };
}