import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { Clock, Receipt, TrendingUp, Wallet } from 'lucide-react-native';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PeriodFilter } from '@/components/ui/period-filter';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { SalesChart } from '@/components/statistics/sales-chart';
import { Radius, Spacing } from '@/constants/theme';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useDateFormat } from '@/hooks/use-date-format';
import { useStatistics } from '@/hooks/use-statistics';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import {
  formatDateInput,
  parseDateInput,
  type StatsPeriod,
  type StatsRange,
  type StatsSummary,
} from '@/services/statistics.service';

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'all', label: 'Todo' },
  { value: 'custom', label: 'Personalizado' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function changePercent(current: number, previous?: number): string {
  if (previous === undefined || previous <= 0) {
    return '—';
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent > 0 ? '+' : ''}${percent}%`;
}

function ComparisonRow({
  label,
  current,
  previous,
  currency,
}: {
  label: string;
  current: number;
  previous?: number;
  currency: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <View style={styles.rowValues}>
        <AppText variant="label" style={{ color: theme.text }}>
          {formatCurrency(current, currency)}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {changePercent(current, previous)}
        </AppText>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

function SummaryMetrics({
  current,
  previous,
  currency,
}: {
  current: StatsSummary;
  previous?: StatsSummary;
  currency: string;
}) {
  return (
    <View style={styles.metrics}>
      <MetricCard
        label="Ventas generadas"
        value={formatCurrency(current.salesCents, currency)}
        icon={<TrendingUp size={20} color="#0B69D6" />}
        hint={`${current.bottles} garrafones · ${current.salesCount} ventas`}
      />
      <MetricCard
        label="Dinero cobrado"
        value={formatCurrency(current.collectedCents, currency)}
        icon={<Wallet size={20} color="#0B69D6" />}
        tone="success"
        hint={previous ? `${changePercent(current.collectedCents, previous.collectedCents)} vs periodo anterior` : undefined}
      />
      <MetricCard
        label="Deuda pendiente"
        value={formatCurrency(current.pendingCents, currency)}
        icon={<Clock size={20} color="#0B69D6" />}
        tone="warning"
        hint="Saldo de todas las ventas fiadas"
      />
      <MetricCard
        label="Gastos pagados"
        value={formatCurrency(current.expensesCents, currency)}
        icon={<Receipt size={20} color="#0B69D6" />}
        tone="danger"
        hint={`Caja estimada: ${formatCurrency(current.cashCents, currency)}`}
      />
    </View>
  );
}

export default function EstadisticasScreen() {
  const theme = useTheme();
  const { settings } = useBusinessSettings();
  const formatDate = useDateFormat();
  const currency = settings?.currency ?? 'MXN';

  const [period, setPeriod] = useState<StatsPeriod>('week');
  const [fromText, setFromText] = useState(() => formatDateInput(new Date(Date.now() - 6 * DAY_MS)));
  const [toText, setToText] = useState(() => formatDateInput(new Date()));
  const [customRange, setCustomRange] = useState<StatsRange>(() => ({
    from: new Date(Date.now() - 6 * DAY_MS),
    to: new Date(),
  }));
  const [customError, setCustomError] = useState<string | null>(null);

  const { data, loading, error } = useStatistics(period, period === 'custom' ? customRange : undefined);

  function applyCustomRange() {
    const from = parseDateInput(fromText);
    const to = parseDateInput(toText);
    if (!from || !to) {
      setCustomError('Usa el formato AAAA-MM-DD.');
      return;
    }
    if (from.getTime() > to.getTime()) {
      setCustomError('La fecha inicial debe ser menor o igual a la final.');
      return;
    }
    setCustomError(null);
    setCustomRange({ from, to });
  }

  return (
    <Screen>
      <SectionHeader title="Estadísticas" subtitle="Ventas, cobros y gastos por periodo" />

      <PeriodFilter options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

      {period === 'custom' ? (
        <Card style={styles.customCard}>
          <AppText variant="caption" tone="secondary">
            Periodo personalizado (AAAA-MM-DD)
          </AppText>
          <View style={styles.inputs}>
            <TextInput
              value={fromText}
              onChangeText={setFromText}
              placeholder="2026-01-01"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              accessibilityLabel="Fecha inicial"
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            />
            <TextInput
              value={toText}
              onChangeText={setToText}
              placeholder="2026-01-31"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              accessibilityLabel="Fecha final"
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            />
          </View>
          {customError ? (
            <AppText variant="caption" tone="danger">
              {customError}
            </AppText>
          ) : null}
          <AppText variant="label" tone="primary" onPress={applyCustomRange}>
            Aplicar periodo
          </AppText>
        </Card>
      ) : null}

      {loading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={theme.primary} />
          <AppText variant="caption" tone="secondary">
            Calculando estadísticas…
          </AppText>
        </Card>
      ) : null}

      {error ? (
        <Card style={styles.stateCard}>
          <AppText variant="label" tone="danger">
            No se pudieron cargar las estadísticas
          </AppText>
          <AppText variant="caption" tone="secondary">
            {error}
          </AppText>
        </Card>
      ) : null}

      {data && !loading && !error ? (
        <>
          <AppText variant="caption" tone="secondary">
            {data.range.from && data.range.to
              ? `${formatDate(data.range.from)} — ${formatDate(data.range.to)}`
              : 'Todo el historial'}
          </AppText>

          {data.hasData ? (
            <>
              <SummaryMetrics current={data.current} previous={data.previous ?? undefined} currency={currency} />

              <Card style={styles.section}>
                <SectionHeader title="Comparación" subtitle="Contra el periodo anterior inmediato" />
                {data.previous ? (
                  <>
                    <ComparisonRow
                      label="Ventas"
                      current={data.current.salesCents}
                      previous={data.previous.salesCents}
                      currency={currency}
                    />
                    <ComparisonRow
                      label="Cobrado"
                      current={data.current.collectedCents}
                      previous={data.previous.collectedCents}
                      currency={currency}
                    />
                    <ComparisonRow
                      label="Gastos"
                      current={data.current.expensesCents}
                      previous={data.previous.expensesCents}
                      currency={currency}
                    />
                  </>
                ) : (
                  <AppText variant="caption" tone="secondary">
                    Sin periodo anterior para comparar.
                  </AppText>
                )}
              </Card>

              <Card style={styles.section}>
                <SectionHeader title="Ventas por día" subtitle="Últimos días del periodo" />
                <SalesChart buckets={data.buckets} currency={currency} />
              </Card>

              <Card style={styles.section}>
                <SectionHeader title="Detalle" />
                <DetailRow
                  label="Promedio diario"
                  value={formatCurrency(data.current.averageDailyCents, currency)}
                />
                <DetailRow
                  label="Mejor día"
                  value={
                    data.current.bestDay
                      ? `${data.current.bestDay.label} · ${formatCurrency(data.current.bestDay.totalCents, currency)}`
                      : 'Sin ventas'
                  }
                />
                <DetailRow label="Días considerados" value={String(data.daysCount)} />
              </Card>
            </>
          ) : (
            <Card style={styles.stateCard}>
              <EmptyState
                title="Sin movimientos en este periodo"
                description="Cambia el filtro o registra una venta para ver estadísticas."
              />
            </Card>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  customCard: {
    gap: Spacing.two,
  },
  inputs: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rowValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stateCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
});
