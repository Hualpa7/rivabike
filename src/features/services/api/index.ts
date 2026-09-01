import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NewServiceInput, Service, ServiceCategory, UpdateServiceInput } from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './services.mock';
import * as real from './services.supabase';
import * as mockCategories from './service-categories.mock';
import * as realCategories from './service-categories.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const listServicesFn = useMocks ? mock.listServices : real.listServices;
const listServicesAdminFn = useMocks ? mock.listServicesAdmin : real.listServicesAdmin;
const createServiceFn = useMocks ? mock.createService : real.createService;
const updateServiceFn = useMocks ? mock.updateService : real.updateService;
const toggleServiceActiveFn = useMocks ? mock.toggleServiceActive : real.toggleServiceActive;

const listCategoriesFn = useMocks ? mockCategories.listServiceCategories : realCategories.listServiceCategories;
const createCategoryFn = useMocks ? mockCategories.createServiceCategory : realCategories.createServiceCategory;
const updateCategoryFn = useMocks ? mockCategories.updateServiceCategory : realCategories.updateServiceCategory;
const deleteCategoryFn = useMocks ? mockCategories.deleteServiceCategory : realCategories.deleteServiceCategory;

export function useServices(params?: { onlyActive?: boolean }) {
  return useQuery({
    queryKey: ['services', 'public', params?.onlyActive ?? false],
    queryFn: () => listServicesFn(params),
  });
}

export function useServicesAdmin() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['services', 'admin'],
    queryFn: () => listServicesAdminFn(),
    enabled: status === 'authenticated',
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation<Service, Error, NewServiceInput>({
    mutationFn: (input) => createServiceFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['services', 'admin'] });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation<Service, Error, UpdateServiceInput>({
    mutationFn: (input) => updateServiceFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['services', 'admin'] });
    },
  });
}

export function useToggleServiceActive() {
  const qc = useQueryClient();
  return useMutation<Service, Error, { id: string; activo: boolean }>({
    mutationFn: (input) => toggleServiceActiveFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['services', 'admin'] });
    },
  });
}

export function useServiceCategories() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: () => listCategoriesFn(),
    enabled: status === 'authenticated',
  });
}

export function useCreateServiceCategory() {
  const qc = useQueryClient();
  return useMutation<ServiceCategory, Error, { nombre: string }>({
    mutationFn: (input) => createCategoryFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['service-categories'] });
      void qc.invalidateQueries({ queryKey: ['services', 'admin'] });
    },
  });
}

export function useUpdateServiceCategory() {
  const qc = useQueryClient();
  return useMutation<ServiceCategory, Error, { id: string; nombre?: string; orden?: number; activo?: boolean }>({
    mutationFn: (input) => updateCategoryFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['service-categories'] });
      void qc.invalidateQueries({ queryKey: ['services', 'admin'] });
    },
  });
}

export function useDeleteServiceCategory() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: (input) => deleteCategoryFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['service-categories'] });
      void qc.invalidateQueries({ queryKey: ['services', 'admin'] });
    },
  });
}
