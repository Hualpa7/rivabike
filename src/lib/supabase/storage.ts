import { supabase } from './client';

// Helpers de Supabase Storage reutilizables. Los métodos son per-controller
// (services, gallery, inventory), pero el upload/signed-url se comparten.
// - Buckets públicos (public-gallery): URL directa.
// - Buckets privados (inventory-images, work-order-photos): signed URL.
//
// Convención de imágenes (ver task de optimización webp): todo upload se
// re-encoda a .webp con canvas en el cliente antes de subirse, y cuando el
// uso lo requiere (grillas/miniaturas) se guarda además una variante "-sm".

const PUBLIC_BUCKETS = new Set(['public-gallery', 'customer-review-photos']);

function db(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export interface ImageProcessOptions {
  /** Dimensión máxima del lado mayor (por defecto 1600). */
  maxDimension?: number;
  /** Calidad webp 0-1 (por defecto 0.82). */
  quality?: number;
}

/** Re-encoda una imagen a .webp y opcionalmente la reduce. Nunca lanza: si el
 *  navegador no soporta codificar webp, devuelve el archivo original. */
export async function toWebp(file: File, options: ImageProcessOptions = {}): Promise<File> {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.82;
  try {
    if (!file.type.startsWith('image/')) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[a-zA-Z0-9]+$/i, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file;
  }
}

/** Inserta un sufijo antes de la extensión de un storage_path. */
export function variantPath(path: string, suffix: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const dot = path.lastIndexOf('.');
  if (dot === -1) return `${path}${suffix}`;
  return `${path.slice(0, dot)}${suffix}${path.slice(dot)}`;
}

/** Deriva la URL de la variante "-sm" a partir de un storage_path o de una
 *  URL ya resuelta (pública o signed). */
export function toThumbUrl(urlOrPath: string, suffix = '-sm'): string {
  if (/^https?:\/\//.test(urlOrPath)) {
    const dot = urlOrPath.lastIndexOf('.');
    if (dot === -1) return urlOrPath;
    return `${urlOrPath.slice(0, dot)}${suffix}${urlOrPath.slice(dot)}`;
  }
  return variantPath(urlOrPath, suffix);
}

/** Sube un archivo como .webp a un bucket y devuelve la URL (publica o signed).
 *  Si `sm` > 0, además sube una variante "-sm.webp" recortada a esa dimensión. */
export async function uploadImage(options: {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
  sm?: number;
  maxDimension?: number;
  quality?: number;
}): Promise<string> {
  const { bucket, path, file, upsert = false, sm, maxDimension, quality } = options;
  const webp = await toWebp(file, { maxDimension, quality });
  const fullPath = `${path}/${Date.now()}-${safeName(webp.name)}`;
  const { error } = await db()
    .storage.from(bucket)
    .upload(fullPath, webp, { cacheControl: '3600', upsert });
  if (error) throw error;
  if (sm && sm > 0) {
    const thumb = await toWebp(file, { maxDimension: sm, quality });
    await db()
      .storage.from(bucket)
      .upload(variantPath(fullPath, '-sm'), thumb, { cacheControl: '3600', upsert });
  }
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