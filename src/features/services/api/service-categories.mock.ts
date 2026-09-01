import type { ServiceCategory } from '@/types';
import { clone, delay, uid } from '@/lib/mock/helpers';

let CATEGORIES: ServiceCategory[] = [
  { id: 'cat-ajuste', nombre: 'Ajuste', slug: 'ajuste', orden: 1, activo: true, created_at: '2026-08-20T12:00:00.000Z', updated_at: '2026-08-20T12:00:00.000Z' },
  { id: 'cat-transmision', nombre: 'Transmisión', slug: 'transmision', orden: 2, activo: true, created_at: '2026-08-20T12:00:00.000Z', updated_at: '2026-08-20T12:00:00.000Z' },
  { id: 'cat-ruedas', nombre: 'Ruedas', slug: 'ruedas', orden: 3, activo: true, created_at: '2026-08-20T12:00:00.000Z', updated_at: '2026-08-20T12:00:00.000Z' },
  { id: 'cat-frenos', nombre: 'Frenos', slug: 'frenos', orden: 4, activo: true, created_at: '2026-08-20T12:00:00.000Z', updated_at: '2026-08-20T12:00:00.000Z' },
  { id: 'cat-diagnostico', nombre: 'Diagnóstico', slug: 'diagnostico', orden: 5, activo: true, created_at: '2026-08-20T12:00:00.000Z', updated_at: '2026-08-20T12:00:00.000Z' },
  { id: 'cat-mantenimiento', nombre: 'Mantenimiento', slug: 'mantenimiento', orden: 6, activo: true, created_at: '2026-08-20T12:00:00.000Z', updated_at: '2026-08-20T12:00:00.000Z' },
];

export async function listServiceCategories(): Promise<ServiceCategory[]> {
  await delay();
  return clone(CATEGORIES);
}

export async function createServiceCategory(input: { nombre: string }): Promise<ServiceCategory> {
  await delay();
  const now = new Date().toISOString();
  const slug = input.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const next: ServiceCategory = {
    id: uid(),
    nombre: input.nombre,
    slug,
    orden: CATEGORIES.length + 1,
    activo: true,
    created_at: now,
    updated_at: now,
  };
  CATEGORIES = [...CATEGORIES, next];
  return clone(next);
}

export async function updateServiceCategory(input: {
  id: string;
  nombre?: string;
  orden?: number;
  activo?: boolean;
}): Promise<ServiceCategory> {
  await delay();
  const idx = CATEGORIES.findIndex((c) => c.id === input.id);
  if (idx === -1) throw new Error('Categoría no encontrada');
  const updated: ServiceCategory = {
    ...CATEGORIES[idx],
    ...input,
    updated_at: new Date().toISOString(),
  };
  CATEGORIES[idx] = updated;
  return clone(updated);
}

export async function deleteServiceCategory(input: { id: string }): Promise<void> {
  await delay();
  CATEGORIES = CATEGORIES.filter((c) => c.id !== input.id);
}
