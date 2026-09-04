import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useWorkOrder,
  useUpdateWorkOrderStatus,
  useUpdateWorkOrderObservaciones,
} from '@/features/work-orders/api';
import { useSiteSettings } from '@/features/settings/api';
import { WORK_ORDER_TRANSITIONS, type WorkOrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/fmt';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { PageLoader } from '@/components/ui/PageLoader';
import { WorkOrderStatusBadge } from '@/components/ui/WorkOrderStatusBadge';
import { ChevronLeftIcon, DownloadIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';
import { ordenNumber } from './utils';

const STATUS_ACTION_LABEL: Partial<Record<WorkOrderStatus, string>> = {
  pendiente: 'Aceptar orden',
  aceptado: 'Comenzar / En ejecución',
  en_ejecucion: 'Marcar como lista',
};

// Las observaciones solo son editables en modo real (supabase); en mock se mantienen de solo lectura.
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

/** Detalle de una orden de trabajo: datos, items, estado, observaciones y PDF. */
export function OrdenDetallePage() {
  const { id = '' } = useParams();
  const { data: order, isLoading } = useWorkOrder(id);
  const { data: settings } = useSiteSettings();
  const updateStatus = useUpdateWorkOrderStatus();
  const updateObservaciones = useUpdateWorkOrderObservaciones();

  const [editingObservaciones, setEditingObservaciones] = useState(false);
  const [observacionesDraft, setObservacionesDraft] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!order) return <p className="text-muted">Orden no encontrada.</p>;

  const detail = order;
  const { customer, bicycle, services, inventoryItems, photos } = detail;
  const nextStates = WORK_ORDER_TRANSITIONS[detail.estado];
  const totalServices = services.reduce((a, s) => a + s.subtotal, 0);
  const totalItems = inventoryItems.reduce((a, i) => a + i.subtotal, 0);

  async function handleDownloadPdf() {
    if (!settings) return;
    setGeneratingPdf(true);
    try {
      const { downloadWorkOrderPdf } = await import('@/features/work-orders/pdf/generateWorkOrderPdf');
      await downloadWorkOrderPdf(detail, settings);
    } catch {
      toast.error('No se pudo generar el PDF. Intentalo de nuevo.');
    } finally {
      setGeneratingPdf(false);
    }
  }

  function startEditingObservaciones() {
    setObservacionesDraft(detail.observaciones ?? '');
    setEditingObservaciones(true);
  }

  function cancelEditingObservaciones() {
    setEditingObservaciones(false);
    setObservacionesDraft('');
  }

  async function handleSaveObservaciones() {
    const value = observacionesDraft.trim();
    const normalized = value.length > 0 ? value : null;
    if (normalized === (detail.observaciones ?? '')) {
      setEditingObservaciones(false);
      return;
    }
    try {
      await updateObservaciones.mutateAsync({ id: detail.id, observaciones: normalized });
      toast.success('Observaciones actualizadas.');
      setEditingObservaciones(false);
    } catch {
      toast.error('No se pudieron guardar las observaciones. Intentalo de nuevo.');
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/dashboard/ordenes" className="inline-flex items-center gap-1 text-sm text-muted hover:text-pink-deep">
        <ChevronLeftIcon size={16} />
        Volver a órdenes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            {ordenNumber(order.id)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Creada el {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <WorkOrderStatusBadge status={order.estado} />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!settings}
            loading={generatingPdf}
          >
            <DownloadIcon size={16} />
            {generatingPdf ? 'Generando PDF' : 'Descargar PDF'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="Cliente" value={`${customer.nombre} ${customer.apellido}`} sub={customer.telefono} />
            <InfoCard label="Bicicleta" value={`${bicycle.marca} ${bicycle.modelo}`} sub={bicycle.color ?? undefined} />
          </div>

          <section className="rounded-card border-2 border-line bg-paper p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Servicios ({services.length})</h2>
            <div className="mt-3 divide-y divide-line">
              {services.length === 0 && <p className="text-sm text-muted">Sin servicios.</p>}
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{s.title_snapshot}</div>
                    <div className="text-xs text-muted">
                      {s.quantity} × {formatCurrency(s.unit_price)}
                    </div>
                  </div>
                  <span className="num shrink-0 text-sm font-semibold text-pink-deep">
                    {formatCurrency(s.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-card border-2 border-line bg-paper p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Repuestos ({inventoryItems.length})</h2>
            <div className="mt-3 divide-y divide-line">
              {inventoryItems.length === 0 && <p className="text-sm text-muted">Sin repuestos.</p>}
              {inventoryItems.map((it) => {
                const consumed = !!it.consumed_at;
                return (
                  <div key={it.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full', consumed ? 'bg-[#2E9E5B]' : 'bg-muted')} aria-hidden="true" />
                        <span className="text-sm font-medium text-ink">{it.name_snapshot}</span>
                      </div>
                      <div className="text-xs text-muted">
                        {it.quantity} × {formatCurrency(it.unit_price)}
                        {consumed ? ' · consumido' : ' · pendiente'}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="num text-sm font-semibold text-pink-deep">
                        {formatCurrency(it.subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-card border-2 border-line bg-paper p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink">Observaciones</h2>
              {!useMocks && !editingObservaciones ? (
                <Button variant="ghost" size="sm" onClick={startEditingObservaciones}>
                  Editar
                </Button>
              ) : null}
            </div>
            {editingObservaciones ? (
              <div className="mt-3 space-y-3">
                <Textarea
                  value={observacionesDraft}
                  onChange={(e) => setObservacionesDraft(e.target.value)}
                  placeholder="Notas sobre la orden…"
                  rows={4}
                  disabled={updateObservaciones.isPending}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditingObservaciones}
                    disabled={updateObservaciones.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveObservaciones}
                    loading={updateObservaciones.isPending}
                  >
                    Guardar cambios
                  </Button>
                </div>
              </div>
            ) : order.observaciones && order.observaciones.trim().length > 0 ? (
              <p className="mt-3 whitespace-pre-line text-sm text-ink">{order.observaciones}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">Sin observaciones.</p>
            )}
          </section>

          {photos.length > 0 ? (
            <section className="rounded-card border-2 border-line bg-paper p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Fotos ({photos.length})</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {photos.map((p) => (
                  <img key={p.id} src={p.storage_path} alt={p.descripcion ?? p.tipo} className="h-24 w-32 rounded-card object-cover" />
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="space-y-6">
          <section className="rounded-card bg-ink p-5 text-paper">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-paper/70">Servicios</span>
              <span className="num">{formatCurrency(totalServices)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-paper/70">Repuestos</span>
              <span className="num">{formatCurrency(totalItems)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-paper/25 pt-3">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="num font-display text-2xl font-bold text-pink">
                {formatCurrency(order.total)}
              </span>
            </div>
          </section>

          {nextStates.length > 0 ? (
            <section className="rounded-card border-2 border-line bg-paper p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Actualizar estado</h2>
              <div className="mt-3 flex flex-col gap-2">
                {nextStates.map((s) => (
                  <Button
                    key={s}
                    variant="primary"
                    onClick={() => updateStatus.mutate({ id: order.id, newStatus: s })}
                    loading={updateStatus.isPending && updateStatus.variables?.newStatus === s}
                  >
                    {STATUS_ACTION_LABEL[s] ?? s}
                  </Button>
                ))}
              </div>
            </section>
          ) : (
            <p className="text-sm text-muted">No hay más estados disponibles.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-card border-2 border-line bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}