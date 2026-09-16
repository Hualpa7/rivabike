import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isStaff: boolean;
  /** `true` cuando `resolveIsStaff` termino de correr (o no hay sesion). */
  isStaffResolved: boolean;
  setSession: (session: Session | null) => void;
  setIsStaff: (value: boolean) => void;
  setIsStaffResolved: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: 'loading',
  isStaff: false,
  isStaffResolved: false,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
    }),
  setIsStaff: (value) => set({ isStaff: value }),
  setIsStaffResolved: (value) => set({ isStaffResolved: value }),
  reset: () =>
    set({ session: null, user: null, status: 'unauthenticated', isStaff: false, isStaffResolved: false }),
}));
