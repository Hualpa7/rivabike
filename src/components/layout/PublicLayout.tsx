import { Outlet } from 'react-router-dom';

/**
 * Layout de las rutas publicas (landing, login). El header/footer
 * definitivos de la landing se implementan en features/landing siguiendo
 * docs/design-references.md; esto es solo el contenedor de ruteo.
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Outlet />
    </div>
  );
}
