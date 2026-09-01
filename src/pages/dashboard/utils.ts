/**
 * Deriva el numero de orden legible (OT-0142) desde el id interno
 * (ord-0142). En datos reales el numero podria ser un campo propio.
 */
export function ordenNumber(id: string): string {
  const suffix = id.replace(/^ord-/, '');
  return `OT-${suffix}`;
}
