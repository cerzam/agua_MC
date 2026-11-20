import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AppGate } from '@/components/app-gate';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/hooks/use-auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const routerTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider value={routerTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <AppGate>
          <AppTabs />
        </AppGate>
      </ThemeProvider>
    </AuthProvider>
  );
}
