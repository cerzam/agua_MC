import { View, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

import { AppText } from './text';

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.container}>
      <AppText variant="heading">{title}</AppText>
      {subtitle ? (
        <AppText variant="caption" tone="secondary">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.half,
  },
});
