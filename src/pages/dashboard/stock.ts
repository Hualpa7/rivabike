import { LOW_STOCK_THRESHOLD } from '@/types';

export type StockStatus = 'sin_stock' | 'bajo' | 'ok';

/** Estado de stock segun la cantidad actual vs el umbral global. */
export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'sin_stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'bajo';
  return 'ok';
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  sin_stock: 'Sin stock',
  bajo: 'Stock bajo',
  ok: 'En stock',
};

export const STOCK_STATUS_DOT: Record<StockStatus, string> = {
  sin_stock: 'bg-[#D13C3C]',
  bajo: 'bg-[#D98A1F]',
  ok: 'bg-[#2E9E5B]',
};

export const STOCK_STATUS_TEXT: Record<StockStatus, string> = {
  sin_stock: 'text-[#B43030]',
  bajo: 'text-[#A86710]',
  ok: 'text-[#1F7A45]',
};

export const STOCK_STATUS_BG: Record<StockStatus, string> = {
  sin_stock: 'bg-[#D13C3C]/14',
  bajo: 'bg-[#D98A1F]/18',
  ok: 'bg-[#2E9E5B]/14',
};
