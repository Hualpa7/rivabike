import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'motion/react';
import { Toaster } from 'sonner';
import { router } from '@/app/router';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Carga perezosa de las funciones de animación (domAnimation): los
        componentes `m.*` (motion/react-m) comparten este proveedor único. */}
    <LazyMotion features={domAnimation}>
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </QueryProvider>
    </LazyMotion>
  </React.StrictMode>,
);
