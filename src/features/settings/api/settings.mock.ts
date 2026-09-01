import type { SiteSettings } from '@/types';
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
  facebook: null,
  google_place_id: null,
  google_maps_url: 'https://maps.google.com/?q=Rivadavia+243+Hipolito+Yrigoyen',
  descripcion:
    'Taller de reparación, mantenimiento y servicio técnico de bicicletas en Hipólito Yrigoyen.',
  hero_eyebrow: 'Taller · Servicio técnico',
  hero_titulo: 'Tu bici, en las mejores manos.',
  hero_imagen_url:
    'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
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
