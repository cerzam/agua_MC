import { useRouter } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/constants/business';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, parseAmountToCents } from '@/lib/money';
import { newId } from '@/services/db';
import { createExpense } from '@/services/expenses.service';

export function ExpenseForm() {
  const theme = useTheme();
  const router = useRouter();
  const { uid } = useAuth();
  const mutationId = useRef(newId('expenses')).current;

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Gasolina');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountCents = parseAmountToCents(amount);

  const handleSubmit = () => {
    setError(null);
    if (!concept.trim()) {
      setError('Escribe el concepto del gasto.');
      return;
    }
    if (!amountCents || amountCents <= 0) {
      setError('El importe debe ser mayor que cero.');
      return;
    }
    if (!uid) {
      return;
    }

    Alert.alert(
      'Confirmar gasto',
      `${concept.trim()} · ${formatCurrency(amountCents)}\nCategoría: ${category}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Guardar', onPress: () => void save(amountCents) },
      ],
    );
  };

  const save = async (cents: number) => {
    if (!uid || saving) {
      return;
    }
    setSaving(true);
    try {
      await createExpense(uid, {
        concept: concept.trim(),
        amountCents: cents,
        category,
        description: description.trim(),
      }, mutationId);
      Alert.alert('Gasto registrado', 'El gasto quedó guardado en el historial.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el gasto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <AppText variant="label" tone="primary">
          Datos del gasto
        </AppText>

        <Field label="Concepto">
          <TextInput
            value={concept}
            onChangeText={setConcept}
            placeholder="Ej. Gasolina del reparto"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          />
        </Field>

        <Field label="Importe">
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          />
        </Field>

        <View style={styles.field}>
          <AppText variant="label">Categoría</AppText>
          <View style={styles.categories}>
            {EXPENSE_CATEGORIES.map((item) => {
              const selected = item === category;
              return (
                <Button
                  key={item}
                  label={item}
                  variant={selected ? 'primary' : 'secondary'}
                  onPress={() => setCategory(item)}
                  style={styles.categoryButton}
                />
              );
            })}
          </View>
        </View>

        <Field label="Descripción (opcional)">
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholder="Detalles adicionales"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, styles.multiline, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          />
        </Field>
      </Card>

      {error ? (
        <Card>
          <AppText variant="caption" tone="danger">
            {error}
          </AppText>
        </Card>
      ) : null}

      <Button label="Guardar gasto" loading={saving} onPress={handleSubmit} />
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
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  categoryButton: { minHeight: 40, paddingHorizontal: Spacing.two },
});
