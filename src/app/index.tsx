import { Link, router, useFocusEffect } from 'expo-router';
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Droplets,
  HandCoins,
  Package,
  Receipt,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

import { MovementRow } from '@/components/ui/movement-row';
import { QuickAction } from '@/components/ui/quick-action';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';

const ICON_SIZE = 20;

export default function HomeScreen() {
  const theme = useTheme();
  const { settings } = useBusinessSettings();
  const { data, loading, error, reload } = useDashboard();
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void reload();
    }, [reload]),
  );

  const businessName = settings?.businessName ?? 'Agua MC';
  const currency = settings?.currency;
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.stateBox}>
          <ActivityIndicator color={theme.primary} size="large" />
          <AppText variant="caption" tone="secondary">
            Cargando el resumen de hoy…
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error && !data) {
    return (
      <Screen>
        <Card style={styles.stateBox}>
          <AppText variant="heading">No se pudo cargar el resumen</AppText>
          <AppText variant="caption" tone="secondary">
            {error}
          </AppText>
          <Button label="Reintentar" icon={<RefreshCw size={16} color={theme.textOnPrimary} />} onPress={() => void reload()} />
        </Card>
      </Screen>
    );
  }

  const todayData = data?.today;
  const week = data?.week;
  const maxBottles = Math.max(1, ...(week?.days.map((day) => day.bottles) ?? [1]));

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.primary} />}>
      <View style={styles.header}>
        <View style={[styles.brandIcon, { backgroundColor: theme.primary }]}>
          <Droplets size={24} color={theme.textOnPrimary} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="caption" tone="secondary">
            {today}
          </AppText>
          <AppText variant="heading">{businessName}</AppText>
        </View>
      </View>

      <View style={styles.quickActions}>
        <QuickAction
          label="Nueva venta"
          icon={<ShoppingCart size={20} color={theme.primary} />}
          onPress={() => router.push('/ventas/nueva')}
        />
        <QuickAction
          label="Nuevo gasto"
          icon={<Receipt size={20} color={theme.primary} />}
          onPress={() => router.push('/gastos/nuevo')}
        />
        <QuickAction
          label="Registrar abono"
          icon={<HandCoins size={20} color={theme.primary} />}
          onPress={() => router.push('/abonos/nuevo')}
        />
      </View>

      <SectionHeader
        title="Resumen de hoy"
        subtitle="Datos reales registrados en tu negocio"
      />

      <View style={styles.metricsGrid}>
        <MetricCard
          label="Garrafones vendidos"
          value={String(todayData?.bottles ?? 0)}
          icon={<Package size={ICON_SIZE} color={theme.primary} />}
        />
        <MetricCard
          label="Importe de ventas"
          value={formatCurrency(todayData?.salesCents ?? 0, currency)}
          icon={<CircleDollarSign size={ICON_SIZE} color={theme.primary} />}
        />
        <MetricCard
          label="Dinero cobrado"
          value={formatCurrency(todayData?.collectedCents ?? 0, currency)}
          tone="success"
          icon={<Wallet size={ICON_SIZE} color={theme.success} />}
        />
        <MetricCard
          label="Pendiente de cobrar"
          value={formatCurrency(todayData?.pendingCents ?? 0, currency)}
          tone="warning"
          icon={<Clock3 size={ICON_SIZE} color={theme.warning} />}
        />
        <MetricCard
          label="Gastos de hoy"
          value={formatCurrency(todayData?.expensesCents ?? 0, currency)}
          tone="danger"
          icon={<Receipt size={ICON_SIZE} color={theme.danger} />}
        />
      </View>

      <Link
        href="/gastos"
        style={[styles.expenseLink, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.expenseLinkContent}>
          <Receipt size={ICON_SIZE} color={theme.primary} />
          <View>
            <AppText variant="label">Historial de gastos</AppText>
            <AppText variant="caption" tone="secondary">
              Consulta y administra tus egresos
            </AppText>
          </View>
        </View>
        <ArrowRight size={18} color={theme.textSecondary} />
      </Link>

      <Card>
        <SectionHeader title="Movimientos recientes" subtitle="Ventas, cobros y gastos de hoy" />
        {data && data.movements.length > 0 ? (
          <View style={styles.movements}>
            {data.movements.map((movement) => (
              <MovementRow key={movement.id} movement={movement} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon={<TrendingUp size={28} color={theme.accent} />}
            title="Aún no hay movimientos"
            description="Cuando registres ventas, abonos o gastos aparecerán aquí en orden cronológico."
          />
        )}
      </Card>

      <Card>
        <SectionHeader
          title="Resumen de la semana"
          subtitle={`${week?.bottles ?? 0} garrafones · ${formatCurrency(week?.totalCents ?? 0, currency)}`}
        />
        <View style={styles.chart}>
          {week?.days.map((day) => (
            <View key={day.label} style={styles.barColumn}>
              <AppText variant="caption" tone="secondary" style={styles.barValue}>
                {day.bottles > 0 ? day.bottles : ''}
              </AppText>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: day.bottles > 0 ? theme.primary : theme.surfaceMuted,
                      height: Math.max(4, (day.bottles / maxBottles) * 96),
                    },
                  ]}
                />
              </View>
              <AppText variant="caption" tone="secondary" style={styles.barLabel}>
                {day.label}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  expenseLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  expenseLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  movements: {
    gap: Spacing.half,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  barTrack: {
    height: 96,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 22,
    borderRadius: Radius.sm,
  },
  barValue: {
    minHeight: 18,
  },
  barLabel: {
    textAlign: 'center',
  },
  stateBox: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
});
