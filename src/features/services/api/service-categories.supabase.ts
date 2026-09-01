import { supabase } from '@/lib/supabase/client';
import type { ServiceCategory } from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type CategoryRow = {
  id: string;
  nombre: string;
  slug: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

function toCategory(row: CategoryRow): ServiceCategory {
  return {
    id: row.id,
    nombre: row.nombre,
    slug: row.slug,
    orden: row.orden,
    activo: row.activo,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listServiceCategories(): Promise<ServiceCategory[]> {
  const { data, error } = await db()
    .from('service_categories')
    .select('*')
    .order('orden', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []).map(toCategory);
}

export async function createServiceCategory(input: {
  nombre: string;
}): Promise<ServiceCategory> {
  const { data, error } = await db()
    .from('service_categories')
    .insert({ nombre: input.nombre })
    .select('*')
    .single();
  if (error) throw error;
  return toCategory(data);
}

export async function updateServiceCategory(input: {
  id: string;
  nombre?: string;
  orden?: number;
  activo?: boolean;
}): Promise<ServiceCategory> {
  const patch: Partial<CategoryRow> = {};
  if (input.nombre !== undefined) patch.nombre = input.nombre;
  if (input.orden !== undefined) patch.orden = input.orden;
  if (input.activo !== undefined) patch.activo = input.activo;
  const { data, error } = await db()
    .from('service_categories')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single();
  if (error) throw error;
  return toCategory(data);
}

export async function deleteServiceCategory(input: { id: string }): Promise<void> {
  const { error } = await db().from('service_categories').delete().eq('id', input.id);
  if (error) throw error;
}
