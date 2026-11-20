import { router } from 'expo-router';
import { Search, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useCustomers } from '@/hooks/use-customers';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';

export default function ClientesScreen() {
  const theme = useTheme();
  const { customers, loading, error, reload } = useCustomers();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const visible = query
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          (customer.phone?.toLowerCase().includes(query) ?? false),
      )
    : customers;

  const totalDebtCents = customers.reduce((sum, customer) => sum + customer.balanceCents, 0);
  const withDebt = customers.filter((customer) => customer.balanceCents > 0).length;

  return (
    <Screen>
      <View style={styles.titleRow}>
        <SectionHeader title="Clientes" subtitle="Fichas, saldos y historial" />
        <Button
          label="Nuevo"
          onPress={() => router.push('/clientes/nuevo')}
          style={styles.newButton}
        />
      </View>

      <View style={styles.summary}>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">Clientes</AppText>
          <AppText variant="heading" tone="primary">{customers.length}</AppText>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">Con saldo</AppText>
          <AppText variant="heading" tone="warning">{withDebt}</AppText>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="caption" tone="secondary">Por cobrar</AppText>
          <AppText variant="body" tone="warning" numberOfLines={1}>
            {formatCurrency(totalDebtCents)}
          </AppText>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Search size={18} color={theme.textSecondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o teléfono"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      {error ? (
        <Card style={styles.stateBox}>
          <AppText variant="heading">No se pudieron cargar los clientes</AppText>
          <AppText variant="caption" tone="secondary">{error}</AppText>
          <Button label="Reintentar" onPress={() => void reload()} />
        </Card>
      ) : loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UserRound size={28} color={theme.accent} />}
            title={query ? 'Sin resultados' : 'Aún no hay clientes'}
            description={
              query
                ? 'Prueba con otro nombre o teléfono.'
                : 'Crea tu primer cliente para registrar ventas fiadas y abonos.'
            }
          />
        </Card>
      ) : (
        <Card style={styles.list}>
          {visible.map((customer) => (
            <Pressable
              key={customer.id}
              accessibilityRole="button"
              onPress={() => router.push(`/clientes/${customer.id}`)}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
                <UserRound size={18} color={theme.primary} />
              </View>
              <View style={styles.rowInfo}>
                <AppText variant="label" numberOfLines={1}>{customer.name}</AppText>
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {customer.phone || 'Sin teléfono'}
                </AppText>
              </View>
              <AppText
                variant="label"
                tone={customer.balanceCents > 0 ? 'warning' : 'secondary'}
                numberOfLines={1}>
                {customer.balanceCents > 0 ? formatCurrency(customer.balanceCents) : 'Al corriente'}
              </AppText>
            </Pressable>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    minHeight: 46,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  stateBox: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
});
