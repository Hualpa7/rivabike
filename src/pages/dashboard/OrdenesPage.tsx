import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkOrders } from '@/features/work-orders/api';
import { PdfCondicionesEditor } from '@/features/settings/components/PdfCondicionesEditor';
import { formatCurrency, formatDate } from '@/lib/utils/fmt';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { PageLoader } from '@/components/ui/PageLoader';
import { PlusIcon } from '@/components/ui/icons';
import { PageHeader } from './PageHeader';
import { currentMonth, matchesPeriod, periodLabel, type PeriodFilter } from './utils';

/** Pagina de ordenes: historial + total facturado, filtrable por período. */
export function OrdenesPage() {
  const { data: orders = [], isLoading } = useWorkOrders();

  const [mode, setMode] = useState<'hoy' | 'mes' | 'rango'>('mes');
  const [month, setMonth] = useState(() => currentMonth());
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const period: PeriodFilter =
    mode === 'hoy'
      ? { mode: 'hoy' }
      : mode === 'mes'
        ? { mode: 'mes', month }
        : { mode: 'rango', desde, hasta };

  const sorted = [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const filtered = sorted.filter((o) => matchesPeriod(o.created_at, period));
  const facturado = filtered.reduce((a, o) => a + o.total, 0);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes"
        sub="Historial de órdenes de trabajo"
        action={
          <Link to="/dashboard/ordenes/nueva">
            <Button>
              <PlusIcon size={18} />
              Nueva orden
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Chip active={mode === 'hoy'} onClick={() => setMode('hoy')}>
          Hoy
        </Chip>
        <Chip active={mode === 'mes'} onClick={() => setMode('mes')}>
          Mes
        </Chip>
        {mode === 'mes' ? (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Mes"
            className="h-10 rounded-pill border border-line bg-paper px-3 text-sm text-ink transition-colors focus:border-pink-deep focus:outline-none"
          />
        ) : null}
        <Chip active={mode === 'rango'} onClick={() => setMode('rango')}>
          Rango
        </Chip>
        {mode === 'rango' ? (
          <>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              aria-label="Desde"
              className="h-10 rounded-pill border border-line bg-paper px-3 text-sm text-ink transition-colors focus:border-pink-deep focus:outline-none"
            />
            <span className="text-sm text-muted">a</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              aria-label="Hasta"
              className="h-10 rounded-pill border border-line bg-paper px-3 text-sm text-ink transition-colors focus:border-pink-deep focus:outline-none"
            />
          </>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-card border-2 border-line bg-paper">
        <div className="divide-y divide-line">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              {orders.length === 0
                ? 'No hay órdenes todavía.'
                : 'No hay órdenes en este período.'}
            </p>
          ) : (
            filtered.map((o) => (
              <Link
                key={o.id}
                to={`/dashboard/ordenes/${o.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted">{o.code}</div>
                  <div className="mt-0.5 truncate text-[15px] font-semibold text-ink">
                    {o.customer
                      ? `${o.customer.nombre} ${o.customer.apellido}`.trim()
                      : (o.observaciones ?? 'Orden de trabajo')}
                  </div>
                  {o.bicycle ? (
                    <div className="truncate text-xs text-muted">{o.bicycle.marca}</div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="num w-24 text-right font-semibold text-pink-deep">
                    {formatCurrency(o.total)}
                  </span>
                  <span className="text-xs text-muted">{formatDate(o.created_at)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <PdfCondicionesEditor
          tipo="orden"
          title="Condiciones que salen en el PDF"
          sub="Máximo 5 viñetas. Se usan al final de cada orden de trabajo generada."
        />

      <div className="flex items-center justify-between rounded-card bg-ink px-6 py-5 text-paper">
        <div>
          <div className="text-xs uppercase tracking-wide text-paper/60">{periodLabel(period)}</div>
          <div className="text-xs text-paper/60">{filtered.length} órdenes</div>
        </div>
        <span className="num font-display text-3xl font-bold text-pink">{formatCurrency(facturado)}</span>
      </div>
    </div>
  );
}
