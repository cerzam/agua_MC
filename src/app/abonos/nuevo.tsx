import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DebtPaymentForm } from '@/components/payments/debt-payment-form';
import { useTheme } from '@/hooks/use-theme';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function NuevoAbonoScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ customerId?: string; saleId?: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <DebtPaymentForm
        initialCustomerId={firstParam(params.customerId)}
        initialSaleId={firstParam(params.saleId)}
      />
    </SafeAreaView>
  );
}
