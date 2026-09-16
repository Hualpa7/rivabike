import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useWorkOrder,
  useUpdateWorkOrderObservaciones,
  useUpdateWorkOrderSenia,
  useUploadWorkOrderPhoto,
  useDeleteWorkOrderPhoto,
} from '@/features/work-orders/api';
import { useSiteSettings, usePdfCondiciones } from '@/features/settings/api';
import { resolvePdfCondiciones } from '@/features/settings/pdf-condiciones';
import { formatCurrency, formatDate } from '@/lib/utils/fmt';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { PageLoader } from '@/components/ui/PageLoader';
import { ReviewPhotoUpload, MAX_WORK_ORDER_PHOTOS } from '@/components/ui/ReviewPhotoUpload';
import { Spinner } from '@/components/ui/Spinner';
import { ChevronLeftIcon, DownloadIcon, CloseIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

// Las observaciones solo son editables en modo real (supabase); en mock se mantienen de solo lectura.
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

// Las fotos de ordenes no se categorizan (antes/durante/despues); la
// columna `tipo` de la DB lo exige, asi que se guarda siempre este valor.
const PHOTO_TIPO = 'antes';

/** Detalle de una orden de trabajo: datos, items, observaciones y PDF. */
export function OrdenDetallePage() {
  const { id = '' } = useParams();
  const { data: order, isLoading } = useWorkOrder(id);
  const { data: settings } = useSiteSettings();
  const { data: condicionesList } = usePdfCondiciones();
  const updateObservaciones = useUpdateWorkOrderObservaciones();
  const updateSenia = useUpdateWorkOrderSenia();
  const uploadPhoto = useUploadWorkOrderPhoto();
  const deletePhoto = useDeleteWorkOrderPhoto();

  const [editingObservaciones, setEditingObservaciones] = useState(false);
  const [observacionesDraft, setObservacionesDraft] = useState('');
  const [editingSenia, setEditingSenia] = useState(false);
  const [seniaDraft, setSeniaDraft] = useState(0);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  if (isLoading) return <PageLoader />;
  if (!order) return <p className="text-muted">Orden no encontrada.</p>;

  const detail = order;
  const { customer, bicycle, services, inventoryItems, photos } = detail;
  const totalServices = services.reduce((a, s) => a + s.subtotal, 0);
  const totalItems = inventoryItems.reduce((a, i) => a + i.subtotal, 0);

  async function handleDownloadPdf() {
    if (!settings) return;
    setGeneratingPdf(true);
    try {
      const { downloadWorkOrderPdf } = await import('@/features/work-orders/pdf/generateWorkOrderPdf');
      await downloadWorkOrderPdf(detail, settings, resolvePdfCondiciones('orden', condicionesList));
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
    setObservacionesDraft('');
    setEditingObservaciones(false);
  }

  function startEditingSenia() {
    setSeniaDraft(detail.senia);
    setEditingSenia(true);
  }

  function cancelEditingSenia() {
    setSeniaDraft(0);
    setEditingSenia(false);
  }

  async function handleSaveSenia() {
    const value = Math.max(seniaDraft, 0);
    if (value === detail.senia) {
      setEditingSenia(false);
      return;
    }
    try {
      await updateSenia.mutateAsync({ id: detail.id, senia: value });
      toast.success('Seña actualizada.');
      setEditingSenia(false);
    } catch {
      toast.error('No se pudo guardar la seña. Intentalo de nuevo.');
    }
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

  async function handleAddPhotos() {
    if (newPhotos.length === 0) return;
    try {
      await Promise.all(
        newPhotos.map((file) =>
          uploadPhoto.mutateAsync({ workOrderId: detail.id, file, tipo: PHOTO_TIPO }),
        ),
      );
      setNewPhotos([]);
      toast.success('Fotos subidas.');
    } catch {
      toast.error('No se pudieron subir las fotos. Intentalo de nuevo.');
    }
  }

  async function handleDeletePhoto(photoId: string) {
    setDeletingPhotoId(photoId);
    try {
      await deletePhoto.mutateAsync({ photoId });
      toast.success('Foto eliminada.');
    } catch {
      toast.error('No se pudo eliminar la foto. Intentalo de nuevo.');
    } finally {
      setDeletingPhotoId(null);
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
            {order.code}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Creada el {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
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
            <InfoCard label="Bicicleta" value={bicycle.marca} sub={bicycle.color ?? undefined} />
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

          <section className="rounded-card border-2 border-line bg-paper p-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Fotos ({photos.length + newPhotos.length})
            </h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {photos.map((p) =>
                <div key={p.id} className="relative">
                  <img
                    src={p.storage_path}
                    alt="Foto de la orden"
                    className="h-24 w-32 rounded-card object-cover"
                  />
                  {!useMocks ? (
                    <button
                      type="button"
                      aria-label="Quitar foto"
                      onClick={() => handleDeletePhoto(p.id)}
                      disabled={deletingPhotoId === p.id}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-paper transition-colors hover:bg-pink-deep disabled:opacity-60"
                    >
                      {deletingPhotoId === p.id ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <CloseIcon size={14} />
                      )}
                    </button>
                  ) : null}
                </div>
              )}
              {!useMocks ? (
                <ReviewPhotoUpload
                  photos={newPhotos}
                  existingCount={photos.length}
                  max={MAX_WORK_ORDER_PHOTOS}
                  onAdd={(files) => setNewPhotos((prev) => [...prev, ...files])}
                  onRemove={(index) =>
                    setNewPhotos((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              ) : null}
            </div>
            {!useMocks && newPhotos.length > 0 ? (
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewPhotos([])}
                  disabled={uploadPhoto.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddPhotos}
                  loading={uploadPhoto.isPending}
                >
                  Subir fotos
                </Button>
              </div>
            ) : null}
            {photos.length === 0 && newPhotos.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Sin fotos cargadas.</p>
            ) : null}
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
            {order.senia > 0 ? (
              <div className="flex justify-between py-1 text-sm">
                <span className="text-paper/70">Seña</span>
                <span className="num">− {formatCurrency(order.senia)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between border-t border-paper/25 pt-3">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="num font-display text-2xl font-bold text-pink">
                {formatCurrency(order.total)}
              </span>
            </div>
          </section>

          <section className="rounded-card border-2 border-line bg-paper p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-ink">Seña</h2>
              {!editingSenia ? (
                <Button variant="ghost" size="sm" onClick={startEditingSenia}>
                  Editar
                </Button>
              ) : null}
            </div>
            {editingSenia ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-1.5 rounded-card border border-line bg-paper px-3 py-2 focus-within:border-pink-deep">
                  <span className="text-sm text-muted">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={seniaDraft}
                    onChange={(e) => setSeniaDraft(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="num w-full bg-transparent text-right text-sm font-semibold text-ink focus:outline-none"
                  />
                </div>
                <p className="text-xs text-muted">
                  La seña se descuenta del total de la orden. Podés actualizarla mientras la
                  orden siga abierta.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditingSenia}
                    disabled={updateSenia.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveSenia}
                    loading={updateSenia.isPending}
                  >
                    Guardar seña
                  </Button>
                </div>
              </div>
            ) : order.senia > 0 ? (
              <div className="mt-2">
                <p className="num text-lg font-semibold text-ink">{formatCurrency(order.senia)}</p>
                <p className="text-xs text-muted">Se descuenta del total de la orden.</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Sin seña.</p>
            )}
          </section>
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