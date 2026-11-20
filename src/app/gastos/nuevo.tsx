import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpenseForm } from '@/components/expenses/expense-form';
import { useTheme } from '@/hooks/use-theme';

export default function NuevoGastoScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <ExpenseForm />
    </SafeAreaView>
  );
}
