import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/features/auth/store';
import { BrandMark, BrandWordmark } from '@/components/ui/icons/BrandMark';
import { CloseIcon } from '@/components/ui/icons';

/**
 * Navbar compartido para paginas publicas (login, forgot-password,
 * dejar-resena). Siempre estilo oscuro (vino) como la landing.
 * Muestra logo y dos botones: "Dejar reseñas" y "¿Sos del equipo? Iniciar sesión".
 * En movil se pliega en un menu full-screen con hamburguesa.
 */
export function PublicNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const status = useAuthStore((s) => s.status);
  const isStaff = useAuthStore((s) => s.isStaff);

  const reviewLabel = status !== 'authenticated'
    ? 'Dejar reseñas'
    : 'Ver mis reseñas';

  const staffLabel = isStaff
    ? 'Ir al dashboard'
    : '¿Sos del equipo? Iniciar sesión';

  const staffHref = isStaff ? '/dashboard/inicio' : '/login';

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-fixed backdrop-blur-[14px]">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90" aria-label="Riva Bike">
            <BrandMark className="h-8 w-auto" />
            <BrandWordmark />
          </Link>

          <nav className="hidden items-center gap-3 md:flex" aria-label="Principal">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/dejar-resena')}
                className="rounded-pill bg-pink px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-deep"
              >
                {reviewLabel}
              </button>
              {status !== 'authenticated' || isStaff ? (
                <button
                  type="button"
                  onClick={() => navigate(staffHref)}
                  className="rounded-pill border border-white/35 px-[18px] py-2.5 text-sm font-semibold text-on-ink-fixed transition-colors hover:border-pink hover:text-pink"
                >
                  {staffLabel}
                </button>
              ) : null}
            </div>
          </nav>

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
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ink-fixed md:hidden"
          >
            <div className="flex h-full flex-col justify-end px-6 pb-10 pt-24">
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