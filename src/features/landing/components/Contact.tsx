import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSiteSettings } from '@/features/settings/api';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { PhoneIcon, MapPinIcon, ClockIcon, ArrowRightIcon } from '@/components/ui/icons';

const empty = { nombre: '', telefono: '', mensaje: '' };

function buildWhatsAppLink(whatsapp: string | undefined, values: typeof empty): string {
  const number = whatsapp ?? '543878224212';
  const text = `Hola! Soy ${values.nombre}. ${values.mensaje} (${values.telefono})`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const rows = (phone: string | null, address: string | null, hours: string | null) => [
  {
    icon: PhoneIcon,
    label: 'WhatsApp',
    value: phone?.replace('+', '') ?? '3878 224212',
    href: `https://wa.me/${phone?.replace('+', '') ?? '543878224212'}`,
  },
  { icon: MapPinIcon, label: 'Dirección', value: address ?? 'Rivadavia 243, Hipólito Yrigoyen' },
  { icon: ClockIcon, label: 'Horarios', value: hours ?? 'Lun a Vie · 8:30–13:00 y 16:30–20:30 · Sáb 8:30–13:00' },
];

/** Seccion de contacto: info + mapa placeholder + formulario (wa.me). */
export function Contact() {
  const { data: settings } = useSiteSettings();
  const [sent, setSent] = useState(false);
  const [link, setLink] = useState('');

  const schema = z.object({
    nombre: z.string().min(1, 'Contanos tu nombre'),
    telefono: z.string().min(1, 'Necesitamos un teléfono'),
    mensaje: z.string().min(1, 'Contanos qué necesita tu bici'),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    setLink(buildWhatsAppLink(settings?.whatsapp ?? undefined, values));
    setSent(true);
    reset();
    setTimeout(() => setSent(false), 8000);
  };

  return (
    <section
      id="contacto"
      className="relative bg-[url('https://www.10wallpaper.com/wallpaper/1366x768/1412/Extreme_mountain_biking_Sports_HD_Wallpaper_01_1366x768.jpg')] bg-cover bg-center py-[clamp(56px,9vw,120px)]"
    >
      <div className="absolute inset-0 bg-photo-scrim" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px] px-6">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablá con nosotros y dejá tu bici en buenas manos."
          lead="Respondemos por WhatsApp o te atendemos en el taller. Contanos qué necesita tu bici."
          onDark
        />

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-3">
              {rows(
                settings?.telefono ?? null,
                settings?.direccion ?? null,
                settings?.horarios ?? null,
              ).map((r) => (
                <Reveal key={r.label} from="left">
                  <div className="flex items-center gap-4 rounded-card border-2 border-line bg-paper p-4 shadow-soft">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border-2 border-line text-pink-deep dark:text-pink">
                      <r.icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                        {r.label}
                      </div>
                      {r.href ? (
                        <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-ink transition-colors hover:text-pink-deep dark:hover:text-pink">
                          {r.value}
                        </a>
                      ) : (
                        <div className="text-ink">{r.value}</div>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <a
                href={settings?.google_maps_url ?? 'https://maps.google.com/?q=Rivadavia+243+Hipolito+Yrigoyen'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-pill bg-white px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-pink hover:text-white"
              >
                Cómo llegar
                <ArrowRightIcon size={18} />
              </a>
            </Reveal>

            {/* Logo + slogan grande (copia independiente del navbar - tamanios propios) */}
            <Reveal from="left" className="hidden flex-col items-center text-center lg:flex">
              <a href="#inicio" className="flex flex-col items-center justify-center transition-opacity hover:opacity-90" aria-label="Riva Bike">
                <ContactBrandMark />
                <ContactBrandWordmark />
              </a>
              <div className="mt-5 leading-snug">
                <p className="text-xl font-black uppercase tracking-[2px] text-cream">
                  Tu libertad
                </p>
                <p className="text-xl font-bold uppercase tracking-[2px] text-pink">
                  sobre ruedas
                </p>
              </div>
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal from="right">
              <div className="aspect-[16/10] w-full overflow-hidden rounded-card border border-line backdrop-blur-md">
                <iframe
                  title="Mapa: Rivadavia 243, Hipólito Yrigoyen, Salta"
                  src="https://maps.google.com/maps?q=Rivadavia%20243%2C%20Hip%C3%B3lito%20Yrigoyen%2C%20Salta&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>

            <Reveal from="right" delay={0.1} className="mt-4 md:mt-8">
              <form onSubmit={handleSubmit(onSubmit)} className="rounded-card border-2 border-line bg-paper p-6 shadow-soft md:p-8">
                <h3 className="font-display text-xl font-bold text-ink">Dejanos tu consulta</h3>
                <div className="mt-5 space-y-5">
                  <Field
                    label="Nombre"
                    placeholder="Tu nombre"
                    error={errors.nombre?.message}
                    {...register('nombre')}
                    autoComplete="name"
                  />
                  <Field
                    label="Teléfono"
                    placeholder="3878 000 000"
                    error={errors.telefono?.message}
                    {...register('telefono')}
                    autoComplete="tel"
                  />
                  <div>
                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                      Mensaje
                    </label>
                    <textarea
                      placeholder="Contanos qué le pasa a tu bici o qué servicio te interesa…"
                      rows={4}
                      className="w-full resize-none border-b border-line bg-transparent py-2 text-ink outline-none transition-colors focus:border-pink-deep"
                      {...register('mensaje')}
                    />
                    {errors.mensaje?.message ? (
                      <p className="mt-1 text-xs text-pink-deep">{errors.mensaje.message}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-pill bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-pink-deep"
                >
                  Enviar consulta
                </button>
                {sent ? (
                  <p className="mt-3 text-sm text-pink-deep">
                    ¡Gracias! {link ? <a href={link} target="_blank" rel="noopener noreferrer" className="underline">Abrir WhatsApp</a> : 'Te respondemos a la brevedad.'}
                  </p>
                ) : null}
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Marca del contacto: copia autonoma del logo (no usa los componentes
 * compartidos del navbar), asi su tamanio se puede modificar sin afectar
 * al topbar. Trazo crema + rosa sobre la foto oscura.
 */
function ContactBrandMark() {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-40 w-auto"
      aria-hidden="true"
    >
      <circle cx={24} cy={42} r={15} stroke="#faf5f2" strokeWidth={4} />
      <circle cx={70} cy={42} r={15} stroke="#ef7d97" strokeWidth={4} />
      <path
        d="M24 42 L46 14 L58 14 M46 14 L38 24 M70 42 L52 20"
        stroke="#ef7d97"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Wordmark del contacto: copia autonoma (no usa BrandWordmark del
 * navbar). Tamanios propios, independientes del topbar.
 */
function ContactBrandWordmark() {
  return (
    <span className="mt-4 leading-none">
      <span className="block text-5xl font-black lowercase tracking-[0.5px] text-cream">
        riva
      </span>
      <span className="block text-3xl font-black lowercase tracking-[4px] text-pink">
        bike
      </span>
    </span>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Field({ label, error, ...props }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <input
        className="w-full border-b border-line bg-transparent py-2 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-pink-deep"
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-pink-deep">{error}</p> : null}
    </div>
  );
}
