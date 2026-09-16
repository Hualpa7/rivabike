import { Link } from 'react-router-dom';
import { usePresupuestos } from '@/features/presupuestos/api';
import { PresupuestoStatusBadge } from '@/features/presupuestos/components/PresupuestoStatusBadge';
import { PdfCondicionesEditor } from '@/features/settings/components/PdfCondicionesEditor';
import { formatCurrency } from '@/lib/utils/fmt';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';
import { PlusIcon } from '@/components/ui/icons';
import { PageHeader } from './PageHeader';

/** Pagina de presupuestos: historial + estados + totales. */
export function PresupuestosPage() {
  const { data: presupuestos = [], isLoading } = usePresupuestos();

  const pendientes = presupuestos.filter((p) => p.estado === 'pendiente');
  const total = presupuestos.reduce((a, p) => a + p.total, 0);

  const sorted = [...presupuestos].sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        sub="Presupuestos y cotizaciones"
        action={
          <Link to="/dashboard/presupuestos/nueva">
            <Button>
              <PlusIcon size={18} />
              Nuevo presupuesto
            </Button>
          </Link>
        }
      />

      <section className="overflow-hidden rounded-card border-2 border-line bg-paper">
        <div className="divide-y divide-line">
          {sorted.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No hay presupuestos todavía.</p>
          ) : (
            sorted.map((p) => (
              <Link
                key={p.id}
                to={`/dashboard/presupuestos/${p.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted">{p.code}</div>
                  <div className="mt-0.5 truncate text-[15px] font-semibold text-ink">
                    {p.customer
                      ? `${p.customer.nombre} ${p.customer.apellido}`.trim()
                      : (p.observaciones ?? 'Presupuesto')}
                  </div>
                  {p.bicycle ? (
                    <div className="truncate text-xs text-muted">{p.bicycle.marca}</div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <PresupuestoStatusBadge status={p.estado} />
                  <span className="num w-24 text-right font-semibold text-pink-deep">
                    {formatCurrency(p.total)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <PdfCondicionesEditor
          tipo="presupuesto"
          title="Condiciones que salen en el PDF"
          sub="Máximo 5 viñetas. Se usan al final de cada presupuesto generado."
        />

      <div className="flex items-center justify-between rounded-card bg-ink px-6 py-5 text-paper">
        <div>
          <div className="text-xs uppercase tracking-wide text-paper/60">Total presupuestado</div>
          <div className="text-xs text-paper/60">
            {pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'} de aprobación
          </div>
        </div>
        <span className="num font-display text-3xl font-bold text-pink">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}