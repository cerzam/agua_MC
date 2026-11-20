import { router, useLocalSearchParams } from 'expo-router';
import { HandCoins, Pencil, ShoppingCart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import { getCustomer } from '@/services/customers.service';
import { listPayments } from '@/services/payments.service';
import { listSales } from '@/services/sales.service';
import type { Customer, Payment, Sale } from '@/types/models';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(timestamp: { toDate: () => Date } | undefined): string {
  const date = timestamp?.toDate?.() ?? new Date(0);
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ClienteDetalleScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const customerId = firstParam(params.id);
  const { uid } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !customerId) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const [foundCustomer, foundSales, foundPayments] = await Promise.all([
          getCustomer(uid, customerId),
          listSales(uid, { customerId }),
          listPayments(uid, { customerId }),
        ]);
        if (active) {
          setCustomer(foundCustomer);
          setSales(foundSales);
          setPayments(foundPayments);
          setError(null);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo cargar la ficha.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [uid, customerId]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.stateBox}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !customer || !customerId) {
    return (
      <Screen>
        <Card style={styles.stateBox}>
          <AppText variant="heading">{error ? 'No se pudo cargar la ficha' : 'Cliente no encontrado'}</AppText>
          <AppText variant="caption" tone="secondary">
            {error ?? 'El cliente pudo haber dejado de existir en tu cuenta.'}
          </AppText>
          <Button label="Volver a clientes" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  const salesCents = sales.reduce((sum, sale) => sum + sale.totalCents, 0);
  const paidCents = payments.reduce((sum, payment) => sum + payment.amountCents, 0);

  return (
    <Screen>
      <Card style={styles.profileCard}>
        <AppText variant="heading">{customer.name}</AppText>
        {customer.phone ? (
          <AppText variant="caption" tone="secondary">Tel. {customer.phone}</AppText>
        ) : null}
        {customer.notes ? (
          <AppText variant="caption" tone="secondary">{customer.notes}</AppText>
        ) : null}
        <View style={[styles.balanceBox, { backgroundColor: theme.surfaceMuted }]}>
          <AppText variant="caption" tone="secondary">Saldo pendiente</AppText>
          <AppText variant="amount" tone={customer.balanceCents > 0 ? 'warning' : 'success'}>
            {formatCurrency(customer.balanceCents)}
          </AppText>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          label="Venta fiada"
          icon={<ShoppingCart size={16} color={theme.textOnPrimary} />}
          style={styles.action}
          onPress={() =>
            router.push({
              pathname: '/ventas/nueva',
              params: { customerId, kind: 'unpaid' },
            })
          }
        />
        <Button
          label="Abono"
          icon={<HandCoins size={16} color={theme.textOnPrimary} />}
          style={styles.action}
          disabled={customer.balanceCents <= 0}
          onPress={() =>
            router.push({ pathname: '/abonos/nuevo', params: { customerId } })
          }
        />
        <Button
          label="Editar"
          variant="secondary"
          icon={<Pencil size={16} color={theme.text} />}
          style={styles.action}
          onPress={() => router.push(`/clientes/${customerId}/editar`)}
        />
      </View>

      <View style={styles.summary}>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">Compras</AppText>
          <AppText variant="label" tone="primary">{formatCurrency(salesCents)}</AppText>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">Cobrado</AppText>
          <AppText variant="label" tone="success">{formatCurrency(paidCents)}</AppText>
        </View>
      </View>

      <Card>
        <SectionHeader title="Ventas" subtitle={`${sales.length} registro(s)`} />
        {sales.length > 0 ? (
          <View style={styles.list}>
            {sales.map((sale) => (
              <View key={sale.id} style={styles.row}>
                <View style={styles.rowInfo}>
                  <AppText variant="label">
                    {sale.quantity} garrafón{sale.quantity === 1 ? '' : 'es'}
                  </AppText>
                  <AppText variant="caption" tone="secondary">{formatDate(sale.createdAt)}</AppText>
                </View>
                <AppText variant="label" tone="primary">{formatCurrency(sale.totalCents)}</AppText>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState title="Sin ventas registradas" />
        )}
      </Card>

      <Card>
        <SectionHeader title="Cobros y abonos" subtitle={`${payments.length} movimiento(s)`} />
        {payments.length > 0 ? (
          <View style={styles.list}>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.row}>
                <View style={styles.rowInfo}>
                  <AppText variant="label">
                    {payment.type === 'sale_payment' ? 'Cobro de venta' : 'Abono recibido'}
                  </AppText>
                  <AppText variant="caption" tone="secondary">{formatDate(payment.createdAt)}</AppText>
                </View>
                <AppText variant="label" tone="success">{formatCurrency(payment.amountCents)}</AppText>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState title="Sin cobros registrados" />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  profileCard: {
    gap: Spacing.one,
  },
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.one,
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
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  rowInfo: {
    flex: 1,
    gap: Spacing.half,
  },
});
