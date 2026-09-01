import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import {
  InicioPage,
  DashboardIndexRedirect,
  ServiciosPage,
  InventarioPage,
  OrdenesPage,
  NuevaOrdenPage,
  OrdenDetallePage,
  GaleriaPage,
  ContenidoPage,
  ConfiguracionPage,
} from '@/pages/dashboard';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/olvide-password', element: <ForgotPasswordPage /> },
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
          { path: 'galeria', element: <GaleriaPage /> },
          { path: 'contenido', element: <ContenidoPage /> },
          { path: 'configuracion', element: <ConfiguracionPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
