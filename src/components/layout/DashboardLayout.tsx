import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/features/auth/store';
import { signOut } from '@/features/auth/api';
import {
  DashboardIcon,
  WrenchIcon,
  BoxIcon,
  TicketIcon,
  ImageIcon,
  TextIcon,
  GearIcon,
  LogoutIcon,
  PlusIcon,
} from '@/components/ui/icons';

const NAV = [
  { to: '/dashboard/inicio', label: 'Inicio', icon: DashboardIcon },
  { to: '/dashboard/servicios', label: 'Servicios', icon: WrenchIcon },
  { to: '/dashboard/inventario', label: 'Inventario', icon: BoxIcon },
  { to: '/dashboard/ordenes', label: 'Órdenes', icon: TicketIcon },
  { to: '/dashboard/galeria', label: 'Galería', icon: ImageIcon },
  { to: '/dashboard/contenido', label: 'Contenido del sitio', icon: TextIcon },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: GearIcon },
];

/** Shell del dashboard: topbar + sidebar desktop + bottom drawer movil. */
export function DashboardLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const name = user?.user_metadata?.full_name as string | undefined;
  const initials = (name ?? 'MO').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur-md md:px-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard/inicio')}
          aria-label="Riva Bike, volver al inicio"
          className="font-display text-[21px] font-bold tracking-[-0.02em] text-ink"
        >
          Riva<span className="text-pink-deep">.</span>Bike
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-pill border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-pink-deep hover:text-pink-deep"
        >
          <LogoutIcon size={17} />
          Cerrar sesión
        </button>
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
          <div className="flex items-center justify-between border-t border-line pt-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--surface-2)] text-sm font-semibold text-ink">
                {initials}
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink">{name ?? 'Dueño del taller'}</div>
                <div className="text-[11px] text-muted">Cuenta principal</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 pb-[84px] md:px-8 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom drawer movil */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/90 backdrop-blur-md md:hidden"
        aria-label="Panel móvil"
      >
        <div className="flex items-center gap-3 overflow-x-auto px-3 py-2">
          {NAV.slice(0, 6).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 flex-col items-center gap-1 rounded-card px-3 py-2 text-[10.5px] font-semibold transition-colors',
                  isActive ? 'text-pink-deep' : 'text-muted',
                )
              }
            >
              <item.icon size={22} />
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => navigate('/dashboard/ordenes/nueva')}
            aria-label="Nueva orden"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-card bg-pink-deep text-paper shadow-soft"
          >
            <PlusIcon size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
}
