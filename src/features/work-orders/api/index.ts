import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateWorkOrderInput,
  WorkOrder,
  WorkOrderDetail,
  WorkOrderInventoryItem,
  WorkOrderPhoto,
  WorkOrderStatus,
} from '@/types';
import { useAuthStore } from '@/features/auth/store';
import { WORK_ORDER_TRANSITIONS } from '@/types';
import * as mock from './work-orders.mock';
import * as real from './work-orders.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const listWorkOrdersFn = useMocks ? mock.listWorkOrders : real.listWorkOrders;
const getWorkOrderFn = useMocks ? mock.getWorkOrder : real.getWorkOrder;
const createWorkOrderFn = useMocks ? mock.createWorkOrder : real.createWorkOrder;
const updateWorkOrderStatusFn = useMocks ? mock.updateWorkOrderStatus : real.updateWorkOrderStatus;
const uploadWorkOrderPhotoFn = useMocks ? mock.uploadWorkOrderPhoto : real.uploadWorkOrderPhoto;
const consumeWorkOrderInventoryItemFn = useMocks
  ? mock.consumeWorkOrderInventoryItem
  : real.consumeWorkOrderInventoryItem;
const updateWorkOrderObservacionesFn = real.updateWorkOrderObservaciones;

export function useWorkOrders(params?: { estado?: WorkOrderStatus }) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['work-orders', 'list', params?.estado ?? ''],
    queryFn: () => listWorkOrdersFn(params),
    enabled: status === 'authenticated',
  });
}

export function useWorkOrder(id: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['work-orders', 'detail', id],
    queryFn: () => getWorkOrderFn(id),
    enabled: status === 'authenticated' && !!id,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation<WorkOrderDetail, Error, CreateWorkOrderInput>({
    mutationFn: (input) => createWorkOrderFn(input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['work-orders', 'list'] });
      void qc.setQueryData(['work-orders', 'detail', data.id], data);
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const qc = useQueryClient();
  return useMutation<WorkOrder, Error, { id: string; newStatus: WorkOrderStatus }>({
    mutationFn: ({ id, newStatus }) => updateWorkOrderStatusFn({ work_order_id: id, new_status: newStatus }),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['work-orders'] });
      const current = qc.getQueryData<WorkOrderDetail>(['work-orders', 'detail', variables.id]);
      if (current) {
        void qc.setQueryData(['work-orders', 'detail', variables.id], {
          ...current,
          estado: variables.newStatus,
        });
      }
    },
  });
}

export function useUploadWorkOrderPhoto() {
  const qc = useQueryClient();
  return useMutation<
    WorkOrderPhoto,
    Error,
    { workOrderId: string; file: File; tipo: WorkOrderPhoto['tipo']; descripcion?: string }
  >({
    mutationFn: (input) => uploadWorkOrderPhotoFn(input),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['work-orders', 'detail', variables.workOrderId] });
    },
  });
}

export function useConsumeWorkOrderInventoryItem() {
  const qc = useQueryClient();
  return useMutation<
    { item: WorkOrderInventoryItem },
    Error,
    { workOrderInventoryItemId: string; workOrderId: string }
  >({
    mutationFn: ({ workOrderInventoryItemId }) =>
      consumeWorkOrderInventoryItemFn({ workOrderInventoryItemId }),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['work-orders', 'detail', variables.workOrderId] });
      void qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
      void qc.invalidateQueries({ queryKey: ['inventory', 'movements'] });
    },
  });
}

export function useUpdateWorkOrderObservaciones() {
  const qc = useQueryClient();
  return useMutation<WorkOrderDetail, Error, { id: string; observaciones: string | null }>({
    mutationFn: ({ id, observaciones }) =>
      updateWorkOrderObservacionesFn({ work_order_id: id, observaciones }),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['work-orders'] });
      void qc.setQueryData(['work-orders', 'detail', data.id], data);
    },
  });
}

export { WORK_ORDER_TRANSITIONS };
