import type {
  CustomerReview,
  CustomerReviewPhoto,
  CustomerReviewWithPhotos,
  DeleteCustomerReviewInput,
  ModerateCustomerReviewInput,
  NewCustomerReviewInput,
  UpdateCustomerReviewInput,
} from '@/types';
import { clone, delay, uid } from '@/lib/mock/helpers';

const BASE = '2026-08-20T12:00:00.000Z';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

function photo(partial: Pick<CustomerReviewPhoto, 'id' | 'review_id' | 'storage_path' | 'orden'>): CustomerReviewPhoto {
  return { ...partial, created_at: BASE };
}

function review(
  partial: Partial<CustomerReview> & Pick<CustomerReview, 'id' | 'nombre_visible' | 'rating' | 'texto' | 'estado'>,
  photos: CustomerReviewPhoto[] = [],
): CustomerReviewWithPhotos {
  return {
    user_id: MOCK_USER_ID,
    motivo_rechazo: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: BASE,
    updated_at: BASE,
    photos,
    ...partial,
  };
}

// Semilla de reseñas de ejemplo (consistentes con la seccion de opiniones de
// la landing y los testimonios de Google).
let REVIEWS: CustomerReviewWithPhotos[] = [
  review(
    {
      id: 'rev-carolina',
      nombre_visible: 'Carolina G.',
      rating: 5,
      texto:
        'Trabajo prolijo y precio justo. Pedí un service completo y la bici volvió andando mejor que cuando la compré. Muy recomendables.',
      estado: 'aprobada',
      reviewed_by: 'staff-1',
      reviewed_at: BASE,
    },
    [photo({ id: 'rev-carolina-p0', review_id: 'rev-carolina', storage_path: `${MOCK_USER_ID}/carolina-1.jpg`, orden: 0 })],
  ),
  review(
    {
      id: 'rev-facundo',
      nombre_visible: 'Facundo L.',
      rating: 5,
      texto:
        'Me armaron una bici nueva y quedó impecable. Se nota que saben del tema y ponen atención a los detalles.',
      estado: 'aprobada',
      reviewed_by: 'staff-1',
      reviewed_at: BASE,
    },
  ),
  review(
    {
      id: 'rev-mati',
      nombre_visible: 'Matías R.',
      rating: 5,
      texto:
        'Llevé la bici con los cambios hechos un desastre y me la dejaron perfecta. Me explicaron todo y encima me avisaron por WhatsApp apenas estuvo lista.',
      estado: 'pendiente',
    },
  ),
  review({
    id: 'rev-pendiente-mia',
    nombre_visible: 'Martina S.',
    rating: 4,
    texto: 'Muy buen servicio, aunque tuve que esperar un poco más de lo previsto. Igual el trabajo quedó 10 puntos.',
    estado: 'pendiente',
  }),
  review(
    {
      id: 'rev-rechazada',
      nombre_visible: 'Anónimo',
      rating: 1,
      texto: 'texto de ejemplo para revisión',
      estado: 'rechazada',
      motivo_rechazo: 'El texto no describe el trabajo realizado.',
    },
  ),
];

export async function listApprovedCustomerReviews(): Promise<CustomerReviewWithPhotos[]> {
  await delay();
  return clone(REVIEWS.filter((r) => r.estado === 'aprobada'));
}

export async function listMyCustomerReviews(): Promise<CustomerReviewWithPhotos[]> {
  await delay();
  // En el mock devolvemos las reseñas "del usuario": para demo, las que
  // tienen user_id = MOCK_USER_ID son las propias.
  return clone(REVIEWS.filter((r) => r.user_id === MOCK_USER_ID));
}

export async function listCustomerReviewsAdmin(params?: {
  estado?: CustomerReview['estado'];
}): Promise<CustomerReviewWithPhotos[]> {
  await delay();
  if (params?.estado) {
    return clone(REVIEWS.filter((r) => r.estado === params.estado));
  }
  return clone(REVIEWS);
}

export async function createCustomerReview(
  input: NewCustomerReviewInput,
): Promise<CustomerReview> {
  await delay();
  const created: CustomerReviewWithPhotos = review({
    id: uid(),
    nombre_visible: input.nombre_visible,
    rating: input.rating,
    texto: input.texto,
    estado: 'pendiente',
  });
  REVIEWS = [created, ...REVIEWS];
  return clone(created);
}

export async function updateCustomerReview(
  input: UpdateCustomerReviewInput,
): Promise<CustomerReview> {
  await delay();
  const idx = REVIEWS.findIndex((r) => r.id === input.review_id);
  if (idx === -1) throw new Error('Reseña no encontrada');
  const updated: CustomerReviewWithPhotos = {
    ...REVIEWS[idx],
    nombre_visible: input.nombre_visible,
    rating: input.rating,
    texto: input.texto,
    // Si estaba rechazada, vuelve a pendiente.
    estado: REVIEWS[idx].estado === 'rechazada' ? 'pendiente' : REVIEWS[idx].estado,
    motivo_rechazo: REVIEWS[idx].estado === 'rechazada' ? null : REVIEWS[idx].motivo_rechazo,
    updated_at: new Date().toISOString(),
  };
  REVIEWS = REVIEWS.map((r) => (r.id === input.review_id ? updated : r));
  return clone(updated);
}

export async function uploadCustomerReviewPhoto(input: {
  reviewId: string;
  file: File;
}): Promise<CustomerReviewPhoto> {
  await delay();
  const idx = REVIEWS.findIndex((r) => r.id === input.reviewId);
  if (idx === -1) throw new Error('Reseña no encontrada');
  const p: CustomerReviewPhoto = photo({
    id: uid(),
    review_id: input.reviewId,
    storage_path: `${MOCK_USER_ID}/${input.file.name}`,
    orden: REVIEWS[idx].photos.length,
  });
  REVIEWS = REVIEWS.map((r, i) => (i === idx ? { ...r, photos: [...r.photos, p] } : r));
  return clone(p);
}

export async function deleteCustomerReviewPhoto(input: {
  photoId: string;
  storagePath: string;
}): Promise<void> {
  await delay();
  REVIEWS = REVIEWS.map((r) => ({
    ...r,
    photos: r.photos.filter((p) => p.id !== input.photoId),
  }));
}

export async function moderateCustomerReview(
  input: ModerateCustomerReviewInput,
): Promise<CustomerReview> {
  await delay();
  const idx = REVIEWS.findIndex((r) => r.id === input.reviewId);
  if (idx === -1) throw new Error('Reseña no encontrada');
  if (input.newEstado === 'rechazada' && !input.motivoRechazo) {
    throw new Error('El motivo de rechazo es obligatorio.');
  }
  const updated: CustomerReviewWithPhotos = {
    ...REVIEWS[idx],
    estado: input.newEstado,
    motivo_rechazo: input.newEstado === 'rechazada' ? input.motivoRechazo ?? null : null,
    reviewed_by: 'staff-1',
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  REVIEWS = REVIEWS.map((r) => (r.id === input.reviewId ? updated : r));
  return clone(updated);
}

export async function deleteCustomerReview(
  input: DeleteCustomerReviewInput,
): Promise<{ deletedReviewId: string; storagePaths: string[] }> {
  await delay();
  const target = REVIEWS.find((r) => r.id === input.reviewId);
  if (!target) throw new Error('Reseña no encontrada');
  const storagePaths = target.photos.map((p) => p.storage_path);
  REVIEWS = REVIEWS.filter((r) => r.id !== input.reviewId);
  return { deletedReviewId: input.reviewId, storagePaths };
}
