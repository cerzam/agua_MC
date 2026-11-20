import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { ensureBusinessSettings, getBusinessSettings } from '@/services/settings.service';
import type { BusinessSettings } from '@/types/models';

export function useBusinessSettings() {
  const { status, uid } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (status !== 'ready' || !uid) {
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        await ensureBusinessSettings(uid);
        const result = await getBusinessSettings(uid);
        if (active) {
          setSettings(result);
          setError(null);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo leer la configuración.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [status, uid]);

  return { settings, loading, error };
}
