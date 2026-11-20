import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

/** Pila propia dentro de la pestaña Ventas: historial → alta / detalle. */
export default function VentasLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Ventas' }} />
      <Stack.Screen name="nueva" options={{ title: 'Nueva venta' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle de venta' }} />
    </Stack>
  );
}
