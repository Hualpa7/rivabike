import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreatePresupuestoInput,
  Presupuesto,
  PresupuestoDetail,
  PresupuestoStatus,
} from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as real from './presupuestos.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const listPresupuestosFn = useMocks ? undefined : real.listPresupuestos;
const getPresupuestoFn = useMocks ? undefined : real.getPresupuesto;
const createPresupuestoFn = useMocks ? undefined : real.createPresupuesto;
const updatePresupuestoObservacionesFn = useMocks ? undefined : real.updatePresupuestoObservaciones;
const updatePresupuestoEstadoFn = useMocks ? undefined : real.updatePresupuestoEstado;
const deletePresupuestoFn = useMocks ? undefined : real.deletePresupuesto;

function noMockSupport(): never {
  throw new Error('Presupuestos no disponible en modo mock');
}

export function usePresupuestos() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['presupuestos', 'list'],
    queryFn: () => (listPresupuestosFn ?? noMockSupport)(),
    enabled: status === 'authenticated',
  });
}

export function usePresupuesto(id: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['presupuestos', 'detail', id],
    queryFn: () => (getPresupuestoFn ?? noMockSupport)(id),
    enabled: status === 'authenticated' && !!id,
  });
}

export function useCreatePresupuesto() {
  const qc = useQueryClient();
  return useMutation<PresupuestoDetail, Error, CreatePresupuestoInput>({
    mutationFn: (input) => (createPresupuestoFn ?? noMockSupport)(input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['presupuestos', 'list'] });
      void qc.setQueryData(['presupuestos', 'detail', data.id], data);
    },
  });
}

export function useUpdatePresupuestoObservaciones() {
  const qc = useQueryClient();
  return useMutation<PresupuestoDetail, Error, { id: string; observaciones: string | null }>({
    mutationFn: ({ id, observaciones }) =>
      (updatePresupuestoObservacionesFn ?? noMockSupport)({ presupuesto_id: id, observaciones }),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['presupuestos'] });
      void qc.setQueryData(['presupuestos', 'detail', data.id], data);
    },
  });
}

export function useUpdatePresupuestoEstado() {
  const qc = useQueryClient();
  return useMutation<Presupuesto, Error, { id: string; newEstado: PresupuestoStatus }>({
    mutationFn: ({ id, newEstado }) =>
      (updatePresupuestoEstadoFn ?? noMockSupport)({ presupuesto_id: id, new_estado: newEstado }),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['presupuestos'] });
      const current = qc.getQueryData<PresupuestoDetail>(['presupuestos', 'detail', variables.id]);
      if (current) {
        void qc.setQueryData(['presupuestos', 'detail', variables.id], {
          ...current,
          estado: variables.newEstado,
        });
      }
    },
  });
}

export function useDeletePresupuesto() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => (deletePresupuestoFn ?? noMockSupport)({ presupuesto_id: id }),
    onSuccess: (_data, variables) => {
      void qc.removeQueries({ queryKey: ['presupuestos', 'detail', variables.id] });
      void qc.invalidateQueries({ queryKey: ['presupuestos', 'list'] });
    },
  });
}