import { useQuery } from '@tanstack/react-query';
import type { Customer } from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './customers.mock';
import * as real from './customers.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const searchCustomersFn = useMocks ? mock.searchCustomers : real.searchCustomers;

/** Autocomplete de clientes en el wizard de nueva orden. */
export function useCustomerSearch(query: string) {
  const status = useAuthStore((s) => s.status);
  return useQuery<Customer[]>({
    queryKey: ['customers', 'search', query],
    queryFn: () => searchCustomersFn(query),
    enabled: status === 'authenticated' && query.trim().length > 0,
  });
}
