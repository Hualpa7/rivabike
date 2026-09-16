import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { PdfCondiciones, PdfCondicionesTipo, SiteSettings } from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type SettingsRow = Record<string, string | null | boolean>;

function toSettings(row: SettingsRow): SiteSettings {
  return row as unknown as SiteSettings;
}

type PdfCondicionesRow = Database['public']['Tables']['pdf_condiciones']['Row'];

function toPdfCondiciones(row: PdfCondicionesRow): PdfCondiciones {
  return {
    id: row.id,
    tipo: row.tipo as PdfCondicionesTipo,
    items: Array.isArray(row.items) ? row.items : [],
    updated_at: row.updated_at,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await db()
    .from('site_settings')
    .select('*')
    .eq('id', true)
    .single();
  if (error) throw error;
  return toSettings(data);
}

export async function getSiteSettingsAdmin(): Promise<SiteSettings> {
  const { data, error } = await db()
    .from('site_settings')
    .select('*')
    .eq('id', true)
    .single();
  if (error) throw error;
  return toSettings(data);
}

export async function updateSiteSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  const patch = input as Database['public']['Tables']['site_settings']['Update'];
  const { data, error } = await db()
    .from('site_settings')
    .update(patch)
    .eq('id', true)
    .select('*')
    .single();
  if (error) throw error;
  return toSettings(data);
}

export async function getPdfCondiciones(): Promise<PdfCondiciones[]> {
  const { data, error } = await db()
    .from('pdf_condiciones')
    .select('*')
    .order('tipo', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toPdfCondiciones);
}

export async function updatePdfCondiciones(input: {
  tipo: PdfCondicionesTipo;
  items: string[];
}): Promise<PdfCondiciones> {
  const { data, error } = await db().rpc('upsert_pdf_condiciones', {
    p_tipo: input.tipo,
    p_items: input.items,
  });
  if (error) throw error;
  return toPdfCondiciones(data);
}
