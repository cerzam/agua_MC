import { useSettings } from '@/context/settings-context';

/** Acceso a la configuración compartida del negocio. */
export function useBusinessSettings() {
  return useSettings();
}
