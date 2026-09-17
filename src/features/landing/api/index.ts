import { useQuery } from '@tanstack/react-query';
import type { CustomerReviewWithPhotos } from '@/types';
import * as mock from './landing.mock';
import * as real from './landing.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const getApprovedCustomerReviewsFn = useMocks
  ? mock.getApprovedCustomerReviews
  : real.getApprovedCustomerReviews;

/** Reseñas propias aprobadas (moderadas) para la seccion de opiniones. */
export function useApprovedCustomerReviews() {
  return useQuery<CustomerReviewWithPhotos[]>({
    queryKey: ['reviews', 'approved'],
    queryFn: () => getApprovedCustomerReviewsFn(),
    staleTime: 60_000,
  });
}
