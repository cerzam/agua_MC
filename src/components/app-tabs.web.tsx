import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

/** Navegación alternativa para web; en móvil se usa la barra nativa. */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" style={styles.tab}>
          Inicio
        </TabTrigger>
        <TabTrigger name="ventas" href="/ventas" style={styles.tab}>
          Ventas
        </TabTrigger>
        <TabTrigger name="clientes" href="/clientes" style={styles.tab}>
          Clientes
        </TabTrigger>
        <TabTrigger name="estadisticas" href="/estadisticas" style={styles.tab}>
          Estadísticas
        </TabTrigger>
        <TabTrigger name="configuracion" href="/configuracion" style={styles.tab}>
          Configuración
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
  },
  tabList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.two,
  },
  tab: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
