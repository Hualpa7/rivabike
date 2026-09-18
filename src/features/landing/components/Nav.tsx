import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/features/auth/store';
import { CloseIcon } from '@/components/ui/icons';
import { BrandMark, BrandWordmark } from '@/components/ui/icons/BrandMark';

const SCOLLED_AT = 24;

const DESKTOP_LINKS = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Trabajos', href: '#trabajos' },
  { label: 'Reseñas', href: '#opiniones' },
];

const MOBILE_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Cómo trabajamos', href: '#como-trabajamos' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Trabajos', href: '#trabajos' },
  { label: 'Reseñas', href: '#opiniones' },
];

/**
 * Nav de la landing: fija, transparente-tint sobre el hero y solida al
 * hacer scroll. Incluye CTA "Solicitar presupuesto", toggle de tema y menu
 * full-screen en movil.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const isStaff = useAuthStore((s) => s.isStaff);

  const reviewLabel = status !== 'authenticated'
    ? 'Dejar reseñas'
    : 'Ver mis reseñas';

  const staffLabel = isStaff
    ? 'Ir al dashboard'
    : '¿Sos del equipo? Iniciar sesión';

  const staffHref = isStaff ? '/dashboard/inicio' : '/login';

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
          'fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-fixed pb-[0.3rem] backdrop-blur-[14px] transition-all duration-300',
          solid ? 'shadow-md' : '',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-6 px-6">
          <Link
            to="/#inicio"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="Riva Bike"
          >
            <BrandMark className="h-8 w-auto" />
            <BrandWordmark />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
            {DESKTOP_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-on-ink-fixed transition-colors hover:text-pink"
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/dejar-resena'); }}
              className="rounded-pill bg-pink px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-deep"
            >
              {reviewLabel}
            </button>
            {status !== 'authenticated' || isStaff ? (
              <button
                type="button"
                onClick={() => { setOpen(false); navigate(staffHref); }}
                className="rounded-pill border border-white/40 px-[18px] py-2.5 text-sm font-semibold text-on-ink-fixed transition-colors hover:border-pink hover:text-pink"
              >
                {staffLabel}
              </button>
            ) : null}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden pr-1 text-right leading-snug md:block">
              <p className="text-[10px] font-black uppercase tracking-[1.6px] text-cream">
                Tu libertad
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-pink">
                sobre ruedas
              </p>
            </div>
            <ThemeToggle className="text-on-ink-fixed" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-ink-fixed md:hidden"
            >
              {open ? <CloseIcon size={24} /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ink-fixed md:hidden"
          >
            <div className="flex h-full flex-col justify-between px-6 pb-10 pt-24">
              <nav className="flex flex-col" aria-label="Menú móvil">
                {MOBILE_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-white/10 py-4 font-display text-[28px] font-semibold text-on-ink-fixed transition-colors hover:text-pink"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate('/dejar-resena'); }}
                  className="rounded-pill bg-pink px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide text-white hover:bg-pink-deep"
                >
                  {reviewLabel}
                </button>
                {status !== 'authenticated' || isStaff ? (
                  <button
                    type="button"
                    onClick={() => { setOpen(false); navigate(staffHref); }}
                    className="rounded-pill border border-white/30 px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide text-on-ink-fixed transition-colors hover:border-pink hover:text-pink"
                  >
                    {staffLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </m.div>
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
