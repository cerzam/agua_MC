import { ShoppingCart } from 'lucide-react-native';

import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';

export default function VentasScreen() {
  return (
    <Screen>
      <SectionHeader
        title="Ventas"
        subtitle="Registro e historial de garrafones"
      />
      <ModulePlaceholder
        icon={<ShoppingCart size={28} color="#0B69D6" />}
        title="Módulo de ventas en preparación"
        description="Aquí se registrarán las ventas pagadas y fiadas, con validaciones y precios históricos."
        upcoming={[
          'Registro rápido de garrafones y precio unitario',
          'Ventas pagadas con su movimiento de cobro',
          'Ventas fiadas vinculadas a un cliente',
          'Historial con filtros por fecha y detalle de venta',
        ]}
      />
    </Screen>
  );
}
