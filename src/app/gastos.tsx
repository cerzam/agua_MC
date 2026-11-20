import { Link } from 'expo-router';
import { ArrowLeft, Receipt } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function GastosScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <Link href="/" style={[styles.backLink, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ArrowLeft size={16} color={theme.primary} />
        <AppText variant="label" tone="primary">
          Volver al inicio
        </AppText>
      </Link>

      <SectionHeader
        title="Gastos"
        subtitle="Egresos del negocio, separados de ventas y abonos"
      />
      <ModulePlaceholder
        icon={<Receipt size={28} color="#0B69D6" />}
        title="Módulo de gastos en preparación"
        description="Los gastos se guardarán en su propia colección de Firestore y no se mezclarán con cobros ni ventas."
        upcoming={[
          'Registro de concepto, importe, categoría y fecha',
          'Historial con filtros por fechas y total de gastos',
          'Edición y eliminación con confirmación',
          'Categorías: Gasolina, Mantenimiento, Compras, Servicios y Otros',
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
});
