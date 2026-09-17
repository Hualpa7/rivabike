import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PdfCondiciones, PdfCondicionesTipo, SiteSettings } from '@/types';
import { useAuthStore } from '@/features/auth/store';
import * as mock from './settings.mock';
import * as real from './settings.supabase';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const getSiteSettingsFn = useMocks ? mock.getSiteSettings : real.getSiteSettings;
const getSiteSettingsAdminFn = useMocks ? mock.getSiteSettingsAdmin : real.getSiteSettingsAdmin;
const updateSiteSettingsFn = useMocks ? mock.updateSiteSettings : real.updateSiteSettings;

/** Publico: configuracion del negocio (landing). Contenido casi estatico. */
export function useSiteSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => getSiteSettingsFn(),
    staleTime: 5 * 60_000,
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

const getPdfCondicionesFn = useMocks ? mock.getPdfCondiciones : real.getPdfCondiciones;
const updatePdfCondicionesFn = useMocks ? mock.updatePdfCondiciones : real.updatePdfCondiciones;

export function usePdfCondiciones() {
  const status = useAuthStore((s) => s.status);
  return useQuery<PdfCondiciones[]>({
    queryKey: ['pdf-condiciones'],
    queryFn: () => getPdfCondicionesFn(),
    enabled: status === 'authenticated',
  });
}

export function useUpdatePdfCondiciones() {
  const qc = useQueryClient();
  return useMutation<PdfCondiciones, Error, { tipo: PdfCondicionesTipo; items: string[] }>({
    mutationFn: (input) => updatePdfCondicionesFn(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pdf-condiciones'] });
    },
  });
}
