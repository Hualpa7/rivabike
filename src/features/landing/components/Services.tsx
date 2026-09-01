import type { Service } from '@/types';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/fmt';
import { useServices } from '@/features/services/api';
import { useSiteSettings } from '@/features/settings/api';
import { servicePresentation } from '@/features/landing/landing';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';

interface ServicesProps {
  onSelect: (service: Service) => void;
}

/** Banda fotografica oscura con 6 cards de servicio y precios a la vista. */
export function Services({ onSelect }: ServicesProps) {
  const { data: services } = useServices({ onlyActive: true });
  const { data: s } = useSiteSettings();
  const items = services ?? [];

  return (
    <section
      id="servicios"
      className="relative bg-[url('https://img.magnific.com/foto-gratis/marco-diferentes-herramientas-coche-juguete_23-2148096416.jpg?semt=ais_hybrid&w=740&q=80')] bg-cover bg-center py-[clamp(56px,9vw,120px)]"
    >
      <div className="absolute inset-0 bg-ink/72" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px] px-6">
        <SectionHeading
          eyebrow={s?.services_titulo ?? 'Servicios'}
          title={s?.services_subtitulo ?? 'Los trabajos que más pedís, con precio a la vista.'}
          onDark
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => {
            const p = servicePresentation(s);
            const featured = p.featured ?? false;
            return (
              <Reveal key={s.id} from="up" delay={(i % 3) * 0.09}>
                <article
                  className={cn(
                    'flex h-full flex-col overflow-hidden rounded-card border bg-paper',
                    featured ? 'border-pink-deep shadow-soft' : 'border-white/10',
                  )}
                >
                  {s.imagen_url ? (
                    <img
                      src={s.imagen_url}
                      alt={s.titulo}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-[var(--surface-2)] font-mono text-xs uppercase tracking-[0.14em] text-muted">
                      Foto del servicio
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[19px] font-semibold leading-tight text-ink">
                        {s.titulo}
                      </h3>
                      {p.note ? (
                        <p className="mt-1 text-sm leading-snug text-muted">{p.note}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-mono text-xl font-bold text-pink-deep">
                      {formatCurrency(s.precio_base)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-line pt-3 text-xs">
                    <span className="flex flex-wrap gap-x-2 gap-y-0.5 text-muted">
                      {p.tags.map((t) => (
                        <span key={t} className={cn(t === 'Destacado' && 'font-semibold text-pink-deep')}>
                          {t}
                        </span>
                      ))}
                    </span>
                    <span className="font-mono text-muted">{p.time}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelect(s)}
                    className="mt-auto w-full rounded-pill bg-surface px-4 py-2.5 pt-2.5 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    Ver detalle →
                  </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-8 max-w-[60ch] text-sm leading-relaxed text-white/70">
          Los precios son de referencia y pueden variar. Pedí tu presupuesto sin compromiso.
        </p>
      </div>
    </section>
  );
}
