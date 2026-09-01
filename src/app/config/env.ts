// Punto unico de lectura de variables de entorno publicas.
// Cualquier variable leida aca debe ser segura para exponer en el navegador.
function readEnvVar(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`[env] Falta la variable de entorno ${key}. Revisa tu archivo .env`);
  }
  return value ?? '';
}

export const env = {
  supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
  supabasePublishableKey: readEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY'),
  googleMapsBrowserKey: readEnvVar('VITE_GOOGLE_MAPS_BROWSER_KEY'),
  googlePlaceId: readEnvVar('VITE_GOOGLE_PLACE_ID'),
  // Convencion mock-first, ver docs/data-contract.md. Cada
  // src/features/<feature>/api/index.ts puede leer esto o chequear
  // import.meta.env.VITE_USE_MOCKS directamente; ambas formas son validas.
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const;
