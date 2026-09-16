import { Outlet } from 'react-router-dom';
import { PublicNav } from './PublicNav';

/**
 * Layout de las rutas publicas (login, forgot-password, dejar-resena, 404).
 * Incluye el navbar compartido con logo + theme toggle.
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <PublicNav />
      <Outlet />
    </div>
  );
}
