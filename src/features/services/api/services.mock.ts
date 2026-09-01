import type {
  NewServiceInput,
  Service,
  UpdateServiceInput,
} from '@/types';
import { clone, delay, uid } from '@/lib/mock/helpers';

// Datos de ejemplo extraidos del contrato visual. La landing y el dashboard
// usan datasets distintos a proposito (el mock no modela el ida y vuelta de
// un solo catalogo): useServices (publico) expone los 6 servicios de la
// landing ($9k-$40k); useServicesAdmin (privado) expone el catalogo con el
// que se trabaja en el dashboard ($8.6k-$24.8k).

const BASE = '2026-08-20T12:00:00.000Z';

type SvcInput = Omit<
  Service,
  'created_at' | 'updated_at' | 'categoria_id' | 'categoria_nombre' | 'plazo'
> & {
  categoria_id?: string | null;
  categoria_nombre?: string | null;
  plazo?: string | null;
};

function svc(input: SvcInput): Service {
  return {
    ...input,
    plazo: input.plazo ?? null,
    categoria_id: input.categoria_id ?? null,
    categoria_nombre: input.categoria_nombre ?? (input.categoria ?? null),
    created_at: BASE,
    updated_at: BASE,
  };
}

// Catalogo publico (landing)
const PUBLIC_SERVICES: Service[] = [
  svc({
    id: 'svc-cambios',
    titulo: 'Regulación de cambios',
    descripcion:
      'Revisamos desviadores, cableado y tensión para que cada cambio entre parejo y sin saltos. Probamos en banco antes de entregar.',
    precio_base: 9000,
    plazo: 'Mismo día',
    activo: true,
    imagen_url: 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
    categoria: 'Ajuste',
    orden: 1,
  }),
  svc({
    id: 'svc-frenos',
    titulo: 'Regulación de frenos',
    descripcion:
      'Centramos las pastillas, ajustamos el cableado y purgamos si hace falta para que frenes parejo y con confianza.',
    precio_base: 9000,
    plazo: 'Mismo día',
    activo: true,
    imagen_url: 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
    categoria: 'Ajuste',
    orden: 2,
  }),
  svc({
    id: 'svc-service',
    titulo: 'Service completo',
    descripcion:
      'Revisamos todo: transmisión, frenos, rodados, dirección y lubricación. Es el trabajo más completo para dejar la bici de punta en blanco.',
    precio_base: 40000,
    plazo: '1 día',
    activo: true,
    imagen_url: 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
    categoria: 'Mantenimiento',
    orden: 3,
  }),
  svc({
    id: 'svc-ruedas',
    titulo: 'Centrado de ruedas',
    descripcion:
      'Tensamos y alineamos las radas para que la rueda gire pareja y sin juego. Ideal si notás saltos o fricción al andar.',
    precio_base: 14000,
    plazo: 'Mismo día',
    activo: true,
    imagen_url: 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
    categoria: 'Ruedas',
    orden: 4,
  }),
  svc({
    id: 'svc-limpieza',
    titulo: 'Limpieza y lubricación',
    descripcion:
      'Desarmamos y limpiamos la transmisión, lubricamos cada punto y dejamos la bici rodando más suave y silenciosa.',
    precio_base: 10000,
    plazo: '1-2 horas',
    activo: true,
    imagen_url: 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
    categoria: 'Mantenimiento',
    orden: 5,
  }),
  svc({
    id: 'svc-armado',
    titulo: 'Armado de bici',
    descripcion:
      'Armamos tu bici nueva desde la caja, ajustamos frenos, cambios y torque de tornillería y la dejamos lista para andar.',
    precio_base: 25000,
    plazo: '1-2 días',
    activo: true,
    imagen_url: 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000',
    categoria: 'Armado',
    orden: 6,
  }),
];

// Catalogo del dashboard (admin)
let ADMIN_SERVICES: Service[] = [
  svc({
    id: 'adm-aju-general',
    titulo: 'Ajuste general',
    descripcion: 'Revisión y ajuste completo de la bici',
    precio_base: 12000,
    activo: true,
    imagen_url: null,
    categoria: 'Ajuste',
    orden: 1,
  }),
  svc({
    id: 'adm-cambio-cadena',
    titulo: 'Cambio de cadena',
    descripcion: 'Incluye medición de desgaste',
    precio_base: 14500,
    activo: true,
    imagen_url: null,
    categoria: 'Transmisión',
    orden: 2,
  }),
  svc({
    id: 'adm-cambio-cubiertas',
    titulo: 'Cambio de cubiertas',
    descripcion: 'Por rueda',
    precio_base: 9800,
    activo: true,
    imagen_url: null,
    categoria: 'Ruedas',
    orden: 3,
  }),
  svc({
    id: 'adm-ajuste-frenos',
    titulo: 'Ajuste de frenos',
    descripcion: 'Pastillas y centrado',
    precio_base: 8600,
    activo: true,
    imagen_url: null,
    categoria: 'Frenos',
    orden: 4,
  }),
  svc({
    id: 'adm-diagnostico',
    titulo: 'Diagnóstico',
    descripcion: 'Revisión detallada, sin reparación',
    precio_base: 12000,
    activo: true,
    imagen_url: null,
    categoria: 'Diagnóstico',
    orden: 5,
  }),
  svc({
    id: 'adm-armado-rueda',
    titulo: 'Armado de rueda',
    descripcion: 'Rayos y centrado',
    precio_base: 24800,
    activo: true,
    imagen_url: null,
    categoria: 'Ruedas',
    orden: 6,
  }),
];

export async function listServices(params?: { onlyActive?: boolean }): Promise<Service[]> {
  await delay();
  let items = PUBLIC_SERVICES;
  if (params?.onlyActive) items = items.filter((s) => s.activo);
  return clone(items);
}

export async function listServicesAdmin(): Promise<Service[]> {
  await delay();
  return clone(ADMIN_SERVICES);
}

export async function createService(input: NewServiceInput): Promise<Service> {
  await delay();
  const now = new Date().toISOString();
  const next: Service = {
    id: uid(),
    titulo: input.titulo,
    descripcion: input.descripcion,
    precio_base: input.precio_base,
    activo: input.activo ?? true,
    imagen_url: input.imagen_url ?? null,
    categoria: input.categoria ?? null,
    categoria_id: input.categoria_id ?? null,
    categoria_nombre: input.categoria ?? null,
    plazo: input.plazo ?? null,
    orden: ADMIN_SERVICES.length + 1,
    created_at: now,
    updated_at: now,
  };
  ADMIN_SERVICES = [next, ...ADMIN_SERVICES];
  return clone(next);
}

export async function updateService(input: UpdateServiceInput): Promise<Service> {
  await delay();
  const idx = ADMIN_SERVICES.findIndex((s) => s.id === input.id);
  if (idx === -1) throw new Error('Servicio no encontrado');
  const updated: Service = {
    ...ADMIN_SERVICES[idx],
    ...input,
    updated_at: new Date().toISOString(),
  };
  ADMIN_SERVICES[idx] = updated;
  return clone(updated);
}

export async function toggleServiceActive(input: { id: string; activo: boolean }): Promise<Service> {
  await delay();
  const idx = ADMIN_SERVICES.findIndex((s) => s.id === input.id);
  if (idx === -1) throw new Error('Servicio no encontrado');
  const updated: Service = {
    ...ADMIN_SERVICES[idx],
    activo: input.activo,
    updated_at: new Date().toISOString(),
  };
  ADMIN_SERVICES[idx] = updated;
  return clone(updated);
}
