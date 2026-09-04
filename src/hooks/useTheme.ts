import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'riva-theme';

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage puede estar bloqueado; el dark sigue aplicandose en sesion */
  }
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * Tema claro/oscuro compartido entre toda la app (Zustand). Persistencia
 * en localStorage ('riva-theme'), fallback a prefers-color-scheme y
 * escritura del attribute [data-theme] en <html>. Al ser un store
 * compartido, TODOS los <ThemeToggle /> montados a la vez quedan
 * sincronizados entre si.
 */
export const useTheme = create<ThemeState>((set, get) => ({
  theme: resolveInitialTheme(),
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
