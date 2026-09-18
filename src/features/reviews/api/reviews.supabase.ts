import { supabase } from '@/lib/supabase/client';
import { resolveStoredPath, toWebp, variantPath } from '@/lib/supabase/storage';
import type {
  CustomerReview,
  CustomerReviewPhoto,
  CustomerReviewWithPhotos,
  DeleteCustomerReviewInput,
  ModerateCustomerReviewInput,
  NewCustomerReviewInput,
  UpdateCustomerReviewInput,
} from '@/types';

const BUCKET = 'customer-review-photos';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type ReviewRow = {
  id: string;
  user_id: string;
  nombre_visible: string;
  rating: number;
  texto: string;
  estado: string;
  motivo_rechazo: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type PhotoRow = {
  id: string;
  review_id: string;
  storage_path: string;
  orden: number;
  created_at: string;
};

function toCustomerReview(row: ReviewRow): CustomerReview {
  return {
    id: row.id,
    user_id: row.user_id,
    nombre_visible: row.nombre_visible,
    rating: Number(row.rating),
    texto: row.texto,
    estado: row.estado as CustomerReview['estado'],
    motivo_rechazo: row.motivo_rechazo,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function toPhoto(row: PhotoRow): Promise<CustomerReviewPhoto> {
  return {
    id: row.id,
    review_id: row.review_id,
    storage_path: await resolveStoredPath(BUCKET, row.storage_path),
    orden: row.orden,
    created_at: row.created_at,
  };
}

/** Agrupa las fotos de varias reseñas por review_id y las resuelve a URL. */
async function attachPhotos(rows: ReviewRow[]): Promise<CustomerReviewWithPhotos[]> {
  if (rows.length === 0) return [];
  const reviews = rows.map(toCustomerReview);
  const ids = reviews.map((r) => r.id);
  const { data, error } = await db()
    .from('customer_review_photos')
    .select('*')
    .in('review_id', ids)
    .order('orden', { ascending: true });
  if (error) throw error;

  const grouped = new Map<string, CustomerReviewPhoto[]>();
  const sorted = (data ?? []).sort((a, b) => a.orden - b.orden);
  // Resoluciones independientes en paralelo (se conserva el orden).
  const resolved = await Promise.all(sorted.map((p) => toPhoto(p)));
  for (const photo of resolved) {
    const list = grouped.get(photo.review_id) ?? [];
    list.push(photo);
    grouped.set(photo.review_id, list);
  }

  return reviews.map((r) => ({ ...r, photos: grouped.get(r.id) ?? [] }));
}

export async function listApprovedCustomerReviews(): Promise<CustomerReviewWithPhotos[]> {
  const { data, error } = await db()
    .from('customer_reviews')
    .select('*')
    .eq('estado', 'aprobada')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return attachPhotos((data ?? []) as ReviewRow[]);
}

export async function listMyCustomerReviews(): Promise<CustomerReviewWithPhotos[]> {
  const { data: authData } = await db().auth.getUser();
  const userId = authData?.user?.id;
  let query = db().from('customer_reviews').select('*').order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return attachPhotos((data ?? []) as ReviewRow[]);
}

export async function listCustomerReviewsAdmin(params?: {
  estado?: CustomerReview['estado'];
}): Promise<CustomerReviewWithPhotos[]> {
  let query = db().from('customer_reviews').select('*').order('created_at', { ascending: false });
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query;
  if (error) throw error;
  return attachPhotos((data ?? []) as ReviewRow[]);
}

export async function createCustomerReview(input: NewCustomerReviewInput): Promise<CustomerReview> {
  const { data, error } = await db().rpc('create_customer_review', {
    p_nombre_visible: input.nombre_visible,
    p_rating: input.rating,
    p_texto: input.texto,
  });
  if (error) throw error;
  return toCustomerReview(data as ReviewRow);
}

export async function updateCustomerReview(
  input: UpdateCustomerReviewInput,
): Promise<CustomerReview> {
  const { data, error } = await db().rpc('update_customer_review', {
    p_review_id: input.review_id,
    p_nombre_visible: input.nombre_visible,
    p_rating: input.rating,
    p_texto: input.texto,
  });
  if (error) throw error;
  return toCustomerReview(data as ReviewRow);
}

export async function uploadCustomerReviewPhoto(input: {
  reviewId: string;
  file: File;
}): Promise<CustomerReviewPhoto> {
  const { data: authData } = await db().auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error('No hay sesión iniciada');

  const webp = await toWebp(input.file, { maxDimension: 1200, quality: 0.82 });
  const storagePath = `${userId}/${Date.now()}-${webp.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error: uploadError } = await db()
    .storage.from(BUCKET)
    .upload(storagePath, webp, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;
  const smPath = variantPath(storagePath, '-sm');
  const thumb = await toWebp(input.file, { maxDimension: 480, quality: 0.8 });
  const { error: thumbError } = await db()
    .storage.from(BUCKET)
    .upload(smPath, thumb, { cacheControl: '3600', upsert: false });
  if (thumbError) throw thumbError;

  const { data: existing } = await db()
    .from('customer_review_photos')
    .select('orden')
    .eq('review_id', input.reviewId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle();
  const orden = existing ? existing.orden + 1 : 0;

  const { data, error } = await db()
    .from('customer_review_photos')
    .insert({ review_id: input.reviewId, storage_path: storagePath, orden })
    .select('*')
    .single();
  if (error) {
    await db().storage.from(BUCKET).remove([storagePath]);
    throw error;
  }
  return toPhoto(data as PhotoRow);
}

export async function deleteCustomerReviewPhoto(input: {
  photoId: string;
  storagePath: string;
}): Promise<void> {
  const { error: storageError } = await db()
    .storage.from(BUCKET)
    .remove([input.storagePath, variantPath(input.storagePath, '-sm')]);
  if (storageError) throw storageError;
  const { error } = await db()
    .from('customer_review_photos')
    .delete()
    .eq('id', input.photoId);
  if (error) throw error;
}

export async function moderateCustomerReview(
  input: ModerateCustomerReviewInput,
): Promise<CustomerReview> {
  const { data, error } = await db().rpc('moderate_customer_review', {
    p_review_id: input.reviewId,
    p_new_estado: input.newEstado,
    p_motivo_rechazo: input.motivoRechazo,
  });
  if (error) throw error;
  return toCustomerReview(data as ReviewRow);
}

export async function deleteCustomerReview(
  input: DeleteCustomerReviewInput,
): Promise<{ deletedReviewId: string; storagePaths: string[] }> {
  const { data, error } = await db().rpc('delete_customer_review', {
    p_review_id: input.reviewId,
  });
  if (error) throw error;

  const result = data as unknown as {
    deleted_review_id?: string;
    storage_paths?: string[];
    deletedReviewId?: string;
    storagePaths?: string[];
  };
  const storagePaths = result.storage_paths ?? result.storagePaths ?? [];
  if (storagePaths.length > 0) {
    const allPaths = storagePaths.flatMap((p) => [p, variantPath(p, '-sm')]);
    await db().storage.from(BUCKET).remove(allPaths);
  }
  return {
    deletedReviewId: result.deleted_review_id ?? result.deletedReviewId ?? input.reviewId,
    storagePaths,
  };
}
