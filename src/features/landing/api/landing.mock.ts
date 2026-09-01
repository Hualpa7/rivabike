import type { GoogleReviewsSummary } from '@/types';
import { clone, delay } from '@/lib/mock/helpers';

// Resumen de reseñas de Google (consistentes con el rating del hero de la
// landing: 4.8/5, 63 reseñas). Las tres reviews de ejemplo reproducen los
// testimonios del contrato visual.
export async function getGoogleReviews(): Promise<GoogleReviewsSummary> {
  await delay();
  const summary: GoogleReviewsSummary = {
    rating: 4.8,
    total_reviews: 63,
    reviews: [
      {
        author_name: 'Matías R.',
        author_url: null,
        profile_photo_url: null,
        rating: 5,
        text: 'Llevé la bici con los cambios hechos un desastre y me la dejaron perfecta. Me explicaron todo y encima me avisaron por WhatsApp apenas estuvo lista.',
        relative_time_description: 'hace 2 semanas',
      },
      {
        author_name: 'Carolina G.',
        author_url: null,
        profile_photo_url: null,
        rating: 5,
        text: 'Trabajo prolijo y precio justo. Pedí un service completo y la bici volvió andando mejor que cuando la compré.',
        relative_time_description: 'hace 1 mes',
      },
      {
        author_name: 'Facundo L.',
        author_url: null,
        profile_photo_url: null,
        rating: 5,
        text: 'Me armaron una bici nueva y quedó impecable. Se nota que saben del tema y ponen atención a los detalles.',
        relative_time_description: 'hace 1 mes',
      },
    ],
  };
  return clone(summary);
}
