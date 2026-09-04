import { Link, Navigate } from 'react-router-dom';
import { useWorkOrders } from '@/features/work-orders/api';
import { useInventoryItems } from '@/features/inventory/api';
import { useAuthStore } from '@/features/auth/store';
import { formatCurrency, formatDate } from '@/lib/utils/fmt';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  DashboardIcon,
  WrenchIcon,
  BoxIcon,
  TicketIcon,
  PlusIcon,
} from '@/components/ui/icons';
import { PageHeader } from './PageHeader';
import { KpiCard } from './KpiCard';
import { stockStatus, STOCK_STATUS_DOT, STOCK_STATUS_LABEL } from './stock';
import { ordenNumber } from './utils';

/** Inicio del panel: KPIs, ordenes recientes, stock bajo y acciones. */
export function InicioPage() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const { data: orders = [] } = useWorkOrders();
  const { data: items = [] } = useInventoryItems();

  if (status === 'loading') return <PageLoader />;

  const pendientes = orders.filter((o) => o.estado === 'pendiente' || o.estado === 'aceptado').length;
  const enTrabajo = orders.filter((o) => o.estado === 'en_ejecucion').length;
  const facturado = orders
    .filter((o) => o.estado === 'terminado')
    .reduce((a, o) => a + o.total, 0);

  const lowStock = items.filter((i) => stockStatus(i.stock_actual) !== 'ok');
  const sinStock = lowStock.filter((i) => stockStatus(i.stock_actual) === 'sin_stock').length;

  const recent = [...orders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'dueño';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${firstName}`}
        sub={`Resumen del taller · ${formatDate(new Date())}`}
        action={
          <Link to="/dashboard/ordenes/nueva">
            <Button>
              <PlusIcon size={18} />
              Nueva orden
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Órdenes pendientes" value={String(pendientes)} accent note="Requieren atención" icon={<TicketIcon size={18} />} />
        <KpiCard label="En trabajo hoy" value={String(enTrabajo)} note="Diagnóstico, cadena, frenos" icon={<WrenchIcon size={18} />} />
        <KpiCard label="Alertas de stock" value={String(lowStock.length)} accent note={`${sinStock} sin stock, ${lowStock.length - sinStock} baja`} icon={<BoxIcon size={18} />} />
        <KpiCard label="Facturado este mes" value={formatCurrency(facturado)} note="Órdenes listas" icon={<DashboardIcon size={18} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-card border-2 border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-ink">Órdenes recientes</h2>
            <Link to="/dashboard/ordenes" className="text-sm text-muted transition-colors hover:text-pink-deep">
              Ver todas →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {recent.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted">No hay órdenes todavía.</p>
            ) : (
              recent.map((o) => (
                <Link key={o.id} to={`/dashboard/ordenes/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--surface-2)]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink">
                      {o.customer
                        ? `${o.customer.nombre} ${o.customer.apellido}`.trim()
                        : ordenNumber(o.id)}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {o.bicycle
                        ? [o.bicycle.marca, o.bicycle.modelo].filter(Boolean).join(' ')
                        : o.estado}
                    </div>
                  </div>
                  <span className="num shrink-0 text-sm font-semibold text-pink-deep">{formatCurrency(o.total)}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-card border-2 border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">Stock bajo</h2>
              <Link to="/dashboard/inventario" className="text-sm text-muted transition-colors hover:text-pink-deep">
                Ver inventario
              </Link>
            </div>
            <div className="divide-y divide-line">
              {lowStock.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted">Todo en orden.</p>
              ) : (
                lowStock.slice(0, 4).map((i) => {
                  const s = stockStatus(i.stock_actual);
                  return (
                    <div key={i.id} className="flex items-center gap-3 px-5 py-3">
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', STOCK_STATUS_DOT[s])} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-ink">{i.nombre}</div>
                        <div className="text-xs text-muted">{STOCK_STATUS_LABEL[s]}</div>
                      </div>
                      <span className="num font-mono text-sm font-semibold text-ink">{i.stock_actual}</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-card border-2 border-line bg-paper p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Acciones rápidas</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/dashboard/inventario">
                <Button variant="secondary" block>
                  <BoxIcon size={18} />
                  Ajustar stock
                </Button>
              </Link>
              <Link to="/dashboard/ordenes">
                <Button variant="secondary" block>
                  <TicketIcon size={18} />
                  Ver órdenes
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Redirige /dashboard -> /dashboard/inicio (rutas §5). */
export function DashboardIndexRedirect() {
  return <Navigate to="/dashboard/inicio" replace />;
}
