import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Card } from './card';
import { AppText } from './text';

/**
 * Estado honesto para los módulos que aún no tienen lógica de negocio.
 * No muestra botones simulados: sólo comunica qué llegará en las siguientes etapas.
 */
export function ModulePlaceholder({
  icon,
  title,
  description,
  upcoming,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  upcoming: string[];
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>{icon}</View>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" tone="secondary" style={styles.description}>
        {description}
      </AppText>

      <Card>
        <AppText variant="label" tone="primary">
          Próximas funciones
        </AppText>
        <View style={styles.list}>
          {upcoming.map((item) => (
            <View key={item} style={styles.listItem}>
              <View style={[styles.dot, { backgroundColor: theme.accent }]} />
              <AppText variant="caption">{item}</AppText>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Spacing.one,
  },
  description: {
    marginBottom: Spacing.two,
  },
  list: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    marginTop: 7,
  },
});
