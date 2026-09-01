import { useSiteSettings } from '@/features/settings/api';
import { SectionHeading } from './ui/SectionHeading';
import { PhImg } from './ui/PhImg';
import { Reveal } from './ui/Reveal';
import { CheckIcon } from '@/components/ui/icons';

/** Seccion Nosotros (2 columnas: texto + imagen placeholder). */
export function About() {
  const { data: s } = useSiteSettings();
  const benefits = [
    {
      title: s?.about_check_1 ?? 'Especialistas en bicis',
      text:
        s?.about_check_1_descripcion ??
        'No hacemos de todo: hacemos bicicletas. Por eso cada ajuste queda como corresponde.',
    },
    {
      title: s?.about_check_2 ?? 'Trabajo con garantía',
      text:
        s?.about_check_2_descripcion ??
        'Entregamos cada bicicleta probada y te explicamos qué se hizo y por qué.',
    },
  ];
  return (
    <section id="nosotros" className="mx-auto max-w-[1120px] px-6 py-[clamp(56px,9vw,120px)]">
      <div className="grid items-center gap-6 md:grid-cols-[1.05fr_1fr] md:gap-12">
        <div>
          <SectionHeading
            eyebrow="Quiénes somos"
            title={s?.about_titulo ?? 'El taller de bicicletas del barrio, con oficio de verdad.'}
            lead={s?.about_descripcion ?? 'En Riva Bike arreglamos y mantenemos bicicletas de todo tipo. Trabajo prolijo, repuestos de calidad y un diagnóstico claro antes de tocar nada.'}
          />
          <div className="mt-8 space-y-5">
            {benefits.map((b, i) => (
              <Reveal key={b.title} from="left" delay={i * 0.1}>
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <CheckIcon size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{b.title}</h3>
                    <p className="mt-1 max-w-[50ch] leading-relaxed text-muted">{b.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal from="right" className="animate-float">
          <PhImg label="Foto del taller" />
        </Reveal>
      </div>
    </section>
  );
}
