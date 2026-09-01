import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/app/config/env';
import type { Database } from './types';

/**
 * Cliente Supabase. Solo se instancia si hay credenciales en `.env`
 * (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY). En modo mock/dev sin
 * credenciales es `null`: la landing (mock-first) igual renderiza, y auth
 * degrada a un error claro en lugar de crashear la app al cargar.
 */
export const supabase: SupabaseClient<Database> | null = env.supabaseUrl
  ? createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
