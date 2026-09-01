import type { Customer } from '@/types';
import { clone, delay } from '@/lib/mock/helpers';

const BASE = '2026-07-01T10:00:00.000Z';

function cust(partial: Omit<Customer, 'created_at' | 'updated_at'>): Customer {
  return { ...partial, created_at: BASE, updated_at: BASE };
}

// Clientes de ejemplo (consistentes con los de las ordenes de ejemplo y el
// autocomplete del wizard de nueva orden).
const CUSTOMERS: Customer[] = [
  cust({ id: 'cus-valeria', nombre: 'Valeria', apellido: 'Gómez', telefono: '3875 501234', direccion: 'San Martín 120, Salta' }),
  cust({ id: 'cus-torretto', nombre: 'Torretto', apellido: 'Rodríguez', telefono: '3876 112233', direccion: 'Rivadavia 500' }),
  cust({ id: 'cus-belen', nombre: 'Belén', apellido: 'Mansilla', telefono: '3877 445566', direccion: 'Jujuy 340' }),
  cust({ id: 'cus-rulo', nombre: 'Rulo', apellido: 'Paredes', telefono: '3878 778899', direccion: null }),
  cust({ id: 'cus-carla', nombre: 'Carla', apellido: 'Sánchez', telefono: '3879 990011', direccion: 'Córdoba 880' }),
  cust({ id: 'cus-marcos', nombre: 'Marcos', apellido: 'Díaz', telefono: '3870 223344', direccion: 'Balcarce 210' }),
];

export async function searchCustomers(query: string): Promise<Customer[]> {
  await delay();
  const q = query.trim().toLowerCase();
  if (!q) return clone(CUSTOMERS);
  return clone(
    CUSTOMERS.filter((c) =>
      `${c.nombre} ${c.apellido} ${c.telefono}`.toLowerCase().includes(q),
    ),
  );
}
