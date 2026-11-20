import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { periodRange, type PeriodKey } from '@/lib/dates';
import { listSales } from '@/services/sales.service';
import type { Sale } from '@/types/models';

export type SalesPeriod = PeriodKey;

export function useSales(period: SalesPeriod) {
  const { status, uid } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!uid) {
      return;
    }
    setLoading(true);
    try {
      setSales(await listSales(uid, periodRange(period)));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar las ventas.');
    } finally {
      setLoading(false);
    }
  }, [uid, period]);

  useEffect(() => {
    if (status === 'ready' && uid) {
      queueMicrotask(() => {
        void reload();
      });
    }
  }, [status, uid, reload]);

  return { sales, loading, error, reload };
}
