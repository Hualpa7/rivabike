import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  pitchTitle?: string;
  pitchText?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

/**
 * Layout compartido de autenticacion (login / olvide-password): panel de
 * marca oscuro en desktop con el pitch del taller, y panel de formulario
 * a la derecha. En movil el brand-panel se oculta y aparece el logo arriba.
 * Replica docs/riva-bike-login.html.
 */
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  pitchTitle = 'El taller, en tus manos.',
  pitchText = 'Entrá al panel para armar presupuestos, gestionar tu inventario y seguir cada trabajo de tu bicicletería.',
  backHref = '/',
  backLabel = 'Volver a la página principal',
  children,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh md:grid-cols-[minmax(0,1fr)_480px]">
      {/* brand panel (desktop) */}
      <aside className="relative hidden flex-col justify-end overflow-hidden bg-ink p-[clamp(32px,6vw,72px)] text-paper md:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 15%, rgba(232,84,111,0.22), transparent 70%), radial-gradient(50% 40% at 85% 80%, rgba(232,84,111,0.14), transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-[6%] top-[12%] h-[220px] w-[220px] rounded-full border-2 border-pink/40 opacity-50 after:absolute after:left-1/2 after:top-1/2 after:h-[62%] after:w-[62%] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border after:border-pink/30"
        />
        <div className="relative z-[1]">
          <span className="font-display text-2xl font-bold tracking-tight">
            Riva<em className="not-italic text-pink">.</em>Bike
          </span>
        </div>
        <div className="relative z-[1] mt-auto max-w-[34ch] pt-20">
          <h1 className="font-display text-[clamp(30px,4.4vw,48px)] font-bold leading-[1.02] tracking-tight">
            {pitchTitle}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-paper/70">{pitchText}</p>
        </div>
      </aside>

      {/* form panel */}
      <main className="relative flex flex-col items-center justify-center bg-paper px-6 py-10 text-ink">
        <div className="absolute right-0 top-0 flex w-full justify-end p-5 md:w-[480px]">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[360px]">
          <div className="mb-7 block md:hidden">
            <span className="font-display text-[22px] font-bold tracking-tight">
              Riva<em className="not-italic text-pink">.</em>Bike
            </span>
          </div>
          <p className="mb-3.5 font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-pink">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="mb-7 mt-2.5 text-[15px] text-muted">{subtitle}</p>
          {children}
        </div>

        <Link to={backHref} className="mt-10 text-sm text-muted transition-colors hover:text-ink">
          ← {backLabel}
        </Link>
        <p className="mt-6 text-xs text-muted">© 2026 Riva Bike · Hipólito Yrigoyen, Salta</p>
      </main>
    </div>
  );
}
