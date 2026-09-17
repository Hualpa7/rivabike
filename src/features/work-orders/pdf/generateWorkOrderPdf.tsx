import { pdf } from '@react-pdf/renderer';
import type { SiteSettings, WorkOrderDetail } from '@/types';
import { WorkOrderPdf } from './WorkOrderPdf';
import { formatWorkOrderNumber, getCustomerFullName } from './WorkOrderPdfFormat';

// ---------------------------------------------------------------------------
// Generación del PDF de la orden de trabajo.
// Sin cambios de lógica respecto del original — sólo se corrigieron los
// paths de import de arriba para que apunten a los nombres de archivo
// reales (ordenTrabajoPdf.tsx / ordenTtrabajoPdfFormato.ts) en vez de a los
// nombres en inglés que ese componente y esos formateadores no usan.
// ---------------------------------------------------------------------------

/** Quita caracteres inválidos para un nombre de archivo en cualquier OS. */
export function sanitizeFileName(value: string): string {
  return value
    .replace(/\s+/g, '-')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[.-]+/, '')
    .trim();
}

/** Nombre final del archivo: RivaBike-Orden-<numero>-<cliente>.pdf */
export function buildPdfFileName(order: WorkOrderDetail): string {
  const numero = sanitizeFileName(formatWorkOrderNumber(order));
  const cliente = sanitizeFileName(getCustomerFullName(order));
  return `RivaBike-Orden-${numero}-${cliente}.pdf`;
}

/**
 * Descarga una imagen y la devuelve como dataURL (jpeg reducido). Devuelve
 * null si falla (expirada, CORS, red): en ese caso se conserva la URL
 * original y @react-pdf intentará cargarla como antes.
 */
async function urlToDataUrl(url: string, maxDimension = 900): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82),
    );
    if (!out) return null;
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(out);
    });
  } catch {
    return null;
  }
}

/**
 * Clona la orden reemplazando las fotos por dataURLs incrustadas. Evita que
 * @react-pdf omita las imágenes en silencio cuando la signed URL expiró
 * (cache de React-Query) o falla por CORS: el PDF ya no depende de la red.
 */
export async function withEmbeddedPhotos(order: WorkOrderDetail): Promise<WorkOrderDetail> {
  if (order.photos.length === 0) return order;
  const photos = await Promise.all(
    order.photos.map(async (photo) => {
      if (!/^https?:\/\//.test(photo.storage_path)) return photo;
      const dataUrl = await urlToDataUrl(photo.storage_path);
      return dataUrl ? { ...photo, storage_path: dataUrl } : photo;
    }),
  );
  return { ...order, photos };
}

/** Genera el Blob PDF de la orden. */
export async function generateWorkOrderPdfBlob(
  order: WorkOrderDetail,
  settings: SiteSettings,
  condiciones?: string[],
): Promise<Blob> {
  const withPhotos = await withEmbeddedPhotos(order);
  return pdf(<WorkOrderPdf order={withPhotos} settings={settings} condiciones={condiciones} />).toBlob();
}

/**
 * Descarga el PDF. En Android/iOS donde el atributo `download` no se
 * respeta, se abre el blob en una pestaña nueva (fallback mobile).
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  if (isIOS) link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Genera y descarga la orden como PDF. */
export async function downloadWorkOrderPdf(
  order: WorkOrderDetail,
  settings: SiteSettings,
  condiciones?: string[],
): Promise<void> {
  const blob = await generateWorkOrderPdfBlob(order, settings, condiciones);
  triggerDownload(blob, buildPdfFileName(order));
}
