import { useSiteSettings } from '@/features/settings/api';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { StarRating } from './ui/StarRating';
import { useGoogleReviews } from '@/features/landing/api';

/** Seccion de opiniones: 3 testimonios de Google. */
export function Reviews() {
  const { data } = useGoogleReviews();
  const { data: s } = useSiteSettings();
  const reviews = data?.reviews ?? [];

  return (
    <section
      id="opiniones"
      className="border-y border-line bg-surface py-[clamp(56px,9vw,120px)]"
    >
      <div className="mx-auto max-w-[1120px] px-6">
        <SectionHeading
          eyebrow={s?.reviews_titulo ?? 'Opiniones'}
          title={s?.reviews_subtitulo ?? 'Lo que dicen quienes ya pasaron por el taller.'}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.author_name} from="up" delay={i * 0.09}>
              <figure className="flex h-full flex-col rounded-card border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                <StarRating rating={r.rating} starClassName="h-4 w-4 text-gold" />
                <blockquote className="mt-4 flex-1 leading-relaxed text-ink">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-semibold text-paper">
                    {r.author_name.charAt(0)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink">{r.author_name}</div>
                    <div className="text-xs text-muted">{r.relative_time_description}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
