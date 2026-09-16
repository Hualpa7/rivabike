import type { PresupuestoDetail, PresupuestoStatus } from '@/types';
import { formatCurrency, formatDateDayMonthYear } from '@/lib/utils/fmt';

// ---------------------------------------------------------------------------
// Formateadores presentacionales del PDF de presupuesto (misma convencion
// que el resto de la app: moneda / fecha / numeracion identica al dashboard).
// ---------------------------------------------------------------------------

/** Nº de presupuesto legible (P-XXXX). */
export function formatPresupuestoNumber(p: PresupuestoDetail): string {
  return p.code;
}

/** Fecha de creacion en formato dd/mm/aaaa (es-AR). */
export function formatPresupuestoDate(p: PresupuestoDetail): string {
  return formatDateDayMonthYear(p.created_at);
}

/** Moneda ARS como el resto de la app; normaliza espacios Unicode para la fuente PDF. */
export function formatPresupuestoCurrency(value: number): string {
  return formatCurrency(value).replace(/[\u00A0\u202F]/g, ' ');
}

/** Nombre completo del cliente (sin espacios sobrantes). */
export function getPresupuestoCustomerFullName(p: PresupuestoDetail): string {
  const name = `${p.customer.nombre} ${p.customer.apellido}`.trim();
  return name.length > 0 ? name : 'Cliente';
}

export const PRESUPUESTO_ESTADO_LABEL: Record<PresupuestoStatus, string> = {
  pendiente: 'PENDIENTE',
  aceptado: 'ACEPTADO',
  rechazado: 'RECHAZADO',
};