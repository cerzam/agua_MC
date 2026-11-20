import { BarChart3 } from 'lucide-react-native';

import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';

export default function EstadisticasScreen() {
  return (
    <Screen>
      <SectionHeader
        title="Estadísticas"
        subtitle="Ventas, cobros y gastos por periodo"
      />
      <ModulePlaceholder
        icon={<BarChart3 size={28} color="#0B69D6" />}
        title="Módulo de estadísticas en preparación"
        description="Los indicadores distinguirán entre ventas generadas, dinero cobrado, deuda pendiente y gastos pagados."
        upcoming={[
          'Filtros de hoy, semana, mes y periodo personalizado',
          'Gráfica de barras de ventas por día',
          'Promedio diario y día con mayores ventas',
          'Comparación entre periodos y caja estimada',
        ]}
      />
    </Screen>
  );
}
