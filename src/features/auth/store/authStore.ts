import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

// Estado de sesion en memoria (Zustand). La persistencia real de la sesion
// la maneja Supabase Auth (storage propio); este store solo refleja el
// estado actual para que los componentes reaccionen sin prop-drilling.
// No usar Zustand `persist` middleware aca: la sesion NO debe duplicarse
// en localStorage por fuera de lo que Supabase ya gestiona.
interface AuthState {
  session: Session | null;
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  setSession: (session: Session | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: 'loading',
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
    }),
  reset: () => set({ session: null, user: null, status: 'unauthenticated' }),
}));
