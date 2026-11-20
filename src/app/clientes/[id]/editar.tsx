import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomerForm } from '@/components/customers/customer-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { getCustomer } from '@/services/customers.service';
import type { Customer } from '@/types/models';

export default function EditarClienteScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { uid } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !customerId) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const found = await getCustomer(uid, customerId);
        if (active) {
          setCustomer(found);
          setError(null);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo cargar el cliente.');
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

  if (error || !customer) {
    return (
      <Screen>
        <Card style={styles.stateBox}>
          <AppText variant="heading">{error ? 'No se pudo cargar' : 'Cliente no encontrado'}</AppText>
          {error ? <AppText variant="caption" tone="secondary">{error}</AppText> : null}
          <Button label="Volver" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <CustomerForm mode="edit" initial={customer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
});
