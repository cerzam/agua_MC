# ETAPA 3 — Clientes

Ficha completa de clientes conectada a Firestore. El saldo **nunca se escribe desde la UI**: se
deriva de las ventas fiadas y los abonos registrados en etapas anteriores.

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/clientes` | Lista con búsqueda por nombre/teléfono, total de clientes, clientes con saldo e importe por cobrar |
| `/clientes/nuevo` | Alta de cliente |
| `/clientes/[id]` | Ficha: datos de contacto, saldo, compras, cobros y acciones rápidas |
| `/clientes/[id]/editar` | Edición de nombre, teléfono y notas |

## Acciones desde la ficha

- **Venta fiada**: abre `/ventas/nueva` con el cliente preseleccionado y el tipo `unpaid`.
- **Abono**: abre `/abonos/nuevo` con el cliente preseleccionado (se desactiva si no hay saldo).
- **Editar**: modifica sólo datos de contacto; el saldo se mantiene intacto.

## Cambios de código

- `services/customers.service.ts`: `getCustomer` y `updateCustomer` (usa `updateDoc`, respeta las reglas y no toca `balanceCents`).
- `components/customers/customer-form.tsx`: formulario reutilizable de alta/edición con ID generado en la UI.
- `components/sales/sale-form.tsx`: acepta `initialCustomerId` e `initialKind` para ventas iniciadas desde una ficha.
- `app/ventas/nueva.tsx`: lee esos parámetros de la URL.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform ios
npx expo export --platform android
```

## Cómo probar

1. En **Clientes**, pulsa **Nuevo** y crea un cliente (sin saldo inicial).
2. Abre su ficha y pulsa **Venta fiada**: el cliente debe aparecer preseleccionado y el tipo `Fiada`.
3. Guarda la venta; vuelve a la ficha: debe aparecer en **Ventas** y el saldo debe aumentar.
4. Pulsa **Abono**, registra un importe menor al saldo; la ficha debe reflejar el cobro y el saldo reducido.
5. Pulsa **Editar**, cambia teléfono/notas y guarda: el saldo no debe cambiar.
6. Busca al cliente desde la lista por nombre y por teléfono.
