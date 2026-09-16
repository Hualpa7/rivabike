import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DejarResenaPage } from '@/pages/DejarResenaPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import {
  InicioPage,
  DashboardIndexRedirect,
  ServiciosPage,
  InventarioPage,
  OrdenesPage,
  NuevaOrdenPage,
  OrdenDetallePage,
  PresupuestosPage,
  NuevaPresupuestoPage,
  PresupuestoDetallePage,
  GaleriaPage,
  ResenasPage,
  ContenidoPage,
} from '@/pages/dashboard';

export const router = createBrowserRouter([
  // La landing vive afuera de PublicLayout para no montar PublicNav
  // junto con LandingNav (doble barra al hacer scroll).
  { path: '/', element: <LandingPage /> },
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/olvide-password', element: <ForgotPasswordPage /> },
      { path: '/dejar-resena', element: <DejarResenaPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardIndexRedirect /> },
          { path: 'inicio', element: <InicioPage /> },
          { path: 'servicios', element: <ServiciosPage /> },
          { path: 'inventario', element: <InventarioPage /> },
          { path: 'ordenes', element: <OrdenesPage /> },
          { path: 'ordenes/nueva', element: <NuevaOrdenPage /> },
          { path: 'ordenes/:id', element: <OrdenDetallePage /> },
          { path: 'presupuestos', element: <PresupuestosPage /> },
          { path: 'presupuestos/nueva', element: <NuevaPresupuestoPage /> },
          { path: 'presupuestos/:id', element: <PresupuestoDetallePage /> },
          { path: 'galeria', element: <GaleriaPage /> },
          { path: 'resenas', element: <ResenasPage /> },
          { path: 'contenido', element: <ContenidoPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
