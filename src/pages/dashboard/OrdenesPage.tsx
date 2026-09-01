import { Link } from 'react-router-dom';
import { useWorkOrders } from '@/features/work-orders/api';
import { formatCurrency } from '@/lib/utils/fmt';
import { Button } from '@/components/ui/Button';
import { WorkOrderStatusBadge } from '@/components/ui/WorkOrderStatusBadge';
import { PlusIcon } from '@/components/ui/icons';
import { PageHeader } from './PageHeader';
import { KpiCard } from './KpiCard';
import { ordenNumber } from './utils';

/** Pagina de ordenes / presupuestos: KPIs + historial + total facturado. */
export function OrdenesPage() {
  const { data: orders = [], isLoading } = useWorkOrders();

  const enCurso = orders.filter((o) => o.estado === 'en_ejecucion').length;
  const pendientes = orders.filter((o) => o.estado === 'pendiente' || o.estado === 'aceptado').length;
  const listas = orders.filter((o) => o.estado === 'terminado').length;
  const facturado = orders
    .filter((o) => o.estado === 'terminado')
    .reduce((a, o) => a + o.total, 0);

  const sorted = [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos / Órdenes"
        sub="Historial de órdenes y presupuestos"
        action={
          <Link to="/dashboard/ordenes/nueva">
            <Button>
              <PlusIcon size={18} />
              Nueva orden
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="En curso" value={String(enCurso)} />
        <KpiCard label="Pendientes" value={String(pendientes)} accent />
        <KpiCard label="Listas este mes" value={String(listas)} />
      </div>

      <section className="overflow-hidden rounded-card border border-line bg-paper">
        <div className="divide-y divide-line">
          {isLoading ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Cargando…</p>
          ) : sorted.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No hay órdenes todavía.</p>
          ) : (
            sorted.map((o) => (
              <Link
                key={o.id}
                to={`/dashboard/ordenes/${o.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted">{ordenNumber(o.id)}</div>
                  <div className="mt-0.5 truncate text-[15px] font-semibold text-ink">
                    {o.customer
                      ? `${o.customer.nombre} ${o.customer.apellido}`.trim()
                      : (o.observaciones ?? 'Orden de trabajo')}
                  </div>
                  {o.bicycle ? (
                    <div className="truncate text-xs text-muted">
                      {[o.bicycle.marca, o.bicycle.modelo].filter(Boolean).join(' ')}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <WorkOrderStatusBadge status={o.estado} />
                  <span className="num w-24 text-right font-semibold text-pink-deep">
                    {formatCurrency(o.total)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-card bg-ink px-6 py-5 text-paper">
        <div>
          <div className="text-xs uppercase tracking-wide text-paper/60">Facturado este mes</div>
          <div className="text-xs text-paper/60">{listas} órdenes listas</div>
        </div>
        <span className="num font-display text-3xl font-bold text-pink">{formatCurrency(facturado)}</span>
      </div>
    </div>
  );
}
