import { useState } from 'react';
import { useGalleryItems } from '@/features/gallery/api';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { ArrowRightIcon } from '@/components/ui/icons';
import { BeforeAfterSlider } from './ui/BeforeAfterSlider';

function trabajoImages(t: { images: { tipo: string | null; storage_path: string }[] }) {
  return {
    before:
      t.images.find((i) => i.tipo === 'antes')?.storage_path ??
      t.images[0]?.storage_path ??
      '',
    after:
      t.images.find((i) => i.tipo === 'despues')?.storage_path ??
      t.images[1]?.storage_path ??
      '',
  };
}

function checksDe(t: { check_1?: string | null; check_2?: string | null; check_3?: string | null; check_4?: string | null }) {
  return [t.check_1, t.check_2, t.check_3, t.check_4].filter((c): c is string => !!c);
}

/** Seccion de trabajos: showcase antes/despues + galeria de 6 imagenes. */
export function Trabajos() {
  const { data } = useGalleryItems({ onlyPublished: true });
  const items = data ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = items[selectedIndex] ?? items[0];
  const checks = selected ? checksDe(selected) : [];
  const showcaseImages = selected ? trabajoImages(selected) : { before: '', after: '' };

  const selectItem = (index: number) => {
    setSelectedIndex(index);
    document
      .getElementById('trabajos-showcase')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="trabajos" className="mx-auto max-w-[1120px] px-6 py-[clamp(56px,9vw,120px)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Nuestros trabajos"
          title="Bicicletas que pasaron por el taller."
        />
        <a
          href="#contacto"
          className="group inline-flex items-center gap-2 px-2 py-1 text-sm font-semibold text-ink transition-colors hover:text-pink-deep"
        >
          Consultá por la tuya
          <ArrowRightIcon size={18} className="transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      {selected ? (
        <Reveal className="mt-10">
          <div
            id="trabajos-showcase"
            tabIndex={-1}
            className="scroll-mt-28 scroll-smooth outline-none"
          >
            <div className="grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
              <BeforeAfterSlider before={showcaseImages.before} after={showcaseImages.after} />
              <div>
                <p className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-pink-deep">
                  {selected.categoria ?? 'Trabajo'}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
                  {selected.titulo}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{selected.descripcion}</p>
                {checks.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {checks.map((c) => (
                      <li key={c} className="flex items-center gap-2.5 text-sm">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-pink-deep" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="rounded-pill border border-line bg-surface px-3 py-1 text-[13px] font-medium text-ink">
                          {c}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      ) : null}

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {items.map((item, i) => {
          const tag = item.categoria ?? 'Trabajo';
          const img = item.images[0]?.storage_path;
          const isSelected = i === selectedIndex;
          return (
            <Reveal key={item.id} from="up" delay={(i % 3) * 0.09}>
              <button
                type="button"
                onClick={() => selectItem(i)}
                className={`group relative block w-full overflow-hidden rounded-card border text-left transition-all duration-300 hover:shadow-soft focus-visible:outline-none ${
                  isSelected ? 'border-pink shadow-soft' : 'border-line'
                }`}
                aria-label={`Ver ${item.titulo}`}
              >
                {img ? (
                  <img
                    src={img}
                    alt={item.titulo}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-surface" />
                )}
                <span className="absolute bottom-3 left-3 rounded-pill bg-white px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-black backdrop-blur-sm transition-colors group-hover:bg-pink group-hover:text-white">
                  {tag}
                </span>
                <span
                  role="presentation"
                  className="absolute right-3 top-3 rounded-pill bg-ink-fixed px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-on-ink-fixed shadow-sm"
                >
                  Ver trabajo
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
