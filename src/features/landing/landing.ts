import type { Service } from '@/types';

// Foto de fondo compartida: banda de Servicios y "Foto del taller" en
// Nosotros usan la misma imagen.
export const SERVICES_BG_URL =
  'https://img.magnific.com/foto-gratis/marco-diferentes-herramientas-coche-juguete_23-2148096416.jpg?semt=ais_hybrid&w=740&q=80';

// Presentacion de la landing: los campos "note", meta tags y plazo que el
// contrato visual muestra en las cards de servicios no viven en el tipo
// `Service` (dato core). Se resuelven aqui por id, de forma local y
// tipada, para no contaminar el modelo de datos.

export interface ServicePresentation {
  note: string;
  tags: string[];
  time: string;
  featured?: boolean;
  includes?: string;
}

const PRESENTATION: Record<string, ServicePresentation> = {
  'svc-cambios': {
    note: 'Ajuste fino para cambios precisos',
    tags: ['Manos libres', 'Repuesto aparte'],
    time: '≈ 1 día',
  },
  'svc-frenos': {
    note: 'Frenado firme y parejo',
    tags: ['Manos libres', 'Repuesto aparte'],
    time: '≈ 1 día',
  },
  'svc-service': {
    note: 'El más pedido. Dejás la bici como nueva',
    tags: ['Destacado', 'Incluye insumos'],
    time: '≈ 2 días',
    featured: true,
    includes: 'Limpieza, ajustes y lubricación completa',
  },
  'svc-ruedas': {
    note: 'Radas parejas, sin saltos',
    tags: ['Manos libres', 'Repuesto aparte'],
    time: '≈ 1 día',
  },
  'svc-limpieza': {
    note: 'Transmisión limpia, rodar más suave',
    tags: ['Manos libres', 'Incluye insumos'],
    time: '≈ 1 día',
  },
  'svc-armado': {
    note: 'Desarmada en caja, lista para andar',
    tags: ['Manos libres', 'Repuesto aparte'],
    time: '≈ 2 días',
  },
};

export function servicePresentation(service: Service): ServicePresentation {
  const base =
    PRESENTATION[service.id] ?? {
      note: '',
      tags: [],
      time: '≈ 1 día',
    };
  // El plazo ahora es editable desde el dashboard (services.plazo).
  // Usamos ese valor con fallback al presentacional por id.
  return {
    ...base,
    time: service.plazo ? `≈ ${service.plazo}` : base.time,
  };
}

// Relacion categoria de trabajo (galeria) -> servicio que abre su modal.
export const GALLERY_TO_SERVICE: Record<string, string> = {
  Mantenimiento: 'svc-service',
  Ajuste: 'svc-cambios',
  Armado: 'svc-armado',
  Transmisión: 'svc-limpieza',
  Frenos: 'svc-frenos',
  Ruedas: 'svc-ruedas',
};
