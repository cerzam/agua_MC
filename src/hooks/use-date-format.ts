import { useCallback } from 'react';

import { useBusinessSettings } from '@/hooks/use-business-settings';
import { formatDateWithStyle } from '@/lib/dates';
import type { DateFormat } from '@/types/models';

type DateLike = Date | { toDate: () => Date } | undefined;

/** Formateador de fechas que respeta el formato guardado en Configuración. */
export function useDateFormat() {
  const { settings } = useBusinessSettings();
  const format: DateFormat = settings?.dateFormat ?? 'dd/MM/yyyy';

  return useCallback(
    (value: DateLike, includeYear = true) => {
      const date = value instanceof Date ? value : (value?.toDate?.() ?? new Date(0));
      return formatDateWithStyle(date, format, includeYear);
    },
    [format],
  );
}
