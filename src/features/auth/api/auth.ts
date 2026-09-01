import { supabase } from '@/lib/supabase/client';

/**
 * Autenticacion real via Supabase Auth. A diferencia de la capa de datos
 * (mock-first), el login NO tiene stub: requiere credenciales reales en
 * `.env` (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY) para entrar
 * al dashboard. Sin ellas, auth falla de forma controlada (no crashea).
 */

const NOT_CONFIGURED = 'Supabase no configurado. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en tu .env';

export interface SignInResult {
  error: string | null;
}

/** Inicia sesion con email + contrasena. */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  if (!supabase) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

/** Cierra la sesion actual. */
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export interface ResetResult {
  error: string | null;
}

/** Envia el email de restablecimiento de contrasena. */
export async function requestPasswordReset(email: string): Promise<ResetResult> {
  if (!supabase) return { error: NOT_CONFIGURED };
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error: error?.message ?? null };
}
