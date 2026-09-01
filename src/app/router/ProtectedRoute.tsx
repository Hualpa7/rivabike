import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

/**
 * Gate de UI para /dashboard/**. Esto es solo UX (evita el parpadeo de
 * contenido privado); la autorizacion real vive en RLS/Postgres, nunca
 * confiar unicamente en este componente.
 */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <span className="text-sm text-ink/60">Cargando...</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
