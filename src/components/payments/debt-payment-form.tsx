import { useRouter } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CustomerPicker } from '@/components/customers/customer-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useCustomers } from '@/hooks/use-customers';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, parseAmountToCents } from '@/lib/money';
import { newId } from '@/services/db';
import { createDebtPayment } from '@/services/payments.service';
import type { Customer } from '@/types/models';

export function DebtPaymentForm({
  initialCustomerId,
  initialSaleId,
}: {
  initialCustomerId?: string;
  initialSaleId?: string;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { uid } = useAuth();
  const { customers } = useCustomers();
  const mutationId = useRef(newId('payments')).current;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customer =
    selectedCustomer ??
    (initialCustomerId ? customers.find((item) => item.id === initialCustomerId) ?? null : null);
  const amountCents = parseAmountToCents(amount);
  const balanceCents = customer?.balanceCents ?? 0;

  const handleSubmit = () => {
    setError(null);
    if (!customer) {
      setError('Selecciona el cliente que realiza el abono.');
      return;
    }
    if (!amountCents || amountCents <= 0) {
      setError('El importe debe ser mayor que cero.');
      return;
    }
    if (amountCents > balanceCents) {
      setError(`El abono supera el saldo pendiente de ${formatCurrency(balanceCents)}.`);
      return;
    }
    if (!uid) {
      return;
    }

    Alert.alert(
      'Confirmar abono',
      `${customer.name} · ${formatCurrency(amountCents)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Guardar', onPress: () => void save(amountCents) },
      ],
    );
  };

  const save = async (cents: number) => {
    if (!uid || !customer || saving) {
      return;
    }
    setSaving(true);
    try {
      await createDebtPayment(uid, {
        id: mutationId,
        customerId: customer.id,
        saleId: initialSaleId ?? null,
        amountCents: cents,
      });
      Alert.alert('Abono registrado', 'El saldo del cliente se actualizó.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el abono.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <AppText variant="label" tone="primary">Cliente</AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPickerVisible(true)}
          style={[styles.picker, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <UserRound size={18} color={theme.primary} />
          <AppText variant="body" tone={customer ? 'default' : 'secondary'}>
            {customer?.name ?? 'Seleccionar cliente'}
          </AppText>
        </Pressable>
        <View style={styles.balanceBox}>
          <AppText variant="caption" tone="secondary">Saldo pendiente</AppText>
          <AppText variant="label" tone="warning">{formatCurrency(balanceCents)}</AppText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" tone="primary">Importe del abono</AppText>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
        />
        <AppText variant="caption" tone="secondary">
          {initialSaleId
            ? 'El abono se vinculará a la venta desde la que lo iniciaste.'
            : 'Se aplicará al saldo general del cliente.'}
        </AppText>
      </Card>

      {error ? (
        <Card>
          <AppText variant="caption" tone="danger">{error}</AppText>
        </Card>
      ) : null}

      <Button label="Guardar abono" loading={saving} onPress={handleSubmit} />

      <CustomerPicker
        visible={pickerVisible}
        selectedId={customer?.id}
        onClose={() => setPickerVisible(false)}
        onSelect={(selected) => {
          setSelectedCustomer(selected);
          setPickerVisible(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  card: { gap: Spacing.two },
  picker: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
  },
  balanceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
  },
});
