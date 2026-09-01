import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CloseIcon } from '@/components/ui/icons';

const SCOLLED_AT = 24;

const DESKTOP_LINKS = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Trabajos', href: '#trabajos' },
  { label: 'Contacto', href: '#contacto' },
];

const MOBILE_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Cómo trabajamos', href: '#como-trabajamos' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Trabajos', href: '#trabajos' },
  { label: 'Contacto', href: '#contacto' },
];

/**
 * Nav de la landing: fija, transparente-tint sobre el hero y solida al
 * hacer scroll. Incluye CTA "Solicitar presupuesto", toggle de tema y menu
 * full-screen en movil.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCOLLED_AT);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          solid
            ? 'bg-paper/88 shadow-soft backdrop-blur-xl'
            : 'border-b border-white/10 bg-black/55 backdrop-blur-[14px]',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-6 px-6">
          <Link
            to="/#inicio"
            onClick={() => setOpen(false)}
            className={cn(
              'font-display text-[21px] font-bold tracking-[-0.02em] transition-colors',
              solid ? 'text-ink' : 'text-white',
            )}
            aria-label="Riva Bike"
          >
            Riva<span className="text-pink">.</span>Bike
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
            {DESKTOP_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-pink',
                  solid ? 'text-ink/90' : 'text-white/90',
                )}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#servicios"
              className={cn(
                'rounded-pill border px-[18px] py-2.5 text-sm font-semibold transition-colors hover:border-pink hover:bg-pink hover:text-white',
                solid ? 'border-ink text-ink' : 'border-white text-white',
              )}
            >
              Solicitar presupuesto
            </a>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle
              className={solid ? 'text-ink' : 'text-white'}
              label={solid ? 'Cambiar tema' : 'Cambiar tema'}
            />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden',
                solid ? 'text-ink' : 'text-white',
              )}
            >
              {open ? <CloseIcon size={24} /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ink md:hidden"
          >
            <div className="flex h-full flex-col justify-between px-6 pb-10 pt-24">
              <nav className="flex flex-col" aria-label="Menú móvil">
                {MOBILE_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-white/10 py-4 font-display text-[28px] font-semibold text-white transition-colors hover:text-pink"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <a
                href="#servicios"
                onClick={() => setOpen(false)}
                className="rounded-pill bg-pink px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide text-white hover:bg-pink-deep"
              >
                Solicitar presupuesto
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
