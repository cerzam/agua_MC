export function startOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/** Semana que inicia en lunes. */
export function startOfWeek(date: Date = new Date()): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + mondayOffset);
  return result;
}

export function endOfWeek(date: Date = new Date()): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
}

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export type PeriodKey = 'today' | 'week' | 'month' | 'all';

/** Rango aplicable a filtros de ventas, gastos y cobros. */
export function periodRange(period: PeriodKey): { from?: Date; to?: Date } {
  const now = new Date();
  const to = new Date(now);

  if (period === 'today') {
    return { from: startOfDay(now), to };
  }
  if (period === 'week') {
    return { from: startOfWeek(now), to };
  }
  if (period === 'month') {
    return { from: startOfMonth(now), to };
  }
  return {};
}
