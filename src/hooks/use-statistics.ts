import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import {
  getStatisticsData,
  type StatsPeriod,
  type StatsRange,
  type StatisticsData,
} from '@/services/statistics.service';

export function useStatistics(period: StatsPeriod, custom?: StatsRange) {
  const { status, uid } = useAuth();
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fromTime = custom?.from?.getTime() ?? null;
  const toTime = custom?.to?.getTime() ?? null;
  const customRange = useMemo<StatsRange>(
    () => ({
      from: fromTime === null ? undefined : new Date(fromTime),
      to: toTime === null ? undefined : new Date(toTime),
    }),
    [fromTime, toTime],
  );

  const reload = useCallback(async () => {
    if (!uid) {
      return;
    }
    setLoading(true);
    try {
      setData(await getStatisticsData(uid, period, customRange));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }, [uid, period, customRange]);

  useEffect(() => {
    if (status === 'ready' && uid) {
      queueMicrotask(() => {
        void reload();
      });
    }
  }, [status, uid, reload]);

  return { data, loading, error, reload };
}
