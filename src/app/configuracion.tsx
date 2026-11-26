import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PeriodFilter } from '@/components/ui/period-filter';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useBusinessSettings } from '@/hooks/use-business-settings';
import { useTheme } from '@/hooks/use-theme';
import { centsToInput, formatCurrency, parseAmountToCents } from '@/lib/money';
import type { Appearance, BusinessSettings, BusinessSettingsInput, DateFormat } from '@/types/models';

const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: 'dd/MM/yyyy', label: '31/12/2026' },
  { value: 'yyyy-MM-dd', label: '2026-12-31' },
  { value: 'MM/dd/yyyy', label: '12/31/2026' },
];

const APPEARANCE_OPTIONS: { value: Appearance; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
    </View>
  );
}

function SettingsForm({
  settings,
  saveSettings,
}: {
  settings: BusinessSettings;
  saveSettings: (input: BusinessSettingsInput) => Promise<boolean>;
}) {
  const theme = useTheme();
  const [name, setName] = useState(settings.businessName);
  const [price, setPrice] = useState(centsToInput(settings.pricePerBottleCents));
  const [dateFormat, setDateFormat] = useState<DateFormat>(settings.dateFormat);
  const [appearance, setAppearance] = useState<Appearance>(settings.appearance);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSave() {
    setFormError(null);
    const priceCents = parseAmountToCents(price);
    if (!name.trim()) {
      setFormError('Escribe el nombre del negocio.');
      return;
    }
    if (priceCents === null || priceCents <= 0) {
      setFormError('Escribe un precio mayor que cero.');
      return;
    }
    if (saving) {
      return;
    }

    setSaving(true);
    const saved = await saveSettings({
      businessName: name.trim(),
      pricePerBottleCents: priceCents,
      currency: settings.currency,
      dateFormat,
      appearance,
    });
    setSaving(false);

    if (saved) {
      Alert.alert('Configuración guardada', 'Los cambios quedaron guardados en tu cuenta.');
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
  ];

  return (
    <>
      <Card style={styles.card}>
        <AppText variant="label" tone="primary">
          Negocio
        </AppText>

        <Field label="Nombre">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Agua MC"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
        </Field>

        <Field label="Precio por garrafón">
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="25.00"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
          <AppText variant="caption" tone="secondary">
            Las ventas ya registradas conservan su precio histórico.
          </AppText>
        </Field>

        <View style={styles.readOnlyRow}>
          <AppText variant="label">Moneda</AppText>
          <AppText variant="caption" tone="secondary">
            {settings.currency} (única moneda soportada)
          </AppText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" tone="primary">
          Preferencias
        </AppText>

        <Field label="Formato de fecha">
          <PeriodFilter options={DATE_FORMAT_OPTIONS} value={dateFormat} onChange={setDateFormat} />
        </Field>

        <Field label="Apariencia">
          <PeriodFilter options={APPEARANCE_OPTIONS} value={appearance} onChange={setAppearance} />
          <AppText variant="caption" tone="secondary">
            El cambio se aplica a toda la app al guardar.
          </AppText>
        </Field>
      </Card>

      {formError ? (
        <Card>
          <AppText variant="caption" tone="danger">
            {formError}
          </AppText>
        </Card>
      ) : null}

      <Button label="Guardar cambios" loading={saving} onPress={() => void handleSave()} />

      <Card>
        <AppText variant="caption" tone="secondary">
          Precio actual guardado: {formatCurrency(settings.pricePerBottleCents, settings.currency)}.
          Los datos están protegidos por reglas de Firestore por usuario.
        </AppText>
      </Card>
    </>
  );
}

export default function ConfiguracionScreen() {
  const theme = useTheme();
  const { settings, loading, error, saveSettings } = useBusinessSettings();

  return (
    <Screen>
      <SectionHeader title="Configuración" subtitle="Datos guardados en tu cuenta" />

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

      {settings ? <SettingsForm settings={settings} saveSettings={saveSettings} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  stateCard: {
    alignItems: 'center',
    gap: Spacing.two,
  },
});
