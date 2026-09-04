import type { WorkOrderDetail } from '@/types';
import { formatCurrency, formatDateDayMonthYear } from '@/lib/utils/fmt';
import { ordenNumber } from '@/pages/dashboard/utils';

// ---------------------------------------------------------------------------
// Formateadores presentacionales del PDF (reutilizan las utilidades
// existentes del proyecto: formato de moneda / fecha / numero identico al resto
// de la app). Viven en un archivo sin componentes para no romper fast-refresh.
// ---------------------------------------------------------------------------

/** Nº de orden legible, misma convencion que el dashboard (OT-XXXX). */
export function formatWorkOrderNumber(order: WorkOrderDetail): string {
  return ordenNumber(order.id);
}

/** Fecha de creacion real de la orden en formato dd/mm/aaaa (es-AR). */
export function formatWorkOrderDate(order: WorkOrderDetail): string {
  return formatDateDayMonthYear(order.created_at);
}

/** Fecha estimada de entrega (si existe) en formato dd/mm/aaaa. */
export function formatWorkOrderDueDate(value: string): string {
  return formatDateDayMonthYear(value);
}

/** Moneda ARS como el resto de la app; normaliza espacios Unicode para la fuente PDF. */
export function formatWorkOrderCurrency(value: number): string {
  return formatCurrency(value).replace(/[\u00A0\u202F]/g, ' ');
}

/** Nombre completo del cliente (sin espacios sobrantes). */
export function getCustomerFullName(order: WorkOrderDetail): string {
  const name = `${order.customer.nombre} ${order.customer.apellido}`.trim();
  return name.length > 0 ? name : 'Cliente';
}