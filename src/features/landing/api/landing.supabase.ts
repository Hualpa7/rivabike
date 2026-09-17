import { supabase } from '@/lib/supabase/client';
import { resolveStoredPath } from '@/lib/supabase/storage';
import type { CustomerReviewWithPhotos } from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

export async function getApprovedCustomerReviews(): Promise<CustomerReviewWithPhotos[]> {
  const { data: reviews, error } = await db()
    .from('customer_reviews')
    .select('id,user_id,nombre_visible,rating,texto,motivo_rechazo,reviewed_by,reviewed_at,created_at,updated_at')
    .eq('estado', 'aprobada')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!reviews || reviews.length === 0) return [];

  const ids = reviews.map((r) => r.id);
  const { data: photos, error: photoError } = await db()
    .from('customer_review_photos')
    .select('id,review_id,storage_path,orden,created_at')
    .in('review_id', ids)
    .order('orden', { ascending: true });
  if (photoError) throw photoError;

  const grouped = new Map<string, Array<typeof photos[number]>>();
  for (const p of photos ?? []) {
    const list = grouped.get(p.review_id) ?? [];
    list.push(p);
    grouped.set(p.review_id, list);
  }

  const result: CustomerReviewWithPhotos[] = [];
  for (const r of reviews) {
    const list = (grouped.get(r.id) ?? []).sort((a, b) => a.orden - b.orden);
    const resolved = await Promise.all(
      list.map(async (p) => ({
        id: p.id,
        review_id: p.review_id,
        storage_path: await resolveStoredPath('customer-review-photos', p.storage_path),
        orden: p.orden,
        created_at: p.created_at,
      })),
    );
    result.push({
      id: r.id,
      user_id: r.user_id,
      nombre_visible: r.nombre_visible,
      rating: Number(r.rating),
      texto: r.texto,
      estado: 'aprobada',
      motivo_rechazo: r.motivo_rechazo,
      reviewed_by: r.reviewed_by,
      reviewed_at: r.reviewed_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
      photos: resolved,
    });
  }
  return result;
}
