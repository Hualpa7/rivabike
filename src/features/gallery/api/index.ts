import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  GalleryImage,
  GalleryItemWithImages,
  NewGalleryItemInput,
  UpdateGalleryItemInput,
} from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './gallery.mock';
import * as real from './gallery.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const listGalleryItemsFn = useMocks ? mock.listGalleryItems : real.listGalleryItems;
const listGalleryItemsAdminFn = useMocks ? mock.listGalleryItemsAdmin : real.listGalleryItemsAdmin;
const createGalleryItemFn = useMocks ? mock.createGalleryItem : real.createGalleryItem;
const updateGalleryItemFn = useMocks ? mock.updateGalleryItem : real.updateGalleryItem;
const reorderGalleryItemsFn = useMocks ? mock.reorderGalleryItems : real.reorderGalleryItems;
const uploadGalleryImagesFn = useMocks ? mock.uploadGalleryImages : real.uploadGalleryImages;
const deleteGalleryImageFn = useMocks ? mock.deleteGalleryImage : real.deleteGalleryImage;

/** Publico: galeria de la landing (solo publicados). */
export function useGalleryItems(params?: { onlyPublished?: boolean }) {
  return useQuery({
    queryKey: ['gallery', 'public', params?.onlyPublished ?? false],
    queryFn: () => listGalleryItemsFn(params),
  });
}

/** Privado: catalogo completo de galeria (dashboard). */
export function useGalleryItemsAdmin() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['gallery', 'admin'],
    queryFn: () => listGalleryItemsAdminFn(),
    enabled: status === 'authenticated',
  });
}

export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation<GalleryItemWithImages, Error, NewGalleryItemInput>({
    mutationFn: (input) => createGalleryItemFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient();
  return useMutation<GalleryItemWithImages, Error, UpdateGalleryItemInput>({
    mutationFn: (input) => updateGalleryItemFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useReorderGalleryItems() {
  const qc = useQueryClient();
  return useMutation<void, Error, { orderedIds: string[] }>({
    mutationFn: ({ orderedIds }) => reorderGalleryItemsFn({ orderedIds }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useUploadGalleryImages() {
  const qc = useQueryClient();
  return useMutation<
    GalleryImage[],
    Error,
    { galleryItemId: string; files: File[]; tipos?: Array<'antes' | 'despues'> }
  >({
    mutationFn: ({ galleryItemId, files, tipos }) => uploadGalleryImagesFn({ galleryItemId, files, tipos }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => deleteGalleryImageFn({ id }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}
