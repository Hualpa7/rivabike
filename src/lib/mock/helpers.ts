// Utilidades compartidas para los mocks: latencia simulada y utilidades
// de copia/escritura para no mutar los arrays "seed" de ejemplo.

/** Espera un tiempo aleatorio (300–700ms) para simular una llamada de red. */
export function delay(): Promise<void> {
  const ms = 300 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Devuelve una copia profunda simple (JSON) del dato, para que los mocks
 *  no muten el seed original entre llamadas. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Genera un id único legible (uuid-like) para entidades mock. */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
