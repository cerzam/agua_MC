import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { getDashboardData, type DashboardData } from '@/services/dashboard.service';

export function useDashboard() {
  const { status, uid } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!uid) {
      return;
    }
    setLoading(true);
    try {
      setData(await getDashboardData(uid));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el resumen.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (status === 'ready' && uid) {
      queueMicrotask(() => {
        void reload();
      });
    }
  }, [status, uid, reload]);

  return { data, loading, error, reload };
}
