/**
 * Devuelve el numero de orden legible (OT-0001) desde el campo code.
 * Si el code no existe (datos viejos), genera uno desde los primeros 8 chars del id.
 */
export function ordenNumber(codeOrId: string): string {
  if (codeOrId.startsWith('OT-')) return codeOrId;
  return `OT-${codeOrId.slice(0, 8).toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Filtro por período (Órdenes). Compara en hora local, no sobre el string UTC,
// para que coincida con el huso de Argentina.
// ---------------------------------------------------------------------------

export type PeriodFilter =
  | { mode: 'hoy' }
  | { mode: 'mes'; month: string } // 'YYYY-MM'
  | { mode: 'rango'; desde: string; hasta: string }; // 'YYYY-MM-DD'

/** Mes actual en formato YYYY-MM (hora local). */
export function currentMonth(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

/** Indica si la fecha ISO `iso` cae dentro del período elegido. */
export function matchesPeriod(iso: string, filter: PeriodFilter): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;

  switch (filter.mode) {
    case 'hoy': {
      const today = new Date();
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    }
    case 'mes': {
      const [y, m] = filter.month.split('-').map(Number);
      return d.getFullYear() === y && d.getMonth() === m - 1;
    }
    case 'rango': {
      const from = filter.desde ? new Date(`${filter.desde}T00:00:00`) : null;
      const to = filter.hasta ? new Date(`${filter.hasta}T23:59:59.999`) : null;
      if (from && !Number.isNaN(from.getTime()) && d < from) return false;
      if (to && !Number.isNaN(to.getTime()) && d > to) return false;
      return true;
    }
  }
}

function formatDay(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

const monthLabelFormatter = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  year: 'numeric',
});

/** Etiqueta legible del período para la barra de facturado. */
export function periodLabel(filter: PeriodFilter): string {
  switch (filter.mode) {
    case 'hoy':
      return 'Facturado hoy';
    case 'mes': {
      const [y, m] = filter.month.split('-').map(Number);
      const label =
        y && m ? monthLabelFormatter.format(new Date(y, m - 1, 1)) : filter.month;
      return `Facturado · ${label}`;
    }
    case 'rango': {
      if (filter.desde && filter.hasta)
        return `Facturado · del ${formatDay(filter.desde)} al ${formatDay(filter.hasta)}`;
      if (filter.desde) return `Facturado · desde el ${formatDay(filter.desde)}`;
      if (filter.hasta) return `Facturado · hasta el ${formatDay(filter.hasta)}`;
      return 'Facturado';
    }
  }
}
