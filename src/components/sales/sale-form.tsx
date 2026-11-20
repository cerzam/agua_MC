import { useRouter } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { useRef, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CustomerPicker } from '@/components/customers/customer-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useCustomers } from '@/hooks/use-customers';
import { useTheme } from '@/hooks/use-theme';
import { centsToInput, formatCurrency, parseAmountToCents } from '@/lib/money';
import { newId } from '@/services/db';
import { createSale } from '@/services/sales.service';
import type { Customer } from '@/types/models';

type SaleKind = 'paid' | 'unpaid';

export function SaleForm({
  initialCustomerId,
  initialKind,
}: {
  initialCustomerId?: string;
  initialKind?: 'paid' | 'unpaid';
} = {}) {
  const theme = useTheme();
  const router = useRouter();
  const { uid } = useAuth();
  const { settings } = useBusinessSettings();
  const { customers } = useCustomers();

  const mutationId = useRef(newId('sales')).current;
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [kind, setKind] = useState<SaleKind>(initialKind === 'unpaid' ? 'unpaid' : 'paid');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El cliente preseleccionado se deriva de la carga asíncrona, sin efecto que fuerce renders.
  const customer =
    selectedCustomer ??
    (initialCustomerId ? customers.find((item) => item.id === initialCustomerId) ?? null : null);

  const effectivePrice = unitPrice.trim() !== '' || !settings
    ? unitPrice
    : centsToInput(settings.pricePerBottleCents);
  const parsedQuantity = Number(quantity);
  const priceCents = parseAmountToCents(effectivePrice);
  const totalCents =
    Number.isInteger(parsedQuantity) && parsedQuantity > 0 && priceCents && priceCents > 0
      ? parsedQuantity * priceCents
      : 0;

  const handleSubmit = () => {
    setError(null);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError('La cantidad debe ser un número entero positivo.');
      return;
    }
    if (!priceCents || priceCents <= 0) {
      setError('El precio unitario debe ser mayor que cero.');
      return;
    }
    if (kind === 'unpaid' && !customer) {
      setError('Las ventas fiadas necesitan un cliente. Selecciona o crea uno.');
      return;
    }
    if (!uid) {
      return;
    }

    const typeLabel = kind === 'paid' ? 'pagada' : 'fiada';
    Alert.alert(
      'Confirmar venta',
      `${parsedQuantity} garrafón(es) · ${formatCurrency(totalCents, settings?.currency)}\n${typeLabel}${customer ? ` · ${customer.name}` : ''}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Guardar', onPress: () => void save(parsedQuantity, priceCents) },
      ],
    );
  };

  const save = async (qty: number, unitCents: number) => {
    if (!uid || saving) {
      return;
    }
    setSaving(true);
    try {
      await createSale(uid, {
        id: mutationId,
        customerId: customer?.id ?? null,
        customerName: customer?.name ?? null,
        quantity: qty,
        unitPriceCents: unitCents,
        paymentStatus: kind,
      });
      Alert.alert('Venta registrada', 'El movimiento ya quedó guardado.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar la venta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <AppText variant="label" tone="primary">
          Detalles de la venta
        </AppText>

        <Field label="Cantidad de garrafones">
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          />
        </Field>

        <Field
          label="Precio unitario"
          hint={settings ? `Precio actual: ${formatCurrency(settings.pricePerBottleCents, settings.currency)}` : undefined}>
          <TextInput
            value={effectivePrice}
            onChangeText={setUnitPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          />
        </Field>

        <View style={[styles.totalBox, { borderTopColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">
            Total calculado
          </AppText>
          <AppText variant="amount" tone="primary">
            {formatCurrency(totalCents, settings?.currency)}
          </AppText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" tone="primary">
          Tipo de operación
        </AppText>
        <View style={styles.segment}>
          <SegmentButton label="Pagada" selected={kind === 'paid'} onPress={() => setKind('paid')} />
          <SegmentButton label="Fiada" selected={kind === 'unpaid'} onPress={() => setKind('unpaid')} />
        </View>
        <AppText variant="caption" tone="secondary">
          {kind === 'paid'
            ? 'Se registra el cobro en el historial.'
            : 'Genera deuda; requiere un cliente y aumenta su saldo.'}
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" tone="primary">
          Cliente {kind === 'paid' ? '(opcional)' : '(obligatorio)'}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPickerVisible(true)}
          style={[styles.picker, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <UserRound size={18} color={theme.primary} />
          <AppText variant="body" tone={customer ? 'default' : 'secondary'}>
            {customer?.name ?? 'Seleccionar cliente'}
          </AppText>
        </Pressable>
      </Card>

      {error ? (
        <Card>
          <AppText variant="caption" tone="danger">
            {error}
          </AppText>
        </Card>
      ) : null}

      <Button label="Guardar venta" loading={saving} onPress={handleSubmit} />

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

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
      {hint ? (
        <AppText variant="caption" tone="secondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.segmentButton,
        { backgroundColor: selected ? theme.primary : theme.surface },
      ]}>
      <AppText variant="label" style={{ color: selected ? theme.textOnPrimary : theme.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  card: { gap: Spacing.three },
  field: { gap: Spacing.one },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  picker: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
  },
});
