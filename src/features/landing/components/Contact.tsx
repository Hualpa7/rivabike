import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSiteSettings } from '@/features/settings/api';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { PhImg } from './ui/PhImg';
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
      <div className="absolute inset-0 bg-ink/75" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1120px] px-6">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablá con nosotros y dejá tu bici en buenas manos."
          lead="Respondemos por WhatsApp o te atendemos en el taller. Contanos qué necesita tu bici."
          onDark
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-3">
              {rows(
                settings?.telefono ?? null,
                settings?.direccion ?? null,
                settings?.horarios ?? null,
              ).map((r) => (
                <Reveal key={r.label} from="left">
                  <div className="flex items-center gap-4 rounded-card border border-white/15 bg-white/5 p-4 backdrop-blur-md">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/20 text-pink">
                      <r.icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
                        {r.label}
                      </div>
                      {r.href ? (
                        <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-white transition-colors hover:text-pink">
                          {r.value}
                        </a>
                      ) : (
                        <div className="text-white">{r.value}</div>
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
          </div>

          <div className="space-y-6">
            <Reveal from="right">
              <PhImg label="Mapa (placeholder)" ratio="aspect-[16/10]" className="backdrop-blur-md" />
            </Reveal>

            <Reveal from="right" delay={0.1}>
              <form onSubmit={handleSubmit(onSubmit)} className="rounded-card bg-paper/95 p-6 backdrop-blur-sm md:p-8">
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
                  className="mt-6 w-full rounded-pill bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-pink-deep"
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
