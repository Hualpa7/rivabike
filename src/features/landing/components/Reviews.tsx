import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/features/settings/api';
import { SectionHeading } from './ui/SectionHeading';
import { StarRating } from './ui/StarRating';
import { useApprovedCustomerReviews } from '@/features/landing/api';
import { toThumbUrl } from '@/lib/supabase/storage';
import { ArrowRightIcon } from '@/components/ui/icons';
import type { CustomerReviewWithPhotos } from '@/types';
import { ReviewModal } from './ReviewModal';

/**
 * Seccion de opiniones: reseñas propias aprobadas. Cuando hay varias, se
 * muestran en un carrusel horizontal que se desplaza de izquierda a derecha
 * abarcando todo el ancho de la pagina (CSS scroll-snap, sin dependencias).
 */
export function Reviews() {
  const { data: customer } = useApprovedCustomerReviews();
  const { data: s } = useSiteSettings();
  const [selected, setSelected] = useState<CustomerReviewWithPhotos | null>(null);

  const cards = customer ?? [];
  const showCarousel = cards.length > 3;

  return (
    <section
      id="opiniones"
      className="overflow-hidden border-y border-line bg-surface py-[clamp(56px,9vw,120px)]"
    >
      <div className="mx-auto max-w-[1120px] px-6">
        <SectionHeading
          eyebrow={s?.reviews_titulo ?? 'Opiniones'}
          title={s?.reviews_subtitulo ?? 'Lo que dicen quienes ya pasaron por el taller.'}
        />

        <div className="mt-8 flex justify-center">
          <Link
            to="/dejar-resena"
            className="inline-flex items-center gap-2 rounded-pill bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-pink-deep"
          >
            ¿Ya nos visitaste? Dejá tu reseña
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="mx-auto mt-10 max-w-[1120px] px-6">
          <p className="text-center text-sm text-muted">
            Aún no hay opiniones. ¡Sé el primero en dejar la tuya!
          </p>
        </div>
      ) : showCarousel ? (
        /* Carrusel horizontal continuo: duplica las tarjetas y las desplaza
           de izquierda a derecha abarcando todo el ancho de la pagina. */
        <div className="group relative mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-surface to-transparent" />
          <div className="overflow-hidden">
            <div className="riva-marquee-track gap-6 pr-6">
              {[...cards, ...cards].map((card, i) => (
                <div key={i} className="snap-start">
                  <ReviewCardView card={card} onSelect={setSelected} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-10 grid max-w-[1120px] gap-6 px-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <ReviewCardView key={i} card={card} onSelect={setSelected} />
          ))}
        </div>
      )}

      <ReviewModal review={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function ReviewCardView({
  card,
  onSelect,
}: {
  card: CustomerReviewWithPhotos;
  onSelect: (r: CustomerReviewWithPhotos) => void;
}) {
  return (
    <figure
      onClick={() => onSelect(card)}
      className="flex h-full w-[340px] flex-col rounded-card border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft cursor-pointer"
    >
      <StarRating rating={card.rating} starClassName="h-4 w-4 text-gold" />
      <blockquote className="mt-4 flex-1 leading-relaxed text-ink">"{card.texto}"</blockquote>
      {card.photos.length ? (
        <div className="mt-4 flex gap-2">
          {card.photos.slice(0, 4).map((p) => (
            <img
              key={p.id}
              src={toThumbUrl(p.storage_path)}
              alt=""
              loading="lazy"
              decoding="async"
              onError={(e) => {
                if (e.currentTarget.src !== p.storage_path) e.currentTarget.src = p.storage_path;
              }}
              className="h-14 w-14 rounded-card border border-line object-cover"
            />
          ))}
        </div>
      ) : null}
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-deep/15 font-semibold text-pink-deep">
          {card.nombre_visible.charAt(0)}
        </span>
        <div>
          <div className="text-sm font-semibold text-ink">{card.nombre_visible}</div>
          <div className="text-xs text-muted">Cliente verificado</div>
        </div>
      </figcaption>
    </figure>
  );
}
