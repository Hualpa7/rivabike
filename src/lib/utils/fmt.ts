const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const dateDayMonthYearFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Formatea un importe en pesos argentinos, ej. 9000 -> "AR$ 9.000". */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Formatea una fecha a "dd mmm aaaa" (ej. 15 ago 2026). */
export function formatDate(value: string | number | Date): string {
  return dateFormatter.format(new Date(value));
}

/** Formatea fecha + hora a "dd mmm aaaa, hh:mm". */
export function formatDateTime(value: string | number | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

/** Formatea una fecha a "dd/mm/aaaa" (ej. 15/08/2026). */
export function formatDateDayMonthYear(value: string | number | Date): string {
  return dateDayMonthYearFormatter.format(new Date(value));
}
