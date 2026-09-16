import { pdf } from '@react-pdf/renderer';
import type { PresupuestoDetail, SiteSettings } from '@/types';
import { PresupuestoPdf } from './PresupuestoPdf';
import { sanitizeFileName } from '@/features/work-orders/pdf/generateWorkOrderPdf';
import {
  formatPresupuestoNumber,
  getPresupuestoCustomerFullName,
} from './PresupuestoPdfFormat';

// ---------------------------------------------------------------------------
// Generacion del PDF de presupuesto (100% en cliente, misma mecanica que
// el PDF de ordenes).
// ---------------------------------------------------------------------------

/** Nombre final del archivo: RivaBike-Presupuesto-<numero>-<cliente>.pdf */
export function buildPresupuestoPdfFileName(p: PresupuestoDetail): string {
  const numero = sanitizeFileName(formatPresupuestoNumber(p));
  const cliente = sanitizeFileName(getPresupuestoCustomerFullName(p));
  return `RivaBike-Presupuesto-${numero}-${cliente}.pdf`;
}

/** Genera el Blob PDF del presupuesto. */
export async function generatePresupuestoPdfBlob(
  presupuesto: PresupuestoDetail,
  settings: SiteSettings,
  condiciones?: string[],
): Promise<Blob> {
  return pdf(
    <PresupuestoPdf presupuesto={presupuesto} settings={settings} condiciones={condiciones} />,
  ).toBlob();
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

/** Genera y descarga el presupuesto como PDF. */
export async function downloadPresupuestoPdf(
  presupuesto: PresupuestoDetail,
  settings: SiteSettings,
  condiciones?: string[],
): Promise<void> {
  const blob = await generatePresupuestoPdfBlob(presupuesto, settings, condiciones);
  triggerDownload(blob, buildPresupuestoPdfFileName(presupuesto));
}