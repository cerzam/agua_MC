import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { listCustomers } from '@/services/customers.service';
import type { Customer } from '@/types/models';

export function useCustomers() {
  const { status, uid } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!uid) {
      return;
    }
    setLoading(true);
    try {
      setCustomers(await listCustomers(uid));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar los clientes.');
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

  return { customers, loading, error, reload };
}
