import { supabase } from '@/lib/supabase/client';
import type { NewServiceInput, Service, UpdateServiceInput } from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type ServiceRow = {
  id: string;
  titulo: string;
  descripcion: string;
  precio_base: number;
  activo: boolean;
  imagen_url: string | null;
  plazo: string | null;
  categoria: string | null;
  categoria_id: string | null;
  orden: number | null;
  created_at: string;
  updated_at: string;
  service_categories: { nombre: string } | null;
};

function toService(row: ServiceRow): Service {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    precio_base: Number(row.precio_base),
    activo: row.activo,
    imagen_url: row.imagen_url,
    plazo: row.plazo,
    categoria: row.categoria,
    categoria_id: row.categoria_id,
    categoria_nombre: row.service_categories?.nombre ?? row.categoria ?? null,
    orden: row.orden,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listServices(params?: { onlyActive?: boolean }): Promise<Service[]> {
  let query = db().from('services').select('*, service_categories(nombre)').order('orden', { ascending: true, nullsFirst: true });
  if (params?.onlyActive) query = query.eq('activo', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toService);
}

export async function listServicesAdmin(): Promise<Service[]> {
  const { data, error } = await db()
    .from('services')
    .select('*, service_categories(nombre)')
    .order('orden', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []).map(toService);
}

export async function createService(input: NewServiceInput): Promise<Service> {
  const { data, error } = await db()
    .from('services')
    .insert({
      titulo: input.titulo,
      descripcion: input.descripcion,
      precio_base: input.precio_base,
      activo: input.activo ?? true,
      imagen_url: input.imagen_url ?? null,
      plazo: input.plazo ?? null,
      categoria: input.categoria ?? null,
      categoria_id: input.categoria_id ?? null,
    })
    .select('*, service_categories(nombre)')
    .single();
  if (error) throw error;
  return toService(data);
}

export async function updateService(input: UpdateServiceInput): Promise<Service> {
  const patch: Partial<Omit<ServiceRow, 'service_categories'>> = {};
  if (input.titulo !== undefined) patch.titulo = input.titulo;
  if (input.descripcion !== undefined) patch.descripcion = input.descripcion;
  if (input.precio_base !== undefined) patch.precio_base = input.precio_base;
  if (input.activo !== undefined) patch.activo = input.activo;
  if (input.imagen_url !== undefined) patch.imagen_url = input.imagen_url;
  if (input.plazo !== undefined) patch.plazo = input.plazo;
  if (input.categoria !== undefined) patch.categoria = input.categoria;
  if (input.categoria_id !== undefined) patch.categoria_id = input.categoria_id;

  const { data, error } = await db()
    .from('services')
    .update(patch)
    .eq('id', input.id)
    .select('*, service_categories(nombre)')
    .single();
  if (error) throw error;
  return toService(data);
}

export async function toggleServiceActive(input: { id: string; activo: boolean }): Promise<Service> {
  const { data, error } = await db()
    .from('services')
    .update({ activo: input.activo })
    .eq('id', input.id)
    .select('*, service_categories(nombre)')
    .single();
  if (error) throw error;
  return toService(data);
}
