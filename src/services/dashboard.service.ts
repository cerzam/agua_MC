import { addDays, endOfDay, startOfDay, startOfWeek } from '@/lib/dates';
import type { Expense, Payment, Sale } from '@/types/models';

import { listExpenses } from './expenses.service';
import { listPayments } from './payments.service';
import { listSales } from './sales.service';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export type DashboardDay = {
  label: string;
  bottles: number;
  totalCents: number;
};

export type DashboardMovement = {
  id: string;
  kind: 'sale' | 'payment' | 'expense';
  title: string;
  detail: string;
  amountCents: number;
  date: Date;
};

export type DashboardData = {
  today: {
    bottles: number;
    salesCents: number;
    collectedCents: number;
    pendingCents: number;
    expensesCents: number;
  };
  week: {
    days: DashboardDay[];
    bottles: number;
    totalCents: number;
  };
  movements: DashboardMovement[];
};

function toDate(timestamp: { toDate: () => Date } | undefined): Date {
  return timestamp?.toDate?.() ?? new Date(0);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Agrega datos reales de Firestore. Nunca devuelve cifras de ejemplo. */
export async function getDashboardData(uid: string): Promise<DashboardData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);

  const [todaySales, allSales, todayPayments, todayExpenses] = await Promise.all([
    listSales(uid, { from: todayStart, to: todayEnd }),
    listSales(uid),
    listPayments(uid, { from: todayStart, to: todayEnd }),
    listExpenses(uid, { from: todayStart, to: todayEnd }),
  ]);

  const pendingCents = sum(
    allSales.map((sale) => Math.max(0, sale.totalCents - (sale.paidCents ?? 0))),
  );

  const days: DashboardDay[] = DAY_LABELS.map((label, index) => {
    const day = addDays(weekStart, index);
    const from = startOfDay(day).getTime();
    const to = endOfDay(day).getTime();
    const daySales = allSales.filter((sale) => {
      const date = toDate(sale.createdAt).getTime();
      return date >= from && date <= to;
    });

    return {
      label,
      bottles: sum(daySales.map((sale) => sale.quantity)),
      totalCents: sum(daySales.map((sale) => sale.totalCents)),
    };
  });

  const movements: DashboardMovement[] = [
    ...todaySales.map((sale: Sale) => ({
      id: `sale-${sale.id}`,
      kind: 'sale' as const,
      title: `Venta · ${sale.quantity} garrafón${sale.quantity === 1 ? '' : 'es'}`,
      detail: sale.paymentStatus === 'paid' ? 'Pagada' : 'Fiada',
      amountCents: sale.totalCents,
      date: toDate(sale.createdAt),
    })),
    ...todayPayments.map((payment: Payment) => ({
      id: `payment-${payment.id}`,
      kind: 'payment' as const,
      title: payment.type === 'sale_payment' ? 'Cobro de venta' : 'Abono recibido',
      detail: payment.customerId ? 'Cliente registrado' : 'Venta al público',
      amountCents: payment.amountCents,
      date: toDate(payment.createdAt),
    })),
    ...todayExpenses.map((expense: Expense) => ({
      id: `expense-${expense.id}`,
      kind: 'expense' as const,
      title: expense.concept,
      detail: expense.category,
      amountCents: expense.amountCents,
      date: toDate(expense.createdAt),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  return {
    today: {
      bottles: sum(todaySales.map((sale) => sale.quantity)),
      salesCents: sum(todaySales.map((sale) => sale.totalCents)),
      collectedCents: sum(todayPayments.map((payment) => payment.amountCents)),
      pendingCents,
      expensesCents: sum(todayExpenses.map((expense) => expense.amountCents)),
    },
    week: {
      days,
      bottles: sum(days.map((day) => day.bottles)),
      totalCents: sum(days.map((day) => day.totalCents)),
    },
    movements,
  };
}
