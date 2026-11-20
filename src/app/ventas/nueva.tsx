import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SaleForm } from '@/components/sales/sale-form';
import { useTheme } from '@/hooks/use-theme';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function NuevaVentaScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ customerId?: string; kind?: string }>();
  const customerId = firstParam(params.customerId);
  const kind = firstParam(params.kind);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <SaleForm
        initialCustomerId={customerId}
        initialKind={kind === 'unpaid' ? 'unpaid' : kind === 'paid' ? 'paid' : undefined}
      />
    </SafeAreaView>
  );
}
