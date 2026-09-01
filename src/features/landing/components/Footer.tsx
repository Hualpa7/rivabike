import { useSiteSettings } from '@/features/settings/api';

const NAV = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Cómo trabajamos', href: '#como-trabajamos' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Trabajos', href: '#trabajos' },
];

/** Footer oscuro de la landing: marca, navegacion, contacto y redes. */
export function Footer() {
  const { data: settings } = useSiteSettings();

  const phone = settings?.telefono?.replace('+', '');
  const whatsapp = settings?.whatsapp;

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1120px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-[28px] font-bold tracking-[-0.02em]">
              Riva<span className="text-pink">.</span>Bike
            </div>
            <p className="mt-3 max-w-[38ch] leading-relaxed text-white/70">
              {settings?.descripcion ??
                'Taller de reparación, mantenimiento y servicio técnico de bicicletas en Hipólito Yrigoyen.'}
            </p>
          </div>

          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-white/50">
              Navegación
            </div>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/85 transition-colors hover:text-pink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-white/50">
              Contacto
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`https://wa.me/${whatsapp ?? phone}`} target="_blank" rel="noopener noreferrer" className="text-white/85 transition-colors hover:text-pink">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`tel:+${phone}`} className="text-white/85 transition-colors hover:text-pink">
                  {(settings?.telefono ?? '3878 224212').replace('+', '')}
                </a>
              </li>
              <li className="text-white/55">{settings?.direccion?.split(',')[0] ?? 'Rivadavia 243'}</li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-white/50">
              Redes
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={settings?.instagram ? `https://instagram.com/${settings.instagram}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/85 transition-colors hover:text-pink"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" rel="noopener noreferrer" className="text-white/85 transition-colors hover:text-pink">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-6">
          <p className="text-sm text-white/55">© 2026 Riva Bike · Hipólito Yrigoyen, Salta</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver arriba"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-pink hover:bg-pink hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
