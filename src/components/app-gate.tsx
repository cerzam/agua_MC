import { Droplets } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

/** Muestra carga o un estado de configuración hasta que la sesión anónima esté lista. */
export function AppGate({ children }: { children: ReactNode }) {
  const { status, error } = useAuth();
  const theme = useTheme();

  if (status === 'ready') {
    return <>{children}</>;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.center}>
        <View style={[styles.logo, { backgroundColor: theme.primarySoft }]}>
          <Droplets size={44} color={theme.primary} strokeWidth={1.8} />
        </View>
        <AppText variant="title">Agua MC</AppText>

        {status === 'loading' ? (
          <>
            <ActivityIndicator color={theme.primary} size="small" />
            <AppText variant="caption" tone="secondary">
              Preparando tu espacio de trabajo…
            </AppText>
          </>
        ) : (
          <>
            <AppText variant="heading" style={styles.title}>
              Configuración requerida
            </AppText>
            <AppText variant="body" tone="secondary" style={styles.message}>
              {error ?? 'No se pudo conectar con Firebase.'}
            </AppText>
            <View style={[styles.hint, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <AppText variant="caption" tone="primary">
                Para conectar tu proyecto:
              </AppText>
              <AppText variant="caption" tone="secondary">
                1. Copia .env.example como .env y completa los datos de tu proyecto Firebase.
              </AppText>
              <AppText variant="caption" tone="secondary">
                2. Activa la autenticación anónima y publica las reglas de Firestore.
              </AppText>
              <AppText variant="caption" tone="secondary">
                3. Reinicia con: npx expo start -c
              </AppText>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  hint: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.one,
    width: '100%',
  },
});
