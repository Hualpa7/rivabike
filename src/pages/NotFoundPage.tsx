import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui';

/** Pagina 404: replica el contrato visual de riva-bike-404.html. */
export function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-paper px-6 text-ink">
      {/* ruedas decorativas de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[6%] top-[8%] h-56 w-56 rounded-full border-[3px] border-pink/20 opacity-60 after:absolute after:left-1/2 after:top-1/2 after:h-1/3 after:w-1/3 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border after:border-pink/20 sm:h-80 sm:w-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[6%] right-[4%] h-44 w-44 rounded-full border-[3px] border-pink/15 opacity-40 sm:h-72 sm:w-72"
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between py-6">
        <span className="font-display text-xl font-bold tracking-tight">
          Riva<em className="not-italic text-pink">.</em>Bike
        </span>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-medium text-muted hover:text-ink">
              Inicio
            </Link>
            <Link to="/#servicios" className="text-sm font-medium text-muted hover:text-ink">
              Servicios
            </Link>
            <Link to="/#trabajos" className="text-sm font-medium text-muted hover:text-ink">
              Trabajos
            </Link>
            <Link to="/#contacto" className="text-sm font-medium text-muted hover:text-ink">
              Contacto
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center py-10 text-center">
        <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.16em] text-pink">
          Error · Ruta no encontrada
        </p>
        <div aria-hidden="true" className="font-display text-[96px] font-bold leading-[0.9] tracking-tighter sm:text-[160px] md:text-[200px]">
          4<span className="text-pink">0</span>4
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Se nos escapó esta página.
        </h1>
        <p className="mt-3 max-w-md text-muted">
          La dirección que buscás no existe o fue movida. Volvé al inicio para seguir con tu bici.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-pill bg-ink px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-pink-deep"
          >
            Volver al inicio
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-pill border border-ink px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:border-pink-deep hover:bg-pink-deep hover:text-paper"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl pb-2 text-center">
        <p className="text-xs text-muted">© 2026 Riva Bike · Hipólito Yrigoyen, Salta</p>
      </footer>
    </div>
  );
}
