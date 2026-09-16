import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CustomerReview,
  CustomerReviewPhoto,
  CustomerReviewWithPhotos,
  DeleteCustomerReviewInput,
  ModerateCustomerReviewInput,
  NewCustomerReviewInput,
  UpdateCustomerReviewInput,
} from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './reviews.mock';
import * as real from './reviews.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const listApprovedFn = useMocks ? mock.listApprovedCustomerReviews : real.listApprovedCustomerReviews;
const listMyFn = useMocks ? mock.listMyCustomerReviews : real.listMyCustomerReviews;
const listAdminFn = useMocks ? mock.listCustomerReviewsAdmin : real.listCustomerReviewsAdmin;
const createFn = useMocks ? mock.createCustomerReview : real.createCustomerReview;
const updateFn = useMocks ? mock.updateCustomerReview : real.updateCustomerReview;
const uploadPhotoFn = useMocks ? mock.uploadCustomerReviewPhoto : real.uploadCustomerReviewPhoto;
const deletePhotoFn = useMocks ? mock.deleteCustomerReviewPhoto : real.deleteCustomerReviewPhoto;
const moderateFn = useMocks ? mock.moderateCustomerReview : real.moderateCustomerReview;
const deleteFn = useMocks ? mock.deleteCustomerReview : real.deleteCustomerReview;

/** Publico: reseñas aprobadas para la landing. */
export function useApprovedCustomerReviews() {
  return useQuery<CustomerReviewWithPhotos[]>({
    queryKey: ['reviews', 'approved'],
    queryFn: () => listApprovedFn(),
  });
}

/** Requiere sesión (cualquier usuario, no hace falta ser staff). */
export function useMyCustomerReviews() {
  const status = useAuthStore((s) => s.status);
  return useQuery<CustomerReviewWithPhotos[]>({
    queryKey: ['reviews', 'mine'],
    queryFn: () => listMyFn(),
    enabled: status === 'authenticated',
  });
}

export function useCreateCustomerReview() {
  const qc = useQueryClient();
  return useMutation<CustomerReview, Error, NewCustomerReviewInput>({
    mutationFn: (input) => createFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reviews', 'mine'] });
      void qc.invalidateQueries({ queryKey: ['reviews', 'approved'] });
    },
  });
}

export function useUpdateCustomerReview() {
  const qc = useQueryClient();
  return useMutation<CustomerReview, Error, UpdateCustomerReviewInput>({
    mutationFn: (input) => updateFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reviews', 'mine'] });
      void qc.invalidateQueries({ queryKey: ['reviews', 'admin'] });
    },
  });
}

export function useUploadCustomerReviewPhoto() {
  const qc = useQueryClient();
  return useMutation<CustomerReviewPhoto, Error, { reviewId: string; file: File }>({
    mutationFn: ({ reviewId, file }) => uploadPhotoFn({ reviewId, file }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteCustomerReviewPhoto() {
  const qc = useQueryClient();
  return useMutation<void, Error, { photoId: string; storagePath: string }>({
    mutationFn: ({ photoId, storagePath }) => deletePhotoFn({ photoId, storagePath }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reviews', 'mine'] });
      void qc.invalidateQueries({ queryKey: ['reviews', 'admin'] });
      void qc.invalidateQueries({ queryKey: ['reviews', 'approved'] });
    },
  });
}

/** Privado de staff: el dashboard exige isStaff, no solo sesion. */
export function useCustomerReviewsAdmin(params?: { estado?: CustomerReview['estado'] }) {
  const status = useAuthStore((s) => s.status);
  const isStaff = useAuthStore((s) => s.isStaff);
  return useQuery<CustomerReviewWithPhotos[]>({
    queryKey: ['reviews', 'admin', params?.estado ?? 'all'],
    queryFn: () => listAdminFn(params),
    enabled: status === 'authenticated' && isStaff,
  });
}

export function useModerateCustomerReview() {
  const qc = useQueryClient();
  return useMutation<CustomerReview, Error, ModerateCustomerReviewInput>({
    mutationFn: (input) => moderateFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteCustomerReviewAdmin() {
  const qc = useQueryClient();
  return useMutation<
    { deletedReviewId: string; storagePaths: string[] },
    Error,
    DeleteCustomerReviewInput
  >({
    mutationFn: (input) => deleteFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
