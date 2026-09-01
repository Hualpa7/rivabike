import type {
  GalleryImage,
  GalleryItemWithImages,
  NewGalleryItemInput,
  UpdateGalleryItemInput,
} from '@/types';
import { clone, delay, uid } from '@/lib/mock/helpers';

const BASE = '2026-08-20T12:00:00.000Z';
const IMG_A = 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000';
const IMG_B = 'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000';

// Trabajos de ejemplo (consistentes con la galeria de la landing).
function item(
  partial: Pick<
    GalleryItemWithImages,
    'id' | 'titulo' | 'descripcion' | 'categoria' | 'fecha' | 'orden' | 'publicado'
  >,
): GalleryItemWithImages {
  return {
    ...partial,
    check_1: 'Frenos y cambios ajustados',
    check_2: 'Rodado y dirección en punto',
    check_3: 'Transmisión limpia y lubricada',
    check_4: 'Torque de tornillería verificado',
    created_at: BASE,
    updated_at: BASE,
    images: [
      { id: `${partial.id}-img-0`, gallery_item_id: partial.id, storage_path: IMG_A, orden: 0, tipo: 'antes' },
      { id: `${partial.id}-img-1`, gallery_item_id: partial.id, storage_path: IMG_B, orden: 1, tipo: 'despues' },
    ],
  };
}

let ITEMS: GalleryItemWithImages[] = [
  item({
    id: 'gal-service-transmision',
    titulo: 'Service completo + transmisión',
    descripcion:
      'Una bici de calle que llegó con la transmisión desgastada y el rodado duro. Cambiamos cadena y plato, ajustamos los cambios y dejamos dirección y frenos en punto.',
    categoria: 'Mantenimiento',
    fecha: '2026-07-10',
    orden: 1,
    publicado: true,
  }),
  item({
    id: 'gal-armado-caja',
    titulo: 'Armado desde caja',
    descripcion:
      'Bici nueva desarmada en caja. La armamos de punta a punta, ajustamos frenos, cambios y torque de tornillería, y la dejamos lista para andar el mismo día.',
    categoria: 'Armado',
    fecha: '2026-07-03',
    orden: 2,
    publicado: true,
  }),
  item({
    id: 'gal-cambio-transmision',
    titulo: 'Cambio de transmisión',
    descripcion:
      'Transmisión en el límite: cadenas estiradas y piñones gastados. Renovamos el grupo completo para que la bici recupere la suavidad y respuesta de fábrica.',
    categoria: 'Transmisión',
    fecha: '2026-06-24',
    orden: 3,
    publicado: true,
  }),
  item({
    id: 'gal-renovacion-frenos',
    titulo: 'Renovación de frenos',
    descripcion:
      'Pastillas gastadas y cableado duro. Reemplazamos todo el sistema de frenado y lo dejamos con respuesta firme y pareja.',
    categoria: 'Frenos',
    fecha: '2026-06-15',
    orden: 4,
    publicado: true,
  }),
  item({
    id: 'gal-centrado-ruedas',
    titulo: 'Centrado de ruedas',
    descripcion:
      'Rueda con saltos y juego lateral por impactos. Tensamos y alineamos las radas hasta que gire pareja, sin fricción y con rodamiento suave.',
    categoria: 'Ruedas',
    fecha: '2026-06-08',
    orden: 5,
    publicado: true,
  }),
  item({
    id: 'gal-limpieza',
    titulo: 'Limpieza y lubricación',
    descripcion:
      'Transmisión sucia y rodado áspero por falta de mantenimiento. Desarmamos, limpiamos y lubricamos cada punto para recuperar suavidad y silencio.',
    categoria: 'Mantenimiento',
    fecha: '2026-05-29',
    orden: 6,
    publicado: true,
  }),
];

export async function listGalleryItems(params?: { onlyPublished?: boolean }): Promise<GalleryItemWithImages[]> {
  await delay();
  let rows = ITEMS;
  if (params?.onlyPublished) rows = rows.filter((g) => g.publicado);
  return clone(rows);
}

export async function listGalleryItemsAdmin(): Promise<GalleryItemWithImages[]> {
  await delay();
  return clone(ITEMS);
}

export async function createGalleryItem(input: NewGalleryItemInput): Promise<GalleryItemWithImages> {
  await delay();
  const now = new Date().toISOString();
  const next: GalleryItemWithImages = {
    id: uid(),
    titulo: input.titulo,
    descripcion: input.descripcion ?? null,
    categoria: input.categoria ?? null,
    fecha: input.fecha ?? null,
    orden: ITEMS.length + 1,
    publicado: input.publicado ?? false,
    check_1: input.check_1 ?? null,
    check_2: input.check_2 ?? null,
    check_3: input.check_3 ?? null,
    check_4: input.check_4 ?? null,
    created_at: now,
    updated_at: now,
    images: [],
  };
  ITEMS = [next, ...ITEMS];
  return clone(next);
}

export async function updateGalleryItem(input: UpdateGalleryItemInput): Promise<GalleryItemWithImages> {
  await delay();
  const idx = ITEMS.findIndex((g) => g.id === input.id);
  if (idx === -1) throw new Error('Item no encontrado');
  const current = ITEMS[idx];
  const updated: GalleryItemWithImages = {
    ...current,
    titulo: input.titulo ?? current.titulo,
    descripcion: input.descripcion !== undefined ? input.descripcion : current.descripcion,
    categoria: input.categoria !== undefined ? input.categoria : current.categoria,
    fecha: input.fecha !== undefined ? input.fecha : current.fecha,
    publicado: input.publicado ?? current.publicado,
    check_1: input.check_1 !== undefined ? input.check_1 : current.check_1,
    check_2: input.check_2 !== undefined ? input.check_2 : current.check_2,
    check_3: input.check_3 !== undefined ? input.check_3 : current.check_3,
    check_4: input.check_4 !== undefined ? input.check_4 : current.check_4,
    updated_at: new Date().toISOString(),
  };
  ITEMS[idx] = updated;
  return clone(updated);
}

export async function reorderGalleryItems(input: { orderedIds: string[] }): Promise<void> {
  await delay();
  const byId = new Map(ITEMS.map((g) => [g.id, g]));
  const reordered = input.orderedIds
    .map((id) => byId.get(id))
    .filter((g): g is GalleryItemWithImages => !!g);
  ITEMS = reordered.map((g, i) => ({ ...g, orden: i + 1 }));
}

export async function uploadGalleryImages(input: {
  galleryItemId: string;
  files: File[];
  tipos?: Array<'antes' | 'despues'>;
}): Promise<GalleryImage[]> {
  await delay();
  const idx = ITEMS.findIndex((g) => g.id === input.galleryItemId);
  if (idx === -1) throw new Error('Item no encontrado');
  const item = ITEMS[idx];
  const existingCount = item.images.length;
  const newImages: GalleryImage[] = input.files.map((_, i) => ({
    id: uid(),
    gallery_item_id: item.id,
    storage_path: IMG_A,
    orden: existingCount + i,
    tipo: input.tipos?.[i] ?? null,
  }));
  ITEMS = ITEMS.map((g) =>
    g.id === item.id ? { ...g, images: [...g.images, ...newImages], updated_at: new Date().toISOString() } : g,
  );
  return clone(newImages);
}

export async function deleteGalleryImage(input: { id: string }): Promise<void> {
  await delay();
  ITEMS = ITEMS.map((g) =>
    g.images.some((img) => img.id === input.id)
      ? { ...g, images: g.images.filter((img) => img.id !== input.id) }
      : g,
  );
}
