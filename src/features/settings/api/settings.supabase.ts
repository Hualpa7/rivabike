import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { SiteSettings } from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type SettingsRow = Record<string, string | null | boolean>;

function toSettings(row: SettingsRow): SiteSettings {
  return row as unknown as SiteSettings;
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
