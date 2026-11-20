import { HandCoins, Receipt, ShoppingCart } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import type { DashboardMovement } from '@/services/dashboard.service';

import { AppText } from './text';

export function MovementRow({ movement }: { movement: DashboardMovement }) {
  const theme = useTheme();
  const isExpense = movement.kind === 'expense';
  const color = isExpense ? theme.danger : movement.kind === 'payment' ? theme.success : theme.primary;

  const Icon = movement.kind === 'sale'
    ? ShoppingCart
    : movement.kind === 'payment'
      ? HandCoins
      : Receipt;

  const time = movement.date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
        <Icon size={18} color={color} />
      </View>
      <View style={styles.info}>
        <AppText variant="label" numberOfLines={1}>
          {movement.title}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {movement.detail} · {time}
        </AppText>
      </View>
      <AppText variant="label" tone={isExpense ? 'danger' : 'success'} style={styles.amount}>
        {isExpense ? '−' : '+'}
        {formatCurrency(movement.amountCents)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  amount: {
    flexShrink: 0,
  },
});
