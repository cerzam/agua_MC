import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from '@/lib/dates';
import type { Expense, Payment, Sale } from '@/types/models';

import { listExpenses } from './expenses.service';
import { listPayments } from './payments.service';
import { listSales } from './sales.service';

export type StatsPeriod = 'today' | 'week' | 'month' | 'all' | 'custom';
export type StatsRange = { from?: Date; to?: Date };

export type StatsBucket = {
  label: string;
  totalCents: number;
  bottles: number;
};

export type StatsSummary = {
  salesCents: number;
  collectedCents: number;
  pendingCents: number;
  expensesCents: number;
  cashCents: number;
  bottles: number;
  salesCount: number;
  averageDailyCents: number;
  bestDay: StatsBucket | null;
};

export type StatisticsData = {
  range: StatsRange;
  rangeLabel: string;
  hasData: boolean;
  daysCount: number;
  current: StatsSummary;
  previous: StatsSummary | null;
  buckets: StatsBucket[];
};

const MAX_BUCKETS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(timestamp: { toDate: () => Date } | undefined): Date {
  return timestamp?.toDate?.() ?? new Date(0);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Convierte `YYYY-MM-DD` a una fecha local válida, o null si el texto no sirve. */
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildPeriodRange(
  period: StatsPeriod,
  custom?: StatsRange,
): StatsRange {
  const now = new Date();

  if (period === 'today') {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (period === 'week') {
    return { from: startOfWeek(now), to: endOfWeek(now) };
  }
  if (period === 'month') {
    return { from: startOfMonth(now), to: endOfMonth(now) };
  }
  if (period === 'custom') {
    return {
      from: custom?.from ? startOfDay(custom.from) : undefined,
      to: custom?.to ? endOfDay(custom.to) : undefined,
    };
  }
  return {};
}

/** Rango inmediatamente anterior, con la misma duración que el actual. */
export function previousRange(range: StatsRange): StatsRange | null {
  if (!range.from || !range.to) {
    return null;
  }
  const from = range.from.getTime();
  const to = range.to.getTime();
  const duration = to - from + 1;
  return {
    from: new Date(from - duration),
    to: new Date(from - 1),
  };
}

function within(date: Date, range: StatsRange): boolean {
  const time = date.getTime();
  return (!range.from || time >= range.from.getTime()) && (!range.to || time <= range.to.getTime());
}

function rangeBounds(range: StatsRange, sales: Sale[]): { from: Date; to: Date } {
  const to = range.to ?? new Date();
  const dates = sales.map((sale) => toDate(sale.createdAt).getTime()).filter((time) => time > 0);
  const earliest = dates.length > 0 ? new Date(Math.min(...dates)) : to;
  return { from: range.from ?? startOfDay(earliest), to };
}

function buildBuckets(sales: Sale[], range: StatsRange): StatsBucket[] {
  const { from, to } = rangeBounds(range, sales);
  let start = startOfDay(from);
  const end = startOfDay(to);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1);
  const lastDays = Math.min(totalDays, MAX_BUCKETS);
  start = addDays(end, -(lastDays - 1));

  const buckets: StatsBucket[] = [];
  const indexes = new Map<string, number>();

  for (let index = 0; index < lastDays; index += 1) {
    const day = addDays(start, index);
    const label =
      lastDays === 1
        ? 'Hoy'
        : new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(day);
    indexes.set(toDateKey(day), buckets.length);
    buckets.push({
      label: label.replace('.', ''),
      totalCents: 0,
      bottles: 0,
    });
  }

  for (const sale of sales) {
    const index = indexes.get(toDateKey(toDate(sale.createdAt)));
    if (index === undefined) {
      continue;
    }
    const bucket = buckets[index];
    bucket.totalCents += Number(sale.totalCents ?? 0);
    bucket.bottles += Number(sale.quantity ?? 0);
  }

  return buckets;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function summarize(
  sales: Sale[],
  payments: Payment[],
  expenses: Expense[],
  allSales: Sale[],
  range: StatsRange,
  buckets: StatsBucket[],
  daysCount: number,
): StatsSummary {
  const periodSales = sales.filter((item) => within(toDate(item.createdAt), range));
  const periodPayments = payments.filter((item) => within(toDate(item.createdAt), range));
  const periodExpenses = expenses.filter((item) => within(toDate(item.createdAt), range));
  const pendingSales = range.to
    ? allSales.filter((item) => toDate(item.createdAt).getTime() <= range.to!.getTime())
    : allSales;

  const salesCents = sum(periodSales.map((item) => Number(item.totalCents ?? 0)));
  const collectedCents = sum(periodPayments.map((item) => Number(item.amountCents ?? 0)));
  const expensesCents = sum(periodExpenses.map((item) => Number(item.amountCents ?? 0)));
  const bestDay = buckets.reduce<StatsBucket | null>(
    (best, bucket) => (bucket.totalCents > (best?.totalCents ?? 0) ? bucket : best),
    null,
  );

  return {
    salesCents,
    collectedCents,
    pendingCents: sum(
      pendingSales.map((item) =>
        Math.max(0, Number(item.totalCents ?? 0) - Number(item.paidCents ?? 0)),
      ),
    ),
    expensesCents,
    cashCents: collectedCents - expensesCents,
    bottles: sum(periodSales.map((item) => Number(item.quantity ?? 0))),
    salesCount: periodSales.length,
    averageDailyCents: Math.round(salesCents / Math.max(1, daysCount)),
    bestDay: bestDay?.totalCents ? bestDay : null,
  };
}

function rangeLabel(range: StatsRange, period: StatsPeriod): string {
  if (period === 'custom' && range.from && range.to) {
    return `${formatDateInput(range.from)} — ${formatDateInput(range.to)}`;
  }
  if (range.from && range.to) {
    return `${formatDateInput(range.from)} — ${formatDateInput(range.to)}`;
  }
  return 'Todo el historial';
}

/** Agrega ventas, cobros y gastos reales de Firestore para el periodo elegido. */
export async function getStatisticsData(
  uid: string,
  period: StatsPeriod,
  custom?: StatsRange,
): Promise<StatisticsData> {
  const range = buildPeriodRange(period, custom);
  if (range.from && range.to && range.from.getTime() > range.to.getTime()) {
    throw new Error('La fecha inicial debe ser menor o igual a la final.');
  }

  const [allSales, payments, expenses] = await Promise.all([
    listSales(uid),
    listPayments(uid),
    listExpenses(uid),
  ]);

  const { from, to } = rangeBounds(range, allSales);
  const daysCount = Math.max(
    1,
    Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS) + 1,
  );
  const buckets = buildBuckets(allSales, range);
  const previous = previousRange(range);
  const compareRange = period === 'all' ? null : previous;

  return {
    range,
    rangeLabel: rangeLabel(range, period),
    hasData: allSales.some((item) => within(toDate(item.createdAt), range)) ||
      payments.some((item) => within(toDate(item.createdAt), range)) ||
      expenses.some((item) => within(toDate(item.createdAt), range)),
    daysCount,
    current: summarize(allSales, payments, expenses, allSales, range, buckets, daysCount),
    previous: compareRange
      ? summarize(allSales, payments, expenses, allSales, compareRange, [], daysCount)
      : null,
    buckets,
  };
}
