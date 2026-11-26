import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PeriodFilter } from '@/components/ui/period-filter';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useDateFormat } from '@/hooks/use-date-format';
import { useExpenses, type ExpensesPeriod } from '@/hooks/use-expenses';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import { deleteExpense } from '@/services/expenses.service';
import type { Expense } from '@/types/models';

const PERIOD_OPTIONS: { value: ExpensesPeriod; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'all', label: 'Todo' },
];

export default function GastosScreen() {
  const theme = useTheme();
  const formatDate = useDateFormat();
  const { uid } = useAuth();
  const [period, setPeriod] = useState<ExpensesPeriod>('month');
  const { expenses, loading, error, reload } = useExpenses(period);
  const [deleting, setDeleting] = useState(false);

  const totalCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  const handleDelete = (expense: Expense) => {
    if (!uid || deleting) {
      return;
    }
    Alert.alert(
      'Eliminar gasto',
      `¿Quieres eliminar «${expense.concept}» por ${formatCurrency(expense.amountCents)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteExpense(uid, expense.id);
              await reload();
            } catch (caught) {
              Alert.alert(
                'No se pudo eliminar',
                caught instanceof Error ? caught.message : 'Intenta de nuevo.',
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.titleRow}>
        <SectionHeader title="Historial de gastos" subtitle="Egresos del negocio" />
        <Button
          label="Nuevo"
          onPress={() => router.push('/gastos/nuevo')}
          style={styles.newButton}
        />
      </View>

      <PeriodFilter options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

      <View style={[styles.totalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <AppText variant="caption" tone="secondary">Total del periodo</AppText>
        <AppText variant="amount" tone="danger">{formatCurrency(totalCents)}</AppText>
      </View>

      {error ? (
        <Card style={styles.stateBox}>
          <AppText variant="heading">No se pudieron cargar los gastos</AppText>
          <AppText variant="caption" tone="secondary">{error}</AppText>
          <Button label="Reintentar" onPress={() => void reload()} />
        </Card>
      ) : loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : expenses.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin gastos en este periodo"
            description="Registra la gasolina, compras o servicios con el botón «Nuevo»."
          />
        </Card>
      ) : (
        <Card style={styles.list}>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.row}>
              <View style={styles.rowInfo}>
                <AppText variant="label" numberOfLines={1}>{expense.concept}</AppText>
                <AppText variant="caption" tone="secondary">
                  {expense.category} · {formatDate(expense.createdAt, false)}
                </AppText>
              </View>
              <AppText variant="label" tone="danger">
                −{formatCurrency(expense.amountCents)}
              </AppText>
              <Pressable
                accessibilityLabel={`Eliminar ${expense.concept}`}
                onPress={() => handleDelete(expense)}
                disabled={deleting}
                hitSlop={8}
                style={styles.deleteButton}>
                <Trash2 size={18} color={theme.danger} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}
    </Screen>
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
  totalCard: {
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  list: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  rowInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  deleteButton: {
    padding: Spacing.one,
  },
  stateBox: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
});
