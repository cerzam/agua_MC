import '@/global.css';

import { Platform } from 'react-native';

/**
 * Paleta institucional de Agua MC.
 * Azul como color principal, celeste como acento y fondos claros.
 */
export const Colors = {
  light: {
    primary: '#0B69D6',
    primaryDark: '#084FA6',
    primarySoft: '#E7F2FE',
    accent: '#49B4EF',
    background: '#F4F8FC',
    surface: '#FFFFFF',
    surfaceMuted: '#EDF4FB',
    border: '#D9E6F3',
    text: '#102A43',
    textSecondary: '#5D7388',
    textOnPrimary: '#FFFFFF',
    success: '#16865A',
    warning: '#B7791F',
    danger: '#C8404E',
    shadowColor: '#0B1F33',
  },
  dark: {
    primary: '#5BA9FF',
    primaryDark: '#3B8CE8',
    primarySoft: '#132A42',
    accent: '#63C4F5',
    background: '#0B1622',
    surface: '#142335',
    surfaceMuted: '#1B3049',
    border: '#29415C',
    text: '#EAF2FA',
    textSecondary: '#9DB2C6',
    textOnPrimary: '#071321',
    success: '#4BD39A',
    warning: '#F0BC63',
    danger: '#FF7B87',
    shadowColor: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const MaxContentWidth = 640;
