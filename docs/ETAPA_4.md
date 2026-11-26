# ETAPA 4 — Estadísticas

Pantalla `/estadisticas` con indicadores reales de Firestore. No hay cifras de ejemplo: todo se
agrega desde las colecciones `sales`, `payments` y `expenses` del usuario autenticado.

## Filtros

| Periodo | Rango |
| --- | --- |
| Hoy | Desde el inicio del día hasta ahora |
| Semana | Lunes a domingo de la semana actual |
| Mes | Primero al último día del mes actual |
| Todo | Todo el historial (comparación desactivada) |
| Personalizado | Dos fechas `AAAA-MM-DD` introducidas por el usuario |

El botón **Aplicar periodo** valida el formato y que la fecha inicial no sea mayor que la final.

## Indicadores

- **Ventas generadas**: suma de `totalCents`, con garrafones y número de ventas.
- **Dinero cobrado**: suma de `amountCents` de `payments` en el periodo.
- **Deuda pendiente**: saldo de todas las ventas fiadas hasta la fecha final del periodo.
- **Gastos pagados**: suma de `expenses` en el periodo.
- **Caja estimada**: cobrado menos gastos.
- **Promedio diario**, **mejor día** y comparación porcentual contra el periodo anterior inmediato.

## Gráfica

`components/statistics/sales-chart.tsx` dibuja barras con `View` (sin módulos nativos), por lo que
funciona igual en Expo Go, iOS, Android y web. Se muestran como máximo los últimos 14 días del
periodo para mantener la barra legible en pantallas pequeñas.

## Cambios de código

- `services/statistics.service.ts`: construcción de rangos, agregación y comparación.
- `hooks/use-statistics.ts`: carga reactiva al cambiar periodo o rango personalizado.
- `components/statistics/sales-chart.tsx`: gráfica de barras.
- `app/estadisticas.tsx`: filtros, métricas, comparación, gráfica y detalle.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Cómo probar

1. Registra ventas pagadas y fiadas, abonos y gastos en varios días.
2. En **Estadísticas**, cambia entre Hoy, Semana, Mes y Todo: los importes deben cambiar con el rango.
3. Elige **Personalizado**, escribe `AAAA-MM-DD` en ambos campos y pulsa **Aplicar periodo**.
4. Verifica que **Ventas generadas** coincida con la suma del historial de ventas del rango.
5. Verifica que **Dinero cobrado** incluya ventas pagadas y abonos.
6. Confirma que **Deuda pendiente** baja después de registrar un abono.
7. Revisa que la comparación contra el periodo anterior tenga sentido y que la gráfica no
   supere las 14 barras.
