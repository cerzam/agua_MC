import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomerForm } from '@/components/customers/customer-form';
import { useTheme } from '@/hooks/use-theme';

export default function NuevoClienteScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <CustomerForm mode="create" />
    </SafeAreaView>
  );
}
