import { supabase } from './client';

// Helpers de Supabase Storage reutilizables. Los métodos son per-controller
// (services, gallery, inventory), pero el upload/signed-url se comparten.
// - Buckets públicos (public-gallery): URL directa.
// - Buckets privados (inventory-images, work-order-photos): signed URL.

const PUBLIC_BUCKETS = new Set(['public-gallery']);

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/** Sube un archivo a un bucket y devuelve la URL (publica o signed). */
export async function uploadImage(options: {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}): Promise<string> {
  const { bucket, path, file, upsert = false } = options;
  const fullPath = `${path}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await db()
    .storage.from(bucket)
    .upload(fullPath, file, { cacheControl: '3600', upsert });
  if (error) throw error;
  return resolveStoredPath(bucket, fullPath);
}

/** Convierte un storage_path a una URL visualizable (según publicidad). */
export async function resolveStoredPath(bucket: string, path: string): Promise<string> {
  if (/^https?:\/\//.test(path)) return path;
  if (PUBLIC_BUCKETS.has(bucket)) {
    const { data } = db().storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl ?? path;
  }
  const { data, error } = await db().storage.from(bucket).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return path;
  return data.signedUrl;
}
