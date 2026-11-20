import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AbonosLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="nuevo" options={{ title: 'Registrar abono' }} />
    </Stack>
  );
}
