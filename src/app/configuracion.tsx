import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/money';
import type { Appearance } from '@/types/models';

const APPEARANCE_LABELS: Record<Appearance, string> = {
  system: 'Según el dispositivo',
  light: 'Claro',
  dark: 'Oscuro',
};

function SettingRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="label" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

export default function ConfiguracionScreen() {
  const theme = useTheme();
  const { settings, loading, error } = useBusinessSettings();

  return (
    <Screen>
      <SectionHeader
        title="Configuración"
        subtitle="Datos guardados en tu cuenta"
      />

      {loading ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={theme.primary} />
          <AppText variant="caption" tone="secondary">
            Cargando configuración…
          </AppText>
        </Card>
      ) : null}

      {error ? (
        <Card style={styles.stateCard}>
          <AppText variant="label" tone="danger">
            No se pudo cargar la configuración
          </AppText>
          <AppText variant="caption" tone="secondary">
            {error}
          </AppText>
        </Card>
      ) : null}

      {settings ? (
        <>
          <Card style={styles.card}>
            <AppText variant="label" tone="primary">
              Negocio
            </AppText>
            <SettingRow label="Nombre" value={settings.businessName} />
            <SettingRow
              label="Precio por garrafón"
              value={formatCurrency(settings.pricePerBottleCents, settings.currency)}
            />
            <SettingRow label="Moneda" value={settings.currency} />
          </Card>

          <Card style={styles.card}>
            <AppText variant="label" tone="primary">
              Preferencias
            </AppText>
            <SettingRow label="Formato de fecha" value={settings.dateFormat} />
            <SettingRow
              label="Apariencia"
              value={APPEARANCE_LABELS[settings.appearance] ?? settings.appearance}
            />
          </Card>

          <Card style={styles.card}>
            <AppText variant="caption" tone="secondary">
              La edición de estos valores estará disponible en la etapa de configuración. El precio
              inicial es una sugerencia y se puede cambiar después.
            </AppText>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  stateCard: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
