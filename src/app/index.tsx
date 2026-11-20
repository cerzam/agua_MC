import { Link } from 'expo-router';
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Droplets,
  Package,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useTheme } from '@/hooks/use-theme';

const ICON_SIZE = 20;

export default function HomeScreen() {
  const theme = useTheme();
  const { settings, loading } = useBusinessSettings();

  const businessName = settings?.businessName ?? 'Agua MC';
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.brandIcon, { backgroundColor: theme.primary }]}>
          <Droplets size={24} color={theme.textOnPrimary} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="caption" tone="secondary">
            {today}
          </AppText>
          <AppText variant="heading">{loading ? 'Agua MC' : businessName}</AppText>
        </View>
      </View>

      <SectionHeader
        title="Resumen de hoy"
        subtitle="Los datos aparecerán cuando registres movimientos"
      />

      <View style={styles.metricsGrid}>
        <MetricCard
          label="Garrafones vendidos"
          value="—"
          icon={<Package size={ICON_SIZE} color={theme.primary} />}
        />
        <MetricCard
          label="Importe de ventas"
          value="—"
          icon={<CircleDollarSign size={ICON_SIZE} color={theme.primary} />}
        />
        <MetricCard
          label="Dinero cobrado"
          value="—"
          tone="success"
          icon={<Wallet size={ICON_SIZE} color={theme.success} />}
        />
        <MetricCard
          label="Pendiente de cobrar"
          value="—"
          tone="warning"
          icon={<Clock3 size={ICON_SIZE} color={theme.warning} />}
        />
        <MetricCard
          label="Gastos registrados"
          value="—"
          tone="danger"
          icon={<Receipt size={ICON_SIZE} color={theme.danger} />}
        />
      </View>

      <Link href="/gastos" style={[styles.expenseLink, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.expenseLinkContent}>
          <Receipt size={ICON_SIZE} color={theme.primary} />
          <View>
            <AppText variant="label">Gastos del negocio</AppText>
            <AppText variant="caption" tone="secondary">
              Registra y consulta tus gastos
            </AppText>
          </View>
        </View>
        <ArrowRight size={18} color={theme.textSecondary} />
      </Link>

      <Card>
        <SectionHeader title="Movimientos recientes" subtitle="Ventas, pagos y gastos" />
        <EmptyState
          title="Aún no hay movimientos"
          description="Cuando registres ventas, abonos o gastos aparecerán aquí en orden cronológico."
        />
      </Card>

      <Card>
        <SectionHeader title="Resumen de la semana" subtitle="Garrafones vendidos por día" />
        <View style={styles.weekPlaceholder}>
          <TrendingUp size={28} color={theme.accent} />
        </View>
        <EmptyState
          title="Sin datos semanales"
          description="Esta gráfica se llenará con las ventas reales de Firestore."
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.one,
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
  weekPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
