import { pdf } from '@react-pdf/renderer';
import type { SiteSettings, WorkOrderDetail } from '@/types';
import { WorkOrderPdf } from './WorkOrderPdf';
import { formatWorkOrderNumber, getCustomerFullName } from './WorkOrderPdfFormat';

// ---------------------------------------------------------------------------
// Generacion del PDF de la orden de trabajo (100% en cliente).
// ---------------------------------------------------------------------------

/** Quita caracteres invalidos para un nombre de archivo en cualquier OS. */
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

/** Genera el Blob PDF de la orden. */
export async function generateWorkOrderPdfBlob(
  order: WorkOrderDetail,
  settings: SiteSettings,
): Promise<Blob> {
  return pdf(<WorkOrderPdf order={order} settings={settings} />).toBlob();
}

/**
 * Descarga el PDF. En iOS/Android donde el atributo `download` no se respeta,
 * se abre el blob en una pestana nueva (fallback mobile).
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
): Promise<void> {
  const blob = await generateWorkOrderPdfBlob(order, settings);
  triggerDownload(blob, buildPdfFileName(order));
}