import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { signOut } from '@/features/auth/api';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { OAuthButtons, ReviewForm, MyReviews } from '@/features/reviews/components';
import { useMyCustomerReviews } from '@/features/reviews/api';
import { Button } from '@/components/ui';
import { LogoutIcon, StarIcon } from '@/components/ui/icons';
import type { CustomerReviewWithPhotos } from '@/types';

/**
 * Página pública para dejar una reseña. Sin sesión: botones OAuth.
 * Con sesión: "Mis reseñas" + formulario para crear/editar.
 */
export function DejarResenaPage() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const { data } = useMyCustomerReviews();
  const [editing, setEditing] = useState<CustomerReviewWithPhotos | null>(null);
  const [creating, setCreating] = useState(false);

  const reviews = data ?? [];
  const pendingCount = reviews.filter((r) => r.estado === 'pendiente').length;
  const atLimit = pendingCount >= 5;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <AuthLayout
      eyebrow="Opiniones · Tu reseña"
      title={status === 'authenticated' ? 'Contanos tu experiencia' : 'Dejá tu reseña'}
      subtitle={
        status === 'authenticated'
          ? 'Contanos cómo te fue en Riva Bike. Tu opinión nos ayuda a mejorar.'
          : 'Iniciá sesión con tu cuenta para dejar una reseña y mostrar tu opinión.'
      }
      pitchTitle="Tu opinión nos motiva."
      pitchText="Compartí tu experiencia en el taller con fotos de tu bici. Las reseñas aprobadas aparecen en la sección Opiniones de nuestra página."
      backHref="/#opiniones"
      backLabel="Volver a las opiniones"
    >
      {status === 'authenticated' ? (
        <div className="w-full space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)] text-sm font-semibold text-ink">
                {(user?.user_metadata?.full_name as string | undefined)?.charAt(0) ?? 'U'}
              </span>
              <span className="truncate text-sm font-semibold text-ink">
                {(user?.user_metadata?.full_name as string | undefined) ?? 'Tu cuenta'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-pink-deep"
            >
              <LogoutIcon size={15} />
              Cerrar sesión
            </button>
          </div>

          {!editing && !creating ? (
            <>
              <MyReviews onEdit={setEditing} />

              <div className="border-t border-line pt-5">
                <Button
                  type="button"
                  variant="primary"
                  block
                  onClick={() => setCreating(true)}
                  disabled={atLimit}
                >
                  Escribir nueva reseña
                </Button>
                {atLimit ? (
                  <p className="mt-2 text-center text-xs text-muted">
                    Ya tenés 5 reseñas esperando revisión — esperá a que se revisen antes de escribir otra.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="rounded-card border border-line bg-paper p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <StarIcon size={18} className="text-gold" />
                  {editing ? 'Editar reseña' : 'Nueva reseña'}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setCreating(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
              <ReviewForm
                key={editing?.id ?? 'create'}
                review={editing}
                onDone={() => {
                  setEditing(null);
                  setCreating(false);
                }}
                createDisabled={atLimit && !editing}
                createDisabledReason="Ya tenés 5 reseñas esperando revisión."
              />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          <OAuthButtons />
          <p className="mt-6 text-center text-xs text-muted">
            ¿Sos del equipo?{' '}
            <Link to="/login" className="font-medium text-pink-deep hover:underline">
              Ingresá al panel
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
