import { useNavigate } from 'react-router-dom';
import type { OAuthProvider } from '@/features/auth/api';
import { signInWithOAuth } from '@/features/auth/api';
import { Button } from '@/components/ui';

const PROVIDERS: { id: OAuthProvider; label: string }[] = [
  { id: 'google', label: 'Continuar con Google' },
];

/** Botones de inicio de sesión con OAuth (Google). */
export function OAuthButtons() {
  const navigate = useNavigate();

  const handle = async (provider: OAuthProvider) => {
    const { error } = await signInWithOAuth(provider);
    if (error) {
      // Si error, volvemos a la página para mostrar el mensaje genérico.
      console.error('OAuth error', error);
      navigate('/dejar-resena');
    }
  };

  return (
    <div className="space-y-3">
      {PROVIDERS.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="secondary"
          block
          onClick={() => handle(p.id)}
        >
          {p.label}
        </Button>
      ))}
      <p className="text-center text-xs text-muted">
        Al continuar, aceptás que tus datos de la cuenta se usen únicamente para
        mostrar tu reseña en nuestro sitio.
      </p>
    </div>
  );
}
