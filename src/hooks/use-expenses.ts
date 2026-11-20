import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { periodRange, type PeriodKey } from '@/lib/dates';
import { listExpenses } from '@/services/expenses.service';
import type { Expense } from '@/types/models';

export type ExpensesPeriod = PeriodKey;

export function useExpenses(period: ExpensesPeriod) {
  const { status, uid } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!uid) {
      return;
    }
    setLoading(true);
    try {
      setExpenses(await listExpenses(uid, periodRange(period)));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar los gastos.');
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

  return { expenses, loading, error, reload };
}
