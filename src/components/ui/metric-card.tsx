import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Card } from './card';
import { AppText } from './text';

type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'danger';

export function MetricCard({
  label,
  value,
  icon,
  tone = 'primary',
  hint,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>{icon}</View>
      <AppText variant="caption" tone="secondary" numberOfLines={2}>
        {label}
      </AppText>
      <AppText variant="amount" style={{ color: theme[tone] }}>
        {value}
      </AppText>
      {hint ? (
        <AppText variant="caption" tone="secondary">
          {hint}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
