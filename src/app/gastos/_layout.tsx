import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

/** Gastos vive fuera de las pestañas y se presenta como pila completa. */
export default function GastosLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Gastos' }} />
      <Stack.Screen name="nuevo" options={{ title: 'Nuevo gasto' }} />
    </Stack>
  );
}
