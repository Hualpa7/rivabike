import { createClient } from '@supabase/supabase-js';
import { env } from '@/app/config/env';
// import type { Database } from './types'; // habilitar cuando se generen los tipos con la CLI de Supabase

export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
