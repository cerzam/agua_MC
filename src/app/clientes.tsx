import { Users } from 'lucide-react-native';

import { ModulePlaceholder } from '@/components/ui/module-placeholder';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';

export default function ClientesScreen() {
  return (
    <Screen>
      <SectionHeader
        title="Clientes"
        subtitle="Fichas, deudas y abonos"
      />
      <ModulePlaceholder
        icon={<Users size={28} color="#0B69D6" />}
        title="Módulo de clientes en preparación"
        description="Cada cliente tendrá su saldo calculado a partir de movimientos reales, nunca sobrescrito."
        upcoming={[
          'Alta y búsqueda de clientes',
          'Listado ordenado por saldo pendiente',
          'Ficha con compras, pagos y deuda actual',
          'Abonos parciales y liquidaciones sin exceder el saldo',
        ]}
      />
    </Screen>
  );
}
