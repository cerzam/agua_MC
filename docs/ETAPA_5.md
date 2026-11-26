# ETAPA 5 — Configuración editable

La pantalla `/configuracion` deja de ser solo lectura. Los valores se guardan en
`users/{uid}/settings/business` y se aplican al resto de la app.

## Campos editables

| Campo | Control | Validación |
| --- | --- | --- |
| Nombre del negocio | Campo de texto | 1–100 caracteres |
| Precio por garrafón | Campo numérico | Centavos enteros mayores que cero |
| Formato de fecha | Tres opciones | `dd/MM/yyyy`, `yyyy-MM-dd`, `MM/dd/yyyy` |
| Apariencia | Tres opciones | `system`, `light`, `dark` |

La moneda se muestra como solo lectura: `MXN` es la única soportada. Las ventas ya registradas
conservan su precio histórico; el precio nuevo solo afecta a ventas futuras.

## Apariencia

`components/appearance-sync.tsx` llama a `Appearance.setColorScheme()` con el valor guardado.
`'system'` se traduce a `'auto'`, de modo que se respeta el ajuste del dispositivo. El cambio se
aplica al iniciar la app y al guardar, sin necesidad de reiniciar.

## Formato de fecha

`hooks/use-date-format.ts` devuelve un formateador que lee `dateFormat` de la configuración
compartida. `lib/dates.ts` aporta `formatDateWithStyle()`, que soporta `dd/MM/yyyy`,
`yyyy-MM-dd` y `MM/dd/yyyy`. El formato se aplica a todas las fechas visibles: inicio, historial
de ventas, historial de gastos, ficha de cliente y rango de estadísticas. Las ventas y los abonos
aceptan `Timestamp` de Firestore o `Date`.

## Cambios de código

- `services/settings.service.ts`: `updateBusinessSettings()` valida y reescribe el documento
  completo conservando `createdAt` y renovando `updatedAt` con `serverTimestamp()`, tal como
  exigen las reglas de Firestore.
- `context/settings-context.tsx`: `SettingsProvider` carga la configuración una sola vez y la
  comparte con toda la app; expone `saveSettings()`.
- `hooks/use-business-settings.ts`: acceso simple al contexto compartido.
- `hooks/use-date-format.ts` y `lib/dates.ts`: formateo de fechas según la preferencia guardada.
- `app/configuracion.tsx`: formulario con estado inicial tomado de los datos cargados.
- `components/appearance-sync.tsx`: sincroniza la apariencia con React Native.
- `app/_layout.tsx`: monta `SettingsProvider` y `AppearanceSync` dentro de `AuthProvider`.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Cómo probar

1. En **Configuración**, cambia el nombre y el precio, y pulsa **Guardar cambios**.
2. Verifica en Firestore que `users/{uid}/settings/business` conserva `createdAt` y actualiza
   `updatedAt`, `businessName` y `pricePerBottleCents`.
3. Registra una venta nueva: debe usar el precio nuevo. Una venta anterior debe mantener el suyo.
4. Cambia el formato de fecha, guarda y comprueba que cambian las fechas del inicio, del
   historial de ventas, del historial de gastos, de la ficha de cliente y del rango de
   estadísticas. Reinicia la app: la preferencia debe conservarse.
5. Cambia la apariencia a **Oscuro** y guarda: la app debe pasar a tema oscuro de inmediato.
6. Reinicia la app: la apariencia elegida debe conservarse.
7. Elige **Sistema** y guarda: la app debe volver a seguir el tema del dispositivo.
