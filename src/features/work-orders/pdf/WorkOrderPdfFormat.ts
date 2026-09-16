import type { WorkOrderDetail } from '@/types';
import { formatCurrency, formatDateDayMonthYear } from '@/lib/utils/fmt';

// ---------------------------------------------------------------------------
// Formateadores presentacionales del PDF (reutilizan las utilidades
// existentes del proyecto: formato de moneda / fecha / número idéntico al
// resto de la app). Viven en un archivo sin componentes para no romper
// fast-refresh.
// ---------------------------------------------------------------------------

/**
 * Nº de orden legible, misma convención que el dashboard (OT-XXXX).
 *
 * OJO: esto asume que `WorkOrderDetail` tiene un campo `code`. Confirmalo
 * contra el tipo real del proyecto — si no existe, esta función va a
 * mostrar "undefined" en el PDF o directamente no va a compilar. Dejé un
 * fallback defensivo a `id` para que, en el peor caso, el documento nunca
 * quede con un número vacío, pero lo ideal es que `code` exista de verdad
 * en el tipo y este fallback no se use nunca.
 */
export function formatWorkOrderNumber(order: WorkOrderDetail): string {
  return order.code ?? String(order.id);
}

/** Fecha de creación real de la orden en formato dd/mm/aaaa (es-AR). */
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

/**
 * Identificación legible de la bicicleta: "Marca / Color X".
 * No existe un campo "modelo" en el tipo real, así que solo se
 * combinan marca y color (este último con prefijo "Color"),
 * tolerando que cualquiera sea null/vacío.
 */
export function formatWorkOrderBike(bicycle: {
  marca?: string | null;
  color?: string | null;
}): string {
  const parts = [
    bicycle.marca?.trim() || null,
    bicycle.color ? `Color ${bicycle.color}` : null,
  ].filter(Boolean);
  return parts.join(' / ') || 'Bicicleta';
}
