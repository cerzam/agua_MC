import { useRouter } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import { newId } from '@/services/db';
import { createCustomer, updateCustomer } from '@/services/customers.service';
import type { Customer } from '@/types/models';

export function CustomerForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Customer;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { uid } = useAuth();
  const mutationId = useRef(newId('customers')).current;

  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!name.trim()) {
      setError('Escribe el nombre del cliente.');
      return;
    }
    if (!uid) {
      return;
    }

    const input = { name: name.trim(), phone: phone.trim() || null, notes: notes.trim() || null };

    if (mode === 'edit' && initial) {
      Alert.alert('Guardar cambios', `Se actualizará la ficha de ${initial.name}.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Guardar', onPress: () => void save(input) },
      ]);
      return;
    }
    void save(input);
  };

  const save = async (input: { name: string; phone: string | null; notes: string | null }) => {
    if (!uid || saving) {
      return;
    }
    setSaving(true);
    try {
      if (mode === 'edit' && initial) {
        await updateCustomer(uid, initial.id, input);
        Alert.alert('Cliente actualizado', 'Los cambios quedaron guardados.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }

      const created = await createCustomer(uid, { ...input, balanceCents: 0 }, mutationId);
      Alert.alert('Cliente creado', `${created.name} ya está en tu lista.`, [
        { text: 'OK', onPress: () => router.replace(`/clientes/${created.id}`) },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el cliente.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <AppText variant="label" tone="primary">Datos del cliente</AppText>

        <Field label="Nombre">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre completo o apodo"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
        </Field>

        <Field label="Teléfono (opcional)">
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="55 1234 5678"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
        </Field>

        <Field label="Notas (opcional)">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Dirección, referencias, etc."
            placeholderTextColor={theme.textSecondary}
            style={[inputStyle, styles.multiline]}
          />
        </Field>

        {mode === 'edit' && initial ? (
          <View style={[styles.balanceBox, { backgroundColor: theme.surfaceMuted }]}>
            <AppText variant="caption" tone="secondary">Saldo actual</AppText>
            <AppText variant="label" tone={initial.balanceCents > 0 ? 'warning' : 'success'}>
              {formatCurrency(initial.balanceCents)}
            </AppText>
          </View>
        ) : (
          <AppText variant="caption" tone="secondary">
            El saldo se calculará automáticamente con las ventas fiadas y los abonos.
          </AppText>
        )}
      </Card>

      {error ? (
        <Card>
          <AppText variant="caption" tone="danger">{error}</AppText>
        </Card>
      ) : null}

      <Button label={mode === 'edit' ? 'Guardar cambios' : 'Crear cliente'} loading={saving} onPress={handleSubmit} />
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
    </View>
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
  multiline: { minHeight: 88, paddingTop: Spacing.two, textAlignVertical: 'top' },
  balanceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.two,
    borderRadius: Radius.sm,
  },
});
