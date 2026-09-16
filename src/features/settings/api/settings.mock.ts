import type { PdfCondiciones, PdfCondicionesTipo, SiteSettings } from '@/types';
import { clone, delay } from '@/lib/mock/helpers';

// Configuracion de ejemplo extraida del contrato visual de la landing.
let SETTINGS: SiteSettings = {
  nombre_negocio: 'Riva Bike',
  logo_url: null,
  telefono: '+543878224212',
  whatsapp: '543878224212',
  direccion: 'Rivadavia 243, Hipólito Yrigoyen',
  email: 'hola@rivabike.com.ar',
  horarios: 'Lun a Vie · 8:30–13:00 y 16:30–20:30 · Sáb 8:30–13:00',
  instagram: 'rivabike',
  google_place_id: null,
  google_maps_url: 'https://maps.google.com/?q=Rivadavia+243+Hipolito+Yrigoyen',
  descripcion:
    'Taller de reparación, mantenimiento y servicio técnico de bicicletas en Hipólito Yrigoyen.',
  hero_eyebrow: 'Taller · Servicio técnico',
  hero_titulo: 'Tu bici, en las mejores manos.',
  hero_imagen_url: '/hero-cover.webp',
  about_titulo: 'Sobre nosotros',
  about_descripcion:
    'Somos el taller de bicicletas de confianza de Hipólito Yrigoyen, comprometidos con el servicio técnico de calidad.',
  about_check_1: 'Servicio técnico especializado',
  about_check_1_descripcion: 'Diagnóstico claro antes de tocar nada y ajustes que quedan como corresponde.',
  about_check_2: 'Repuestos de calidad garantizada',
  about_check_2_descripcion: 'Entregamos cada bicicleta probada y te explicamos qué se hizo y por qué.',
  how_it_works_titulo: '¿Cómo trabajamos?',
  how_it_works_subtitulo: 'Un proceso simple y transparente',
  how_it_works_descripcion:
    'Contanos qué necesita tu bici y nos encargamos del resto, manteniéndote informado en cada paso.',
  how_we_work_paso1_titulo: 'Contacto',
  how_we_work_paso1_descripcion: 'Nos contás el problema de tu bicicleta.',
  how_we_work_paso2_titulo: 'Presupuesto',
  how_we_work_paso2_descripcion: 'Te pasamos precio y tiempo estimado sin compromiso.',
  how_we_work_paso3_titulo: 'Reparación',
  how_we_work_paso3_descripcion: 'Reparamos tu bici con repuestos de calidad.',
  how_we_work_paso4_titulo: 'Entrega',
  how_we_work_paso4_descripcion: 'Te avisamos cuando está lista para retirar.',
  reviews_titulo: 'Lo que dicen nuestros clientes',
  reviews_subtitulo: 'Opiniones reales de nuestra comunidad',
  services_titulo: 'Nuestros servicios',
  services_subtitulo: 'Todo lo que tu bicicleta necesita',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  await delay();
  return clone(SETTINGS);
}

export async function getSiteSettingsAdmin(): Promise<SiteSettings> {
  await delay();
  return clone(SETTINGS);
}

export async function updateSiteSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  await delay();
  SETTINGS = { ...SETTINGS, ...input };
  return clone(SETTINGS);
}

// Condiciones de los PDFs. Mismos valores por defecto que la migracion
// add_pdf_condiciones siembra en la base.
const CONDICIONES_ORDEN = [
  'Los precios pueden variar según el estado de la bicicleta al momento de la revisión. Repuestos no incluidos salvo que se indique lo contrario.',
  'A partir de la fecha de entrega de la bicicleta, la reparación cuenta con una garantía de 5 días sobre el trabajo realizado.',
  'La garantía cubre fallas directamente relacionadas con la tarea efectuada (mano de obra) y no aplica en casos de golpes, caídas, mal uso, manipulación por terceros ajenos al taller, desgaste normal de otras piezas no intervenidas, o repuestos provistos por el cliente.',
  'Para hacer efectiva la garantía, la bicicleta debe presentarse en el local junto con este comprobante.',
];

const CONDICIONES_PRESUPUESTO = [
  'Este presupuesto no implica compromiso de compra. Los precios pueden variar según el estado de la bicicleta al momento de la revisión. La aceptación de este presupuesto da inicio a la orden de trabajo correspondiente y los repuestos quedan reservados por un plazo de 7 días corridos desde la fecha de emisión.',
];

let PDF_CONDICIONES: PdfCondiciones[] = [
  { id: 'mock-orden', tipo: 'orden', items: [...CONDICIONES_ORDEN], updated_at: new Date().toISOString() },
  { id: 'mock-presupuesto', tipo: 'presupuesto', items: [...CONDICIONES_PRESUPUESTO], updated_at: new Date().toISOString() },
];

export async function getPdfCondiciones(): Promise<PdfCondiciones[]> {
  await delay();
  return clone(PDF_CONDICIONES);
}

export async function updatePdfCondiciones(input: {
  tipo: PdfCondicionesTipo;
  items: string[];
}): Promise<PdfCondiciones> {
  await delay();
  const existing = PDF_CONDICIONES.find((c) => c.tipo === input.tipo);
  const updated: PdfCondiciones = existing
    ? { ...existing, items: [...input.items], updated_at: new Date().toISOString() }
    : {
        id: `mock-${input.tipo}`,
        tipo: input.tipo,
        items: [...input.items],
        updated_at: new Date().toISOString(),
      };
  PDF_CONDICIONES = [
    ...PDF_CONDICIONES.filter((c) => c.tipo !== input.tipo),
    updated,
  ];
  return clone(updated);
}
