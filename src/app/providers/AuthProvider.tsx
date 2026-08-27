import { useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/store';

/**
 * Sincroniza el estado de Supabase Auth con el store de Zustand.
 * No implementa UI: solo cablea sesion inicial + listener de cambios.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession]);

  return <>{children}</>;
}
