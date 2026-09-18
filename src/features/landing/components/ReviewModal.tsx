import { useState } from 'react';
import type { CustomerReviewWithPhotos } from '@/types';
import { toThumbUrl } from '@/lib/supabase/storage';
import { Modal } from '@/components/ui/Modal';
import { StarRating } from './ui/StarRating';

interface ReviewModalProps {
  review: CustomerReviewWithPhotos | null;
  onClose: () => void;
}

/** Modal de detalle de reseña: texto completo, fotos en carrusel expandible. */
export function ReviewModal({ review, onClose }: ReviewModalProps) {
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  if (!review) return null;

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
              {review.photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setExpandedPhoto(p.storage_path)}
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

      {/* Overlay de foto expandida */}
      {expandedPhoto ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--scrim)] p-4"
          onClick={() => setExpandedPhoto(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Escape') setExpandedPhoto(null); }}
        >
          <img
            src={expandedPhoto}
            alt=""
            loading="lazy"
            decoding="async"
            className="max-h-[85vh] max-w-[90vw] rounded-card object-contain shadow-soft"
          />
        </div>
      ) : null}
    </>
  );
}
