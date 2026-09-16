import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useDeletePresupuesto,
  usePresupuesto,
  useUpdatePresupuestoEstado,
  useUpdatePresupuestoObservaciones,
} from '@/features/presupuestos/api';
import { PresupuestoStatusBadge } from '@/features/presupuestos/components/PresupuestoStatusBadge';
import { useSiteSettings, usePdfCondiciones } from '@/features/settings/api';
import { resolvePdfCondiciones } from '@/features/settings/pdf-condiciones';
import { formatCurrency, formatDate } from '@/lib/utils/fmt';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  DownloadIcon,
  TrashIcon,
} from '@/components/ui/icons';
import type { PresupuestoStatus } from '@/types';

// Las observaciones solo son editables en modo real (supabase); en mock se mantienen de solo lectura.
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

type ConfirmAction = 'aceptar' | 'rechazar' | 'eliminar';

const CONFIRM_COPY: Record<ConfirmAction, { title: string; text: string; confirmLabel: string }> = {
  aceptar: {
    title: 'Aceptar presupuesto',
    text: 'El presupuesto quedará marcado como aceptado. Podés convertirlo en orden de trabajo para reservar los repuestos y descontarlos del inventario.',
    confirmLabel: 'Aceptar',
  },
  rechazar: {
    title: 'Rechazar presupuesto',
    text: 'El presupuesto quedará marcado como rechazado.',
    confirmLabel: 'Rechazar',
  },
  eliminar: {
    title: 'Eliminar presupuesto',
    text: 'Se eliminará el presupuesto y su detalle. Esta acción no se puede deshacer.',
    confirmLabel: 'Eliminar',
  },
};

/** Detalle de un presupuesto: items, estado, PDF y conversion a orden de trabajo. */
export function PresupuestoDetallePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: presupuesto, isLoading } = usePresupuesto(id);
  const { data: settings } = useSiteSettings();
  const { data: condicionesList } = usePdfCondiciones();
  const updateObservaciones = useUpdatePresupuestoObservaciones();
  const updateEstado = useUpdatePresupuestoEstado();
  const removePresupuesto = useDeletePresupuesto();

  const [editingObservaciones, setEditingObservaciones] = useState(false);
  const [observacionesDraft, setObservacionesDraft] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  if (isLoading) return <PageLoader />;
  if (!presupuesto) return <p className="text-muted">Presupuesto no encontrado.</p>;

  const detail = presupuesto;
  const totalServices = detail.services.reduce((a, s) => a + s.subtotal, 0);
  const totalItems = detail.inventoryItems.reduce((a, i) => a + i.subtotal, 0);
  const esPendiente = detail.estado === 'pendiente';
  const estado = updateEstado.isPending ? (updateEstado.variables?.newEstado as PresupuestoStatus | undefined) : undefined;

  async function handleDownloadPdf() {
    if (!settings) return;
    setGeneratingPdf(true);
    try {
      const { downloadPresupuestoPdf } = await import('@/features/presupuestos/pdf/generatePresupuestoPdf');
      await downloadPresupuestoPdf(detail, settings, resolvePdfCondiciones('presupuesto', condicionesList));
    } catch {
      toast.error('No se pudo generar el PDF. Intentalo de nuevo.');
    } finally {
      setGeneratingPdf(false);
    }
  }

  function handleConvertir() {
    navigate(`/dashboard/ordenes/nueva?presupuesto=${detail.id}`);
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

  function handleConfirmAction() {
    if (!confirm) return;
    if (confirm === 'eliminar') {
      removePresupuesto
        .mutateAsync({ id: detail.id })
        .then(() => {
          toast.success('Presupuesto eliminado.');
          setConfirm(null);
          navigate('/dashboard/presupuestos');
        })
        .catch(() => toast.error('No se pudo eliminar el presupuesto. Intentalo de nuevo.'));
      return;
    }
    const nuevoEstado: PresupuestoStatus = confirm === 'aceptar' ? 'aceptado' : 'rechazado';
    updateEstado
      .mutateAsync({ id: detail.id, newEstado: nuevoEstado })
      .then(() => {
        toast.success(confirm === 'aceptar' ? 'Presupuesto aceptado.' : 'Presupuesto rechazado.');
        setConfirm(null);
      })
      .catch(() => toast.error('No se pudo actualizar el estado. Intentalo de nuevo.'));
  }

  const confirmCopy = confirm ? CONFIRM_COPY[confirm] : null;
  const confirmLoading = confirm === 'eliminar' ? removePresupuesto.isPending : updateEstado.isPending;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/presupuestos" className="inline-flex items-center gap-1 text-sm text-muted hover:text-pink-deep">
        <ChevronLeftIcon size={16} />
        Volver a presupuestos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            {detail.code}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Creado el {formatDate(detail.created_at)}
          </p>
          <div className="mt-2">
            <PresupuestoStatusBadge status={estado ?? detail.estado} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {esPendiente ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setConfirm('aceptar')}
                loading={confirm === 'aceptar' && updateEstado.isPending}
                disabled={!!confirm}
              >
                <CheckIcon size={16} />
                Aceptar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirm('rechazar')}
                loading={confirm === 'rechazar' && updateEstado.isPending}
                disabled={!!confirm}
              >
                Rechazar
              </Button>
            </>
          ) : null}
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
          <Button variant="primary" size="sm" onClick={handleConvertir}>
            <ArrowRightIcon size={16} />
            Convertir en orden de trabajo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="Cliente" value={`${detail.customer.nombre} ${detail.customer.apellido}`} sub={detail.customer.telefono} />
            <InfoCard label="Bicicleta" value={detail.bicycle.marca} sub={detail.bicycle.color ?? undefined} />
          </div>

          <section className="rounded-card border-2 border-line bg-paper p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Servicios ({detail.services.length})</h2>
            <div className="mt-3 divide-y divide-line">
              {detail.services.length === 0 && <p className="text-sm text-muted">Sin servicios.</p>}
              {detail.services.map((s) => (
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
            <h2 className="font-display text-lg font-semibold text-ink">Repuestos ({detail.inventoryItems.length})</h2>
            <div className="mt-3 divide-y divide-line">
              {detail.inventoryItems.length === 0 && <p className="text-sm text-muted">Sin repuestos.</p>}
              {detail.inventoryItems.map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{it.name_snapshot}</div>
                    <div className="text-xs text-muted">
                      {it.quantity} × {formatCurrency(it.unit_price)}
                    </div>
                  </div>
                  <span className="num shrink-0 text-sm font-semibold text-pink-deep">
                    {formatCurrency(it.subtotal)}
                  </span>
                </div>
              ))}
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
                  placeholder="Notas sobre el presupuesto…"
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
            ) : detail.observaciones && detail.observaciones.trim().length > 0 ? (
              <p className="mt-3 whitespace-pre-line text-sm text-ink">{detail.observaciones}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">Sin observaciones.</p>
            )}
          </section>
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
                {formatCurrency(detail.total)}
              </span>
            </div>
          </section>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-pink-deep"
            onClick={() => setConfirm('eliminar')}
            loading={removePresupuesto.isPending}
          >
            <TrashIcon size={16} />
            Eliminar presupuesto
          </Button>
        </aside>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirmCopy?.title}>
        <div className="space-y-5">
          <p className="text-sm text-muted">{confirmCopy?.text}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirm(null)} disabled={confirmLoading}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmAction} loading={confirmLoading}>
              {confirmCopy?.confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
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