import { supabase } from '@/lib/supabase/client';
import type { Customer } from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type CustomerRow = {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string | null;
  created_at: string;
  updated_at: string;
};

export async function searchCustomers(query: string): Promise<Customer[]> {
  const q = `%${query.trim()}%`;
  const { data, error } = await db()
    .from('customers')
    .select('*')
    .or(`nombre.ilike.${q},apellido.ilike.${q},telefono.ilike.${q}`)
    .order('nombre', { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((row: CustomerRow) => ({
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    telefono: row.telefono,
    direccion: row.direccion,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}
