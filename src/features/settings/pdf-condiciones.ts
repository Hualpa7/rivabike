import type { PdfCondiciones, PdfCondicionesTipo } from '@/types';

// Condiciones por defecto. Deben coincidir con las que siembra la
// migracion add_pdf_condiciones en la base; si el admin no las editó,
// los PDFs usan estas.
export const PDF_CONDICIONES_DEFAULT: Record<PdfCondicionesTipo, string[]> = {
  orden: [
    'Los precios pueden variar según el estado de la bicicleta al momento de la revisión. Repuestos no incluidos salvo que se indique lo contrario.',
    'A partir de la fecha de entrega de la bicicleta, la reparación cuenta con una garantía de 5 días sobre el trabajo realizado.',
    'La garantía cubre fallas directamente relacionadas con la tarea efectuada (mano de obra) y no aplica en casos de golpes, caídas, mal uso, manipulación por terceros ajenos al taller, desgaste normal de otras piezas no intervenidas, o repuestos provistos por el cliente.',
    'Para hacer efectiva la garantía, la bicicleta debe presentarse en el local junto con este comprobante.',
  ],
  presupuesto: [
    'Este presupuesto no implica compromiso de compra. Los precios pueden variar según el estado de la bicicleta al momento de la revisión. La aceptación de este presupuesto da inicio a la orden de trabajo correspondiente y los repuestos quedan reservados por un plazo de 7 días corridos desde la fecha de emisión.',
  ],
};

/** Items de condiciones vigentes para un tipo, con fallback a los por defecto. */
export function resolvePdfCondiciones(
  tipo: PdfCondicionesTipo,
  list?: PdfCondiciones[] | null,
): string[] {
  const found = list?.find((c) => c.tipo === tipo);
  return found && found.items.length > 0 ? found.items : PDF_CONDICIONES_DEFAULT[tipo];
}