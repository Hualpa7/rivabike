import { supabase } from '@/lib/supabase/client';
import { toWebp, variantPath } from '@/lib/supabase/storage';
import type { Database } from '@/lib/supabase/types';
import type {
  GalleryImage,
  GalleryItemWithImages,
  NewGalleryItemInput,
  UpdateGalleryItemInput,
} from '@/types';

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

type GalleryRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  fecha: string | null;
  orden: number;
  publicado: boolean;
  check_1: string | null;
  check_2: string | null;
  check_3: string | null;
  check_4: string | null;
  created_at: string;
  updated_at: string;
};

function toItem(row: GalleryRow, images: GalleryImage[]): GalleryItemWithImages {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    categoria: row.categoria,
    fecha: row.fecha,
    orden: row.orden,
    publicado: row.publicado,
    check_1: row.check_1,
    check_2: row.check_2,
    check_3: row.check_3,
    check_4: row.check_4,
    created_at: row.created_at,
    updated_at: row.updated_at,
    images,
  };
}

function toGalleryImage(img: {
  id: string;
  gallery_item_id: string;
  storage_path: string;
  orden: number;
  tipo?: string | null;
}): GalleryImage {
  return {
    id: img.id,
    gallery_item_id: img.gallery_item_id,
    storage_path: toPublicGalleryUrl(img.storage_path),
    orden: img.orden,
    tipo: img.tipo === 'antes' || img.tipo === 'despues' ? img.tipo : null,
  };
}

function toPublicGalleryUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const { data } = db().storage.from('public-gallery').getPublicUrl(path);
  return data.publicUrl;
}

async function loadWithImages(items: GalleryRow[]): Promise<GalleryItemWithImages[]> {
  if (items.length === 0) return [];
  const ids = items.map((i) => i.id);
  const { data: images, error } = await db()
    .from('gallery_images')
    .select('*')
    .in('gallery_item_id', ids)
    .order('orden', { ascending: true });
  if (error) throw error;
  const byItem = new Map<string, GalleryImage[]>();
  for (const img of images ?? []) {
    const list = byItem.get(img.gallery_item_id) ?? [];
    list.push(toGalleryImage(img));
    byItem.set(img.gallery_item_id, list);
  }
  return items.map((row) => toItem(row, byItem.get(row.id) ?? []));
}

export async function listGalleryItems(params?: { onlyPublished?: boolean }): Promise<GalleryItemWithImages[]> {
  let query = db()
    .from('gallery_items')
    .select('*')
    .order('orden', { ascending: true });
  if (params?.onlyPublished) query = query.eq('publicado', true);
  const { data, error } = await query;
  if (error) throw error;
  return loadWithImages(data ?? []);
}

export async function listGalleryItemsAdmin(): Promise<GalleryItemWithImages[]> {
  const { data, error } = await db()
    .from('gallery_items')
    .select('*')
    .order('orden', { ascending: true });
  if (error) throw error;
  return loadWithImages(data ?? []);
}

export async function createGalleryItem(input: NewGalleryItemInput): Promise<GalleryItemWithImages> {
  const { data, error } = await db()
    .from('gallery_items')
    .insert({
      titulo: input.titulo,
      descripcion: input.descripcion ?? null,
      categoria: input.categoria ?? null,
      fecha: input.fecha ?? null,
      publicado: input.publicado ?? false,
      orden: 0,
      check_1: input.check_1 ?? null,
      check_2: input.check_2 ?? null,
      check_3: input.check_3 ?? null,
      check_4: input.check_4 ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return toItem(data, []);
}

export async function updateGalleryItem(input: UpdateGalleryItemInput): Promise<GalleryItemWithImages> {
  const patch: Database['public']['Tables']['gallery_items']['Update'] = {};
  if (input.titulo !== undefined) patch.titulo = input.titulo;
  if (input.descripcion !== undefined) patch.descripcion = input.descripcion;
  if (input.categoria !== undefined) patch.categoria = input.categoria;
  if (input.fecha !== undefined) patch.fecha = input.fecha;
  if (input.publicado !== undefined) patch.publicado = input.publicado;
  if (input.check_1 !== undefined) patch.check_1 = input.check_1;
  if (input.check_2 !== undefined) patch.check_2 = input.check_2;
  if (input.check_3 !== undefined) patch.check_3 = input.check_3;
  if (input.check_4 !== undefined) patch.check_4 = input.check_4;

  const { data, error } = await db()
    .from('gallery_items')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single();
  if (error) throw error;
  const { data: images } = await db()
    .from('gallery_images')
    .select('*')
    .eq('gallery_item_id', input.id)
    .order('orden', { ascending: true });
  return toItem(data, (images ?? []).map(toGalleryImage));
}

export async function reorderGalleryItems(input: { orderedIds: string[] }): Promise<void> {
  for (let i = 0; i < input.orderedIds.length; i++) {
    const { error } = await db()
      .from('gallery_items')
      .update({ orden: i + 1 })
      .eq('id', input.orderedIds[i]);
    if (error) throw error;
  }
}

/** Sube imágenes a la galería y crea sus registros en gallery_images. */
export async function uploadGalleryImages(input: {
  galleryItemId: string;
  files: File[];
  tipos?: Array<'antes' | 'despues'>;
}): Promise<GalleryImage[]> {
  const seen = new Map<string, number>();
  const pathFor = (file: File) => {
    const base = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const name = seen.has(base) ? `${Date.now()}-${base}-${seen.get(base)!}` : `${Date.now()}-${base}`;
    seen.set(base, (seen.get(base) ?? 0) + 1);
    return `gallery/${input.galleryItemId}/${name}`;
  };

  const { data: existing, error: existingError } = await db()
    .from('gallery_images')
    .select('orden')
    .eq('gallery_item_id', input.galleryItemId)
    .order('orden', { ascending: false })
    .limit(1);
  if (existingError) throw existingError;
  let orden = (existing?.[0]?.orden ?? 0) + 1;

  const created: GalleryImage[] = [];
  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i];
    const webp = await toWebp(file, { maxDimension: 1600, quality: 0.82 });
    const storagePath = pathFor(webp);
    const { error: uploadError } = await db()
      .storage.from('public-gallery')
      .upload(storagePath, webp, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;
    const thumb = await toWebp(file, { maxDimension: 640, quality: 0.8 });
    const { error: thumbError } = await db()
      .storage.from('public-gallery')
      .upload(variantPath(storagePath, '-sm'), thumb, { cacheControl: '3600', upsert: false });
    if (thumbError) throw thumbError;
    const tipo = input.tipos?.[i] ?? null;
    const { data, error } = await db()
      .from('gallery_images')
      .insert({ gallery_item_id: input.galleryItemId, storage_path: storagePath, orden, tipo })
      .select('*')
      .single();
    if (error) throw error;
    created.push(toGalleryImage(data));
    orden += 1;
  }
  return created;
}

/** Elimina una imagen de la galería (fila + objeto de storage). */
export async function deleteGalleryImage(input: { id: string }): Promise<void> {
  const { data: img, error: rowError } = await db()
    .from('gallery_images')
    .select('storage_path')
    .eq('id', input.id)
    .single();
  if (rowError) throw rowError;
  const storagePath = img?.storage_path;
  if (storagePath && !/^https?:\/\//.test(storagePath)) {
    await db().storage.from('public-gallery').remove([storagePath, variantPath(storagePath, '-sm')]);
  }
  const { error } = await db().from('gallery_images').delete().eq('id', input.id);
  if (error) throw error;
}
