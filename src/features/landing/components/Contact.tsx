import { useSiteSettings } from '@/features/settings/api';
import { SectionHeading } from './ui/SectionHeading';
import { Reveal } from './ui/Reveal';
import { PhoneIcon, MapPinIcon, ClockIcon, ArrowRightIcon } from '@/components/ui/icons';

const rows = (
  whatsapp: string | null,
  phone: string | null,
  address: string | null,
  hours: string | null,
) => {
  const waNumber = (whatsapp ?? phone ?? '').replace('+', '');
  return [
    {
      icon: PhoneIcon,
      label: 'WhatsApp',
      value: waNumber || '3878 224212',
      href: `https://wa.me/${waNumber || '543878224212'}`,
    },
    { icon: MapPinIcon, label: 'Dirección', value: address ?? 'Rivadavia 243, Hipólito Yrigoyen' },
    { icon: ClockIcon, label: 'Horarios', value: hours ?? 'Lun a Vie · 8:30–13:00 y 16:30–20:30 · Sáb 8:30–13:00' },
  ];
};

/** Seccion de contacto: info + mapa. El formulario fue removido. */
export function Contact() {
  const { data: settings } = useSiteSettings();

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
                settings?.whatsapp ?? null,
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
          </div>

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
        </div>
      </div>
    </section>
  );
}