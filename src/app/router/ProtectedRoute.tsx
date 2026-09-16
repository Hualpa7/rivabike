import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { PageLoader } from '@/components/ui/PageLoader';

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const isStaff = useAuthStore((s) => s.isStaff);
  const isStaffResolved = useAuthStore((s) => s.isStaffResolved);
  const location = useLocation();

  if (status === 'loading' || (status === 'authenticated' && !isStaffResolved)) {
    return <PageLoader />; // Full-screen bike-wheel spinner (espera a resolver isStaff)
  }

  // No alcanza con "hay sesion": un usuario que solo dejo una resena con
  // OAuth tambien tiene status 'authenticated' pero NO es staff.
  if (status !== 'authenticated' || !isStaff) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

