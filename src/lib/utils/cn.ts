type ClassValue = string | number | null | boolean | undefined | ClassValue[];

/**
 * Combinador liviano de clases (sin dependencia externa).
 * Uso: cn('base', condicion && 'variante', otraCosa)
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v) return;
    if (Array.isArray(v)) return v.forEach(walk);
    out.push(String(v));
  };
  inputs.forEach(walk);
  return out.join(' ');
}
