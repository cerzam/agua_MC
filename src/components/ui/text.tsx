import { Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'title' | 'heading' | 'body' | 'caption' | 'label' | 'amount';
type Tone = 'default' | 'secondary' | 'primary' | 'onPrimary' | 'success' | 'danger';

const VARIANT_STYLES: Record<Variant, { fontSize: number; lineHeight: number; fontWeight: '400' | '500' | '600' | '700' }> = {
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 17, fontWeight: '600' },
  amount: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
};

export type AppTextProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
};

export function AppText({ variant = 'body', tone = 'default', style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const toneColor: Record<Tone, string> = {
    default: theme.text,
    secondary: theme.textSecondary,
    primary: theme.primary,
    onPrimary: theme.textOnPrimary,
    success: theme.success,
    danger: theme.danger,
  };

  return (
    <Text
      style={[
        { color: toneColor[tone] ?? Colors.light.text },
        VARIANT_STYLES[variant],
        style,
      ]}
      {...rest}
    />
  );
}
