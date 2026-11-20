import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ClientesLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Clientes' }} />
      <Stack.Screen name="nuevo" options={{ title: 'Nuevo cliente' }} />
      {/* La ficha tiene su propio Stack interno para la pantalla de edición. */}
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
