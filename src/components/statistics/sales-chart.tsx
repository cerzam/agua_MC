import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import type { StatsBucket } from '@/services/statistics.service';

/** Barras simples con Views: funciona igual en iOS, Android y web sin módulos nativos. */
export function SalesChart({ buckets, currency }: { buckets: StatsBucket[]; currency: string }) {
  const theme = useTheme();
  const maxCents = Math.max(...buckets.map((bucket) => bucket.totalCents), 1);
  const showEveryLabel = buckets.length > 7 ? 2 : 1;

  return (
    <View style={styles.chart}>
      <View style={styles.bars}>
        {buckets.map((bucket, index) => {
          const height = Math.max(4, Math.round((bucket.totalCents / maxCents) * 100));
          return (
            <View key={`${bucket.label}-${index}`} style={styles.column}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: bucket.totalCents > 0 ? theme.primary : theme.border,
                    },
                  ]}
                />
              </View>
              {index % showEveryLabel === 0 ? (
                <AppText variant="label" tone="secondary" numberOfLines={1} style={styles.label}>
                  {bucket.label}
                </AppText>
              ) : (
                <View style={styles.labelSpacer} />
              )}
            </View>
          );
        })}
      </View>
      <AppText variant="caption" tone="secondary">
        Máximo del periodo: {formatCurrency(maxCents, currency)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    gap: Spacing.two,
  },
  bars: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  column: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: Spacing.one,
  },
  track: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
  },
  label: {
    fontSize: 10,
  },
  labelSpacer: {
    height: 15,
  },
});
