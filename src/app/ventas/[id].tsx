import { router, useLocalSearchParams } from 'expo-router';
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
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import { listPayments } from '@/services/payments.service';
import { getSale } from '@/services/sales.service';
import type { Payment, Sale } from '@/types/models';

export default function SaleDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const saleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { uid } = useAuth();
  const { settings } = useBusinessSettings();
  const [sale, setSale] = useState<Sale | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !saleId) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const [foundSale, foundPayments] = await Promise.all([
          getSale(uid, saleId),
          listPayments(uid, { saleId }),
        ]);
        if (active) {
          setSale(foundSale);
          setPayments(foundPayments);
          setError(null);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo cargar la venta.');
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
  }, [uid, saleId]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.stateBox}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !sale) {
    return (
      <Screen>
        <Card style={styles.stateBox}>
          <AppText variant="heading">{error ? 'No se pudo cargar la venta' : 'Venta no encontrada'}</AppText>
          <AppText variant="caption" tone="secondary">
            {error ?? 'El registro pudo haber sido eliminado o no pertenece a tu cuenta.'}
          </AppText>
          <Button label="Volver al historial" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  const createdAt = sale.createdAt?.toDate?.() ?? new Date(0);
  const pendingCents = Math.max(0, sale.totalCents - (sale.paidCents ?? 0));
  const statusLabel =
    sale.paymentStatus === 'paid' ? 'Pagada' : sale.paymentStatus === 'partial' ? 'Parcial' : 'Fiada';

  return (
    <Screen>
      <Card style={styles.totalCard}>
        <AppText variant="caption" tone="secondary">Total de la venta</AppText>
        <AppText variant="title" tone="primary">{formatCurrency(sale.totalCents, settings?.currency)}</AppText>
        <AppText variant="caption" tone="secondary">
          {createdAt.toLocaleString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </AppText>
      </Card>

      <Card style={styles.details}>
        <SectionHeader title="Detalles" />
        <Detail label="Cliente" value={sale.customerName ?? 'Público general'} />
        <Detail label="Cantidad" value={`${sale.quantity} garrafón${sale.quantity === 1 ? '' : 'es'}`} />
        <Detail label="Precio unitario" value={formatCurrency(sale.unitPriceCents, settings?.currency)} />
        <Detail label="Estado" value={statusLabel} />
        <Detail label="Pagado" value={formatCurrency(sale.paidCents ?? 0, settings?.currency)} />
        <Detail
          label="Pendiente"
          value={formatCurrency(pendingCents, settings?.currency)}
          highlight={pendingCents > 0}
        />
      </Card>

      {pendingCents > 0 && sale.customerId ? (
        <Button
          label="Registrar abono"
          onPress={() =>
            router.push({
              pathname: '/abonos/nuevo',
              params: { saleId: sale.id, customerId: sale.customerId ?? '' },
            })
          }
        />
      ) : null}

      <Card>
        <SectionHeader title="Cobros de esta venta" subtitle={`${payments.length} movimiento(s)`} />
        {payments.length > 0 ? (
          <View style={styles.payments}>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.paymentRow}>
                <AppText variant="label">
                  {payment.type === 'sale_payment' ? 'Cobro de venta' : 'Abono recibido'}
                </AppText>
                <AppText variant="label" tone="success">
                  {formatCurrency(payment.amountCents, settings?.currency)}
                </AppText>
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

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
      <AppText variant="caption" tone="secondary">{label}</AppText>
      <AppText variant="label" tone={highlight ? 'danger' : 'default'}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  totalCard: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  details: {
    gap: Spacing.two,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  payments: {
    gap: Spacing.one,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
  },
});
