import { Check, Plus, UserRound, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useCustomers } from '@/hooks/use-customers';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import { createCustomer } from '@/services/customers.service';
import type { Customer } from '@/types/models';

export function CustomerPicker({
  visible,
  selectedId,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedId?: string | null;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}) {
  const theme = useTheme();
  const { uid } = useAuth();
  const { customers, loading } = useCustomers();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!uid || !name.trim() || creating) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const customer = await createCustomer(uid, { name, phone: null, notes: null });
      setName('');
      onSelect(customer);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear el cliente.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <AppText variant="heading">Seleccionar cliente</AppText>
          <Pressable accessibilityLabel="Cerrar" onPress={onClose} hitSlop={12}>
            <X size={22} color={theme.textSecondary} />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={styles.loading} />
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <AppText variant="caption" tone="secondary">
                Aún no hay clientes. Puedes crear uno aquí mismo.
              </AppText>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => onSelect(item)}
                style={[styles.customerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
                  <UserRound size={18} color={theme.primary} />
                </View>
                <View style={styles.customerInfo}>
                  <AppText variant="label">{item.name}</AppText>
                  <AppText variant="caption" tone="secondary">
                    {item.balanceCents > 0
                      ? `Saldo ${formatCurrency(item.balanceCents)}`
                      : 'Sin saldo'}
                  </AppText>
                </View>
                {selectedId === item.id ? <Check size={18} color={theme.success} /> : null}
              </Pressable>
            )}
          />
        )}

        <View style={[styles.createBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="label" tone="primary">
            Nuevo cliente
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre del cliente"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          />
          {error ? (
            <AppText variant="caption" tone="danger">
              {error}
            </AppText>
          ) : null}
          <Button
            label="Crear y seleccionar"
            icon={<Plus size={16} color={theme.textOnPrimary} />}
            loading={creating}
            disabled={!name.trim()}
            onPress={handleCreate}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  loading: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  createBox: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
  },
});
