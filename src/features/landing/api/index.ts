import { useQuery } from '@tanstack/react-query';
import type { GoogleReviewsSummary } from '@/types';
import * as mock from './landing.mock';
import * as real from './landing.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const getGoogleReviewsFn = useMocks ? mock.getGoogleReviews : real.getGoogleReviews;

/** Reseñas de Google (hero y seccion de opiniones de la landing). */
export function useGoogleReviews() {
  return useQuery<GoogleReviewsSummary>({
    queryKey: ['google', 'reviews'],
    queryFn: () => getGoogleReviewsFn(),
  });
}
