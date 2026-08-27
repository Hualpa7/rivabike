import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold">Página no encontrada</h1>
      <Link to="/" className="text-sm underline underline-offset-4 hover:text-pink-deep">
        Volver al inicio
      </Link>
    </main>
  );
}
