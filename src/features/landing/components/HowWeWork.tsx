import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useSiteSettings } from '@/features/settings/api';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';

const FALLBACK_STEPS = [
  { n: '01', title: 'Traés tu bici', text: 'La traés al taller, o coordinamos retirarla por la zona.' },
  { n: '02', title: 'Diagnóstico y presupuesto', text: 'Revisamos qué tiene y te pasamos un presupuesto claro por WhatsApp.' },
  { n: '03', title: 'Reparación', text: 'Trabajamos con repuestos de calidad y te avisamos si surge algo más.' },
  { n: '04', title: 'Retirás tu bici', text: 'Probamos todo en banco y te la entregamos lista para rodar.' },
];

/** Banda fotografica oscura con panel de vidrio y 4 pasos numerados. */
export function HowWeWork() {
  const { data: s } = useSiteSettings();
  const steps = [
    {
      n: '01',
      title: s?.how_we_work_paso1_titulo ?? FALLBACK_STEPS[0].title,
      text: s?.how_we_work_paso1_descripcion ?? FALLBACK_STEPS[0].text,
    },
    {
      n: '02',
      title: s?.how_we_work_paso2_titulo ?? FALLBACK_STEPS[1].title,
      text: s?.how_we_work_paso2_descripcion ?? FALLBACK_STEPS[1].text,
    },
    {
      n: '03',
      title: s?.how_we_work_paso3_titulo ?? FALLBACK_STEPS[2].title,
      text: s?.how_we_work_paso3_descripcion ?? FALLBACK_STEPS[2].text,
    },
    {
      n: '04',
      title: s?.how_we_work_paso4_titulo ?? FALLBACK_STEPS[3].title,
      text: s?.how_we_work_paso4_descripcion ?? FALLBACK_STEPS[3].text,
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((i) => (i + 1) % steps.length);
    }, 1500);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <section
      id="como-trabajamos"
      className="relative bg-[url('https://minireview.io/common/uploads/review/743de6e1ca3350c70004190ffb682327.jpg')] bg-cover bg-fixed py-[clamp(56px,9vw,120px)]"
    >
      <div className="absolute inset-0 bg-[rgba(10,10,10,0.6)]" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px] px-6">
        <div className="rounded-card border-2 border-line bg-paper p-6 shadow-soft md:p-10">
          <SectionHeading
            eyebrow={s?.how_it_works_titulo ?? 'Cómo trabajamos'}
            title={s?.how_it_works_subtitulo ?? 'Cuatro pasos y tu bici vuelve lista.'}
            lead={s?.how_it_works_descripcion ?? 'Sin vueltas: te mostramos el presupuesto antes de empezar y no arreglamos nada que no hayas aprobado.'}
          />
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.n} from="up" delay={i * 0.09}>
              <div
                className={cn(
                  'flex h-full flex-col rounded-card border-2 bg-paper p-6 shadow-soft transition-colors duration-500',
                  activeStep === i ? 'border-pink' : 'border-line',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-10 min-w-10 items-center justify-center self-start rounded-pill px-3 font-mono text-sm font-bold transition-colors duration-500',
                    activeStep === i ? 'bg-pink text-white' : 'bg-ink text-paper',
                  )}
                >
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold leading-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
