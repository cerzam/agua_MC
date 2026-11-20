import { Platform, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Contenedor base con borde y sombra sutil, consistente en toda la app. */
export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: Radius.md,
          borderWidth: 1,
          padding: Spacing.three,
          ...Platform.select({
            ios: {
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: { elevation: 2 },
            default: {},
          }),
        },
        style,
      ]}
      {...rest}
    />
  );
}
