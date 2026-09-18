import { useEffect, useState } from 'react';
import type { CustomerReviewWithPhotos } from '@/types';
import { toThumbUrl } from '@/lib/supabase/storage';
import { Modal } from '@/components/ui/Modal';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { StarRating } from './ui/StarRating';

interface ReviewModalProps {
  review: CustomerReviewWithPhotos | null;
  onClose: () => void;
}

/** Modal de detalle de reseña: texto completo, fotos en carrusel expandible. */
export function ReviewModal({ review, onClose }: ReviewModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    setExpandedIndex(null);
  }, [review?.id]);

  if (!review) return null;

  const total = review.photos.length;
  const expandedPhoto = expandedIndex !== null ? review.photos[expandedIndex] ?? null : null;
  const goPrev = () => setExpandedIndex((i) => (i === null ? i : (i - 1 + total) % total));
  const goNext = () => setExpandedIndex((i) => (i === null ? i : (i + 1) % total));

  return (
    <>
      <Modal open={!!review} onClose={onClose} className="sm:max-w-2xl">
        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} starClassName="h-5 w-5 text-gold" />
          <span className="text-sm font-semibold text-muted">{review.rating}/5</span>
        </div>

        <h3 className="mt-4 font-display text-xl font-bold text-ink">{review.nombre_visible}</h3>
        <p className="text-xs text-muted">Cliente verificado</p>

        <blockquote className="mt-4 leading-relaxed text-ink">"{review.texto}"</blockquote>

        {review.photos.length > 0 ? (
          <div className="mt-6">
            <p className="mb-3 font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-pink">
              Fotos
            </p>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
              {review.photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setExpandedIndex(i)}
                  className="shrink-0 snap-start"
                >
                  <img
                    src={toThumbUrl(p.storage_path)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (e.currentTarget.src !== p.storage_path) e.currentTarget.src = p.storage_path;
                    }}
                    className="h-28 w-28 rounded-card border border-line object-cover transition-transform hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Overlay de foto expandida con navegación entre fotos */}
      {expandedPhoto ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--scrim)] p-4"
          onClick={() => setExpandedIndex(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setExpandedIndex(null);
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
          }}
        >
          <button
            type="button"
            aria-label="Cerrar foto"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedIndex(null);
            }}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-fixed/80 text-on-ink-fixed transition-colors hover:bg-pink-deep"
          >
            <CloseIcon size={20} />
          </button>
          {total > 1 ? (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink-fixed/80 text-on-ink-fixed transition-colors hover:bg-pink-deep sm:left-4"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink-fixed/80 text-on-ink-fixed transition-colors hover:bg-pink-deep sm:right-4"
              >
                <ChevronRightIcon size={20} />
              </button>
            </>
          ) : null}
          <img
            src={expandedPhoto.storage_path}
            alt=""
            loading="lazy"
            decoding="async"
            className="max-h-[85vh] max-w-[90vw] rounded-card object-contain shadow-soft"
          />
          {total > 1 && expandedIndex !== null ? (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-pill bg-ink-fixed/80 px-3 py-1 font-mono text-xs font-semibold text-on-ink-fixed">
              {expandedIndex + 1}/{total}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
