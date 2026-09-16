import { useMyCustomerReviews, useDeleteCustomerReviewPhoto } from '@/features/reviews/api';
import type { CustomerReviewWithPhotos } from '@/types';
import { StarRating } from '@/features/landing/components/ui/StarRating';
import { Button, CustomerReviewStatusBadge, EmptyState, Skeleton } from '@/components/ui';
import { StarIcon } from '@/components/ui/icons';

interface MyReviewsProps {
  onEdit: (review: CustomerReviewWithPhotos) => void;
}

/** Lista de "Mis reseñas" del usuario en /dejar-resena. */
export function MyReviews({ onEdit }: MyReviewsProps) {
  const { data, isLoading, isError } = useMyCustomerReviews();
  const deletePhoto = useDeleteCustomerReviewPhoto();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-pink-deep">
        No pudimos cargar tus reseñas. Intentalo de nuevo.
      </p>
    );
  }

  const reviews = data ?? [];

  if (!reviews.length) {
    return (
      <EmptyState
        icon={<StarIcon size={28} className="text-muted" />}
        title="Todavía no dejaste reseñas"
        description="Contanos cómo te fue en el taller escribiendo tu primera reseña."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li
          key={r.id}
          className="rounded-card border border-line bg-paper p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-ink">{r.nombre_visible}</span>
              <CustomerReviewStatusBadge status={r.estado} />
            </div>
            {r.estado !== 'aprobada' ? (
              <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(r)}>
                Editar
              </Button>
            ) : null}
          </div>

          <div className="mt-3">
            <StarRating rating={r.rating} starClassName="h-4 w-4 text-gold" />
          </div>

          <p className="mt-3 leading-relaxed text-ink">“{r.texto}”</p>

          {r.photos.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {r.photos.map((p) => (
                <div key={p.id} className="group relative h-16 w-16 overflow-hidden rounded-card border border-line">
                  <img src={p.storage_path} alt="" className="h-full w-full object-cover" />
                  {r.estado !== 'aprobada' ? (
                    <button
                      type="button"
                      aria-label="Quitar foto"
                      onClick={() => deletePhoto.mutate({ photoId: p.id, storagePath: p.storage_path })}
                      className="absolute right-0.5 top-0.5 hidden h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-paper group-hover:flex"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {r.estado === 'rechazada' && r.motivo_rechazo ? (
            <div className="mt-3 rounded-card border border-pink-deep/30 bg-pink-deep/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-deep">Motivo del rechazo</p>
              <p className="mt-1 text-sm text-ink">{r.motivo_rechazo}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
