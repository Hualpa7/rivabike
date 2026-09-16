import { useState } from 'react';
import { toast } from 'sonner';
import type { CustomerReviewStatus, CustomerReviewWithPhotos } from '@/types';
import {
  useCustomerReviewsAdmin,
  useModerateCustomerReview,
  useDeleteCustomerReviewAdmin,
} from '@/features/reviews/api';
import {
  Button,
  Chip,
  Modal,
  Textarea,
  CustomerReviewStatusBadge,
  EmptyState,
} from '@/components/ui';
import { PageLoader } from '@/components/ui/PageLoader';
import { StarRating } from '@/features/landing/components/ui/StarRating';
import { StarIcon, TrashIcon } from '@/components/ui/icons';
import { formatDate } from '@/lib/utils/fmt';
import { PageHeader } from './PageHeader';

const TABS: { key: CustomerReviewStatus; label: string }[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobada', label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
];

/** Moderación de reseñas de clientes en el dashboard. */
export function ResenasPage() {
  const [tab, setTab] = useState<CustomerReviewStatus>('pendiente');
  const [rejectTarget, setRejectTarget] = useState<CustomerReviewWithPhotos | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerReviewWithPhotos | null>(null);
  const [photoView, setPhotoView] = useState<string | null>(null);

  const { data: reviews = [], isLoading, isError } = useCustomerReviewsAdmin({ estado: tab });
  const moderate = useModerateCustomerReview();
  const deleteReview = useDeleteCustomerReviewAdmin();

  const handleApprove = async (r: CustomerReviewWithPhotos) => {
    try {
      await moderate.mutateAsync({ reviewId: r.id, newEstado: 'aprobada' });
      toast.success('Reseña aprobada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo aprobar la reseña');
    }
  };

  const handleDelete = async (r: CustomerReviewWithPhotos) => {
    try {
      await deleteReview.mutateAsync({ reviewId: r.id });
      toast.success('Reseña eliminada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar la reseña');
    }
    setDeleteTarget(null);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reseñas"
        sub="Aprobá, rechazá o eliminá las reseñas de tus clientes"
      />

      <div className="flex gap-2">
        {TABS.map((t) => (
          <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {isError ? (
        <p role="alert" className="text-sm text-pink-deep">
          No pudimos cargar las reseñas.
        </p>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<StarIcon size={28} className="text-muted" />}
          title="Sin reseñas"
          description={`No hay reseñas ${tab === 'pendiente' ? 'pendientes' : tab === 'aprobada' ? 'aprobadas' : 'rechazadas'} en este momento.`}
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-card border border-line bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{r.nombre_visible}</span>
                    <CustomerReviewStatusBadge status={r.estado} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <StarRating rating={r.rating} starClassName="h-4 w-4 text-gold" />
                    <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
                  </div>
                  <p className="mt-3 leading-relaxed text-ink">“{r.texto}”</p>

                  {r.photos.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.photos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPhotoView(p.storage_path)}
                          className="h-16 w-16 overflow-hidden rounded-card border border-line"
                        >
                          <img src={p.storage_path} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {r.estado === 'rechazada' && r.motivo_rechazo ? (
                    <div className="mt-3 rounded-card border border-pink-deep/30 bg-pink-deep/10 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-pink-deep">Motivo del rechazo</p>
                      <p className="mt-1 text-sm text-ink">{r.motivo_rechazo}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {tab === 'pendiente' ? (
                    <div className="flex gap-2">
                      <Button type="button" size="sm" loading={moderate.isPending} onClick={() => handleApprove(r)}>
                        Aprobar
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setRejectTarget(r)}>
                        Rechazar
                      </Button>
                    </div>
                  ) : null}
                  <Button type="button" size="sm" variant="danger" onClick={() => setDeleteTarget(r)}>
                    <TrashIcon size={15} />
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RejectModal
        review={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onRejected={() => setRejectTarget(null)}
      />

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="¿Eliminar reseña?">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Esta acción borra la reseña y sus fotos de forma permanente. No se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteReview.isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(photoView)} onClose={() => setPhotoView(null)} title="Foto de la reseña">
        {photoView ? (
          <img src={photoView} alt="Foto de la reseña" className="mx-auto max-h-[70vh] w-auto rounded-card" />
        ) : null}
      </Modal>
    </div>
  );
}

function RejectModal({
  review,
  onClose,
  onRejected,
}: {
  review: CustomerReviewWithPhotos | null;
  onClose: () => void;
  onRejected: () => void;
}) {
  const moderate = useModerateCustomerReview();
  const [motivo, setMotivo] = useState('');

  const submit = async () => {
    if (!review || !motivo.trim()) return;
    try {
      await moderate.mutateAsync({
        reviewId: review.id,
        newEstado: 'rechazada',
        motivoRechazo: motivo.trim(),
      });
      toast.success('Reseña rechazada');
      onRejected();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo rechazar la reseña');
    }
  };

  return (
    <Modal
      open={Boolean(review)}
      onClose={() => {
        setMotivo('');
        onClose();
      }}
      title="Rechazar reseña"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Escribí el motivo del rechazo. Se mostrará al cliente para que pueda corregirlo.
        </p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Motivo <span className="text-pink-deep">*</span>
          </label>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ej. El texto no describe el trabajo realizado…"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setMotivo('');
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={moderate.isPending}
            disabled={!motivo.trim()}
            onClick={() => void submit()}
          >
            Confirmar rechazo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
