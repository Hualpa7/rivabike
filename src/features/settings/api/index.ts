import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SiteSettings } from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './settings.mock';
import * as real from './settings.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const getSiteSettingsFn = useMocks ? mock.getSiteSettings : real.getSiteSettings;
const getSiteSettingsAdminFn = useMocks ? mock.getSiteSettingsAdmin : real.getSiteSettingsAdmin;
const updateSiteSettingsFn = useMocks ? mock.updateSiteSettings : real.updateSiteSettings;

/** Publico: configuracion del negocio (landing). */
export function useSiteSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => getSiteSettingsFn(),
  });
}

/** Privado: configuracion del negocio (dashboard). */
export function useSiteSettingsAdmin() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: () => getSiteSettingsAdminFn(),
    enabled: status === 'authenticated',
  });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation<SiteSettings, Error, Partial<SiteSettings>>({
    mutationFn: (input) => updateSiteSettingsFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
