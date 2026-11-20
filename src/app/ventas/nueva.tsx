import { SafeAreaView } from 'react-native-safe-area-context';

import { SaleForm } from '@/components/sales/sale-form';
import { useTheme } from '@/hooks/use-theme';

export default function NuevaVentaScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <SaleForm />
    </SafeAreaView>
  );
}
