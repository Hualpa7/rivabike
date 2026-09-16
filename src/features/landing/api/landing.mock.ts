import type { CustomerReviewWithPhotos } from '@/types';
import { clone, delay } from '@/lib/mock/helpers';

const BASE = '2026-08-20T12:00:00.000Z';

// Reseñas propias aprobadas (moderadas) para la seccion de opiniones.
export async function getApprovedCustomerReviews(): Promise<CustomerReviewWithPhotos[]> {
  await delay();
  const reviews: CustomerReviewWithPhotos[] = [
    {
      id: 'gal-rev-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      nombre_visible: 'Carolina G.',
      rating: 5,
      texto:
        'Trabajo prolijo y precio justo. Pedí un service completo y la bici volvió andando mejor que cuando la compré.',
      estado: 'aprobada',
      motivo_rechazo: null,
      reviewed_by: 'staff-1',
      reviewed_at: BASE,
      created_at: BASE,
      updated_at: BASE,
      photos: [
        {
          id: 'gal-rev-1-p0',
          review_id: 'gal-rev-1',
          storage_path:
            'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
          orden: 0,
          created_at: BASE,
        },
      ],
    },
    {
      id: 'gal-rev-2',
      user_id: '00000000-0000-0000-0000-000000000002',
      nombre_visible: 'Sofía T.',
      rating: 4,
      texto:
        'Excelente atención y muy buena comunicación. El trabajo quedó perfecto, solo tuve que esperar un poco más de lo previsto por el fin de semana largo.',
      estado: 'aprobada',
      motivo_rechazo: null,
      reviewed_by: 'staff-1',
      reviewed_at: BASE,
      created_at: BASE,
      updated_at: BASE,
      photos: [],
    },
  ];
  return clone(reviews);
}
