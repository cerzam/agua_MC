# ETAPA 2 — Dashboard, ventas, gastos y abonos

Esta etapa conecta las operaciones diarias con Firestore. No hay datos de ejemplo: todas las
cifras se calculan a partir de los documentos del usuario autenticado.

## Rutas nuevas

| Ruta | Pantalla |
| --- | --- |
| `/` | Dashboard real: métricas de hoy, movimientos recientes, gráfica semanal y acciones rápidas |
| `/ventas` | Historial con filtros Hoy / Semana / Mes / Todo |
| `/ventas/nueva` | Registro de venta pagada o fiada |
| `/ventas/[id]` | Detalle de venta y cobros asociados |
| `/gastos` | Historial de gastos con filtros y eliminación confirmada |
| `/gastos/nuevo` | Registro de gasto |
| `/abonos/nuevo` | Registro de abono a saldo de cliente (acepta `customerId` y `saleId` por query) |

## Servicios y hooks

- `src/services/db.ts`: acceso centralizado y generación de IDs.
- `src/services/sales.service.ts`: venta pagada (venta + cobro) o fiada (venta + saldo), en transacción.
- `src/services/payments.service.ts`: abono atómico; actualiza saldo del cliente y `paidCents` de la venta.
- `src/services/expenses.service.ts`, `customers.service.ts`, `settings.service.ts`, `dashboard.service.ts`.
- `src/hooks/use-dashboard.ts`, `use-sales.ts`, `use-expenses.ts`, `use-customers.ts`: estados de carga, error y recarga.

## Seguridad

- Todo sigue bajo `users/{uid}/...` y `request.auth.uid`.
- Las ventas pagadas **sin cliente** son válidas: `customerId = null` y su cobro también.
- El historial de pagos sigue siendo inmutable; los abonos solo se crean, nunca se editan.

## Comprobaciones ejecutadas

```bash
npm run typecheck                 # OK
npm run lint                      # OK
npx expo-doctor                   # 20/20
npx expo export --platform ios    # OK
npx expo export --platform android # OK
```

## Cómo probar

1. Copia `.env.example` a `.env` y completa las variables `EXPO_PUBLIC_FIREBASE_*`.
2. Publica las reglas y los índices (ver `docs/FIREBASE_SETUP.md`) y activa la autenticación anónima.
3. Ejecuta `npx expo start -c`.
4. En **Inicio**, pulsa **Nueva venta**: registra 2 garrafones pagados sin cliente; debe aparecer en
   movimientos y en la gráfica de la semana; el cobro se guarda en `payments`.
5. Registra una venta **fiada** seleccionando o creando un cliente; su saldo debe aumentar.
6. Abre la venta fiada desde el historial y pulsa **Registrar abono**; el saldo y el estado de la
   venta deben actualizarse (parcial → pagada si se liquida).
7. Desde **Inicio → Gastos**, registra un gasto y compruébalo en el historial; elimínalo con confirmación.
8. Cambia de pestaña y vuelve a Inicio: el dashboard se recarga al enfocarse.

## Pendiente para etapas siguientes

- Clientes, estadísticas avanzadas y edición de configuración/precio desde la UI.
- Edición de gastos y ventas (por ahora solo alta, detalle y eliminación de gastos).
