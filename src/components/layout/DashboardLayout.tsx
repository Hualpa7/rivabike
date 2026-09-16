import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/features/auth/store';
import { useTheme } from '@/hooks/useTheme';
import { signOut } from '@/features/auth/api';
import {
  DashboardIcon,
  WrenchIcon,
  BoxIcon,
  TicketIcon,
  FileTextIcon,
  ImageIcon,
  TextIcon,
  StarIcon,
  LogoutIcon,
  PlusIcon,
  DotsIcon,
} from '@/components/ui/icons';
import { BrandMark, BrandWordmark } from '@/components/ui/icons/BrandMark';

const NAV = [
  { to: '/dashboard/inicio', label: 'Inicio', icon: DashboardIcon },
  { to: '/dashboard/servicios', label: 'Servicios', icon: WrenchIcon },
  { to: '/dashboard/inventario', label: 'Inventario', icon: BoxIcon },
  { to: '/dashboard/ordenes', label: 'Órdenes', icon: TicketIcon },
  { to: '/dashboard/presupuestos', label: 'Presupuestos', icon: FileTextIcon },
  { to: '/dashboard/galeria', label: 'Galería', icon: ImageIcon },
  { to: '/dashboard/resenas', label: 'Reseñas', icon: StarIcon },
  { to: '/dashboard/contenido', label: 'Contenido del sitio', icon: TextIcon },
];

const NAV_BOTTOM = [
  { to: '/dashboard/inicio', label: 'Inicio', icon: DashboardIcon },
  { to: '/dashboard/ordenes', label: 'Órdenes', icon: TicketIcon },
];

const NAV_FAB = { to: '/dashboard/ordenes/nueva', label: 'Nueva' };

const NAV_RIGHT = [
  { to: '/dashboard/inventario', label: 'Inventario', icon: BoxIcon },
];

const NAV_MORE = [
  { to: '/dashboard/servicios', label: 'Servicios', icon: WrenchIcon },
  { to: '/dashboard/presupuestos', label: 'Presupuestos', icon: FileTextIcon },
  { to: '/dashboard/galeria', label: 'Galería', icon: ImageIcon },
  { to: '/dashboard/resenas', label: 'Reseñas', icon: StarIcon },
  { to: '/dashboard/contenido', label: 'Contenido del sitio', icon: TextIcon },
];

/** Shell del dashboard: topbar + sidebar desktop + bottom drawer movil. */
export function DashboardLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const name = user?.user_metadata?.full_name as string | undefined;
  const initials = (name ?? 'MO').slice(0, 2).toUpperCase();
  const isDark = useTheme((s) => s.theme) === 'dark';
  const brandTone = isDark ? 'onLight' : 'onDark';

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-fixed dark:border-black/10 dark:bg-white">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-4 md:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Riva Bike, ir al inicio"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <BrandMark className="h-8 w-auto" tone={brandTone} />
            <BrandWordmark tone={brandTone} />
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden pr-1 text-right leading-snug md:block">
              <p className="text-[10px] font-black uppercase tracking-[1.6px] text-cream dark:text-black">
                Tu libertad
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-pink">
                sobre ruedas
              </p>
            </div>
            <ThemeToggle className="text-on-ink-fixed dark:text-black" />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-pill border-2 border-white/35 px-4 text-sm font-semibold text-on-ink-fixed transition-colors hover:border-pink hover:text-pink dark:border-black/30 dark:text-black dark:hover:border-pink dark:hover:text-pink"
            >
              <LogoutIcon size={17} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px]">
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[264px] shrink-0 flex-col justify-between border-r border-line py-4 pr-4 md:flex">
          <nav className="flex flex-col gap-1" aria-label="Panel">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-card px-3 py-2.5 text-[14.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--accent-soft)] font-semibold text-pink-deep'
                      : 'text-muted hover:bg-[var(--surface-2)] hover:text-ink',
                  )
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5 border-t border-line pt-4">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--surface-2)] text-sm font-semibold text-ink">
              {initials}
            </span>
            <div>
              <div className="text-[13px] font-semibold text-ink">{name ?? 'Dueño del taller'}</div>
              <div className="text-[11px] text-muted">Cuenta principal</div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 pb-[96px] md:px-8 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav movil: 2 + FAB + 2 + Mas */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-fixed md:hidden dark:border-black/10 dark:bg-white"
        aria-label="Panel móvil"
      >
        <div className="flex items-stretch justify-between px-3 py-2">
          {NAV_BOTTOM.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 rounded-card px-2 py-2 text-[10.5px] font-semibold transition-colors',
                  isActive
                    ? 'text-pink'
                    : 'text-on-ink-fixed dark:text-black/55',
                )
              }
            >
              <item.icon size={22} />
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => navigate(NAV_FAB.to)}
            aria-label="Nueva orden"
            className="mx-1 -mt-6 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-card bg-pink-deep text-paper shadow-soft transition-transform active:scale-95"
          >
            <PlusIcon size={26} />
          </button>

          {NAV_RIGHT.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 rounded-card px-2 py-2 text-[10.5px] font-semibold transition-colors',
                  isActive
                    ? 'text-pink'
                    : 'text-on-ink-fixed dark:text-black/55',
                )
              }
            >
              <item.icon size={22} />
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="Más opciones"
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-card px-2 py-2 text-[10.5px] font-semibold text-on-ink-fixed transition-colors hover:text-pink dark:text-black/55 dark:hover:text-pink"
          >
            <DotsIcon size={22} />
            Más
          </button>
        </div>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Más">
        <div className="flex flex-col gap-1">
          {NAV_MORE.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-card px-3 py-3 text-[14.5px] font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--accent-soft)] font-semibold text-pink-deep'
                    : 'text-ink hover:bg-[var(--surface-2)]',
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </Modal>
    </div>
  );
}
