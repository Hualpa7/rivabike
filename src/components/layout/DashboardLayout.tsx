import { Outlet } from 'react-router-dom';

/**
 * Shell del dashboard privado: navbar/sidebar responsive segun AGENT.md
 * seccion 23. Placeholder minimo por ahora; el detalle de navegacion se
 * construye en la fase de dashboard.
 */
export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-ink px-4 py-3 text-paper md:px-6">
        <span className="text-sm font-semibold uppercase tracking-widest text-pink">
          Riva Bike · Panel
        </span>
      </header>
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
