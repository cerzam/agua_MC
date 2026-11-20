import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ClienteDetalleLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Ficha del cliente' }} />
      <Stack.Screen name="editar" options={{ title: 'Editar cliente' }} />
    </Stack>
  );
}
