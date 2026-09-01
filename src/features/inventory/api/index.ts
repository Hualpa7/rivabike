import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  InventoryItem,
  NewInventoryItemInput,
  RegisterStockMovementInput,
  StockMovement,
  UpdateInventoryItemInput,
} from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './inventory.mock';
import * as real from './inventory.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const listInventoryItemsFn = useMocks ? mock.listInventoryItems : real.listInventoryItems;
const createInventoryItemFn = useMocks ? mock.createInventoryItem : real.createInventoryItem;
const updateInventoryItemFn = useMocks ? mock.updateInventoryItem : real.updateInventoryItem;
const registerStockMovementFn = useMocks ? mock.registerStockMovement : real.registerStockMovement;
const listStockMovementsFn = useMocks ? mock.listStockMovements : real.listStockMovements;

export function useInventoryItems(params?: {
  search?: string;
  onlyActive?: boolean;
}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['inventory', 'items', params?.search ?? '', params?.onlyActive ?? false],
    queryFn: () => listInventoryItemsFn(params),
    enabled: status === 'authenticated',
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation<InventoryItem, Error, NewInventoryItemInput>({
    mutationFn: (input) => createInventoryItemFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
      void qc.invalidateQueries({ queryKey: ['inventory', 'movements'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation<InventoryItem, Error, UpdateInventoryItemInput>({
    mutationFn: (input) => updateInventoryItemFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
    },
  });
}

export function useRegisterStockMovement() {
  const qc = useQueryClient();
  return useMutation<
    { movement: StockMovement; item: InventoryItem },
    Error,
    RegisterStockMovementInput
  >({
    mutationFn: (input) => registerStockMovementFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
      void qc.invalidateQueries({ queryKey: ['inventory', 'movements'] });
      void qc.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}

export function useStockMovements(params?: {
  inventoryItemId?: string;
  workOrderId?: string;
  tipo?: StockMovement['tipo'];
}) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['inventory', 'movements', params?.inventoryItemId ?? '', params?.workOrderId ?? '', params?.tipo ?? ''],
    queryFn: () => listStockMovementsFn(params),
    enabled: status === 'authenticated',
  });
}
