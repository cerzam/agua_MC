import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PeriodFilter } from '@/components/ui/period-filter';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useSales, type SalesPeriod } from '@/hooks/use-sales';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import type { PaymentStatus, Sale } from '@/types/models';

const PERIOD_OPTIONS: { value: SalesPeriod; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'all', label: 'Todo' },
];

const STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Pagada',
  partial: 'Parcial',
  unpaid: 'Fiada',
};

export default function VentasScreen() {
  const theme = useTheme();
  const { settings } = useBusinessSettings();
  const [period, setPeriod] = useState<SalesPeriod>('today');
  const { sales, loading, error, reload } = useSales(period);

  const totalCents = sales.reduce((sum, sale) => sum + sale.totalCents, 0);
  const bottles = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <Screen>
      <View style={styles.titleRow}>
        <SectionHeader title="Historial de ventas" subtitle="Ventas pagadas y fiadas" />
        <Button
          label="Nueva"
          onPress={() => router.push('/ventas/nueva')}
          style={styles.newButton}
        />
      </View>

      <PeriodFilter options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

      <View style={styles.summary}>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">Garrafones</AppText>
          <AppText variant="heading" tone="primary">{bottles}</AppText>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">Total del periodo</AppText>
          <AppText variant="heading" tone="primary">
            {formatCurrency(totalCents, settings?.currency)}
          </AppText>
        </View>
      </View>

      {error ? (
        <Card style={styles.stateBox}>
          <AppText variant="heading">No se pudieron cargar las ventas</AppText>
          <AppText variant="caption" tone="secondary">{error}</AppText>
          <Button label="Reintentar" onPress={() => void reload()} />
        </Card>
      ) : loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : sales.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin ventas en este periodo"
            description="Registra tu primera venta con el botón «Nueva»."
          />
        </Card>
      ) : (
        <Card style={styles.list}>
          {sales.map((sale) => (
            <SaleRow key={sale.id} sale={sale} currency={settings?.currency} />
          ))}
        </Card>
      )}
    </Screen>
  );
}

function SaleRow({ sale, currency }: { sale: Sale; currency?: string }) {
  const theme = useTheme();
  const date = sale.createdAt?.toDate?.() ?? new Date(0);
  const statusColor =
    sale.paymentStatus === 'paid' ? theme.success : sale.paymentStatus === 'partial' ? theme.warning : theme.danger;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/ventas/${sale.id}`)}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={styles.rowInfo}>
        <AppText variant="label" numberOfLines={1}>
          {sale.customerName ?? 'Público general'}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {sale.quantity} garrafón{sale.quantity === 1 ? '' : 'es'} ·{' '}
          {date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
        </AppText>
        <AppText variant="caption" style={{ color: statusColor }}>
          {STATUS_LABEL[sale.paymentStatus]}
          {sale.paidCents > 0 && sale.paidCents < sale.totalCents
            ? ` · Abonado ${formatCurrency(sale.paidCents, currency)}`
            : ''}
        </AppText>
      </View>
      <AppText variant="label" tone="primary">
        {formatCurrency(sale.totalCents, currency)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  newButton: {
    minHeight: 40,
    paddingHorizontal: Spacing.two,
  },
  summary: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryItem: {
    flex: 1,
    gap: Spacing.half,
    padding: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  list: {
    gap: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  rowInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  stateBox: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
});
