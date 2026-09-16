import { useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/store';
import { resolveIsStaff } from '@/features/auth/api';

/**
 * Sincroniza el estado de Supabase Auth con el store de Zustand.
 * No implementa UI: solo cablea sesion inicial + listener de cambios, y
 * resuelve `isStaff` (fila propia en `profiles`) cuando hay sesion.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setIsStaff = useAuthStore((s) => s.setIsStaff);
  const setIsStaffResolved = useAuthStore((s) => s.setIsStaffResolved);

  useEffect(() => {
    const syncIsStaff = (auth: boolean) => {
      if (auth) {
        void resolveIsStaff()
          .then((value) => {
            setIsStaff(value);
            setIsStaffResolved(true);
          })
          .catch(() => {
            setIsStaff(false);
            setIsStaffResolved(true);
          });
      } else {
        setIsStaff(false);
        setIsStaffResolved(true);
      }
    };

    if (!supabase) {
      setSession(null);
      setIsStaff(false);
      setIsStaffResolved(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      syncIsStaff(Boolean(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      syncIsStaff(Boolean(session));
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession, setIsStaff, setIsStaffResolved]);

  return <>{children}</>;
}
