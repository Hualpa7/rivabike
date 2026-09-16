import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateWorkOrderInput, WorkOrderDetail, WorkOrderPhoto } from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './work-orders.mock';
import * as real from './work-orders.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const listWorkOrdersFn = useMocks ? mock.listWorkOrders : real.listWorkOrders;
const getWorkOrderFn = useMocks ? mock.getWorkOrder : real.getWorkOrder;
const createWorkOrderFn = useMocks ? mock.createWorkOrder : real.createWorkOrder;
const uploadWorkOrderPhotoFn = useMocks ? mock.uploadWorkOrderPhoto : real.uploadWorkOrderPhoto;
const deleteWorkOrderPhotoFn = useMocks ? mock.deleteWorkOrderPhoto : real.deleteWorkOrderPhoto;
const updateWorkOrderObservacionesFn = real.updateWorkOrderObservaciones;
const updateWorkOrderSeniaFn = useMocks ? mock.updateWorkOrderSenia : real.updateWorkOrderSenia;

export function useWorkOrders() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['work-orders', 'list'],
    queryFn: () => listWorkOrdersFn(),
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

export function useDeleteWorkOrderPhoto() {
  const qc = useQueryClient();
  return useMutation<void, Error, { photoId: string }>({
    mutationFn: (input) => deleteWorkOrderPhotoFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['work-orders'] });
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

export function useUpdateWorkOrderSenia() {
  const qc = useQueryClient();
  return useMutation<WorkOrderDetail, Error, { id: string; senia: number }>({
    mutationFn: ({ id, senia }) => updateWorkOrderSeniaFn({ work_order_id: id, senia }),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['work-orders'] });
      void qc.setQueryData(['work-orders', 'detail', data.id], data);
    },
  });
}
