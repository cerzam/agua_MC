# Agua MC

Aplicación móvil para administrar la venta de garrafones: ventas, cobros, deudas, abonos,
gastos y estadísticas. Construida con Expo, React Native, TypeScript, Expo Router y Firebase.

> Estado actual: **ETAPA 5 — configuración editable conectada a Firestore**.
> No hay datos ficticios ni botones sin funcionalidad.

---

## Requisitos

- Node 22 LTS o superior (recomendado; Expo SDK 58 es compatible con 22.13+, 24.3+ o 26+).
- npm (el proyecto incluye `package-lock.json`).
- Cuenta de Firebase.
- Expo Go, simulador de iOS o emulador de Android.

## Instalación

```bash
npm install
cp .env.example .env      # completa los valores de Firebase
npx expo start -c
```

Consulta [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) para crear el proyecto, activar la
autenticación anónima y publicar las reglas y los índices de Firestore.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npx expo start` | Inicia Metro |
| `npx expo start -c` | Inicia limpiando la caché (necesario tras cambiar `.env`) |
| `npx expo start --ios` / `--android` | Abre en simulador/emulador |
| `npm run lint` | ESLint con la configuración de Expo |
| `npm run typecheck` | Verificación de TypeScript sin emitir archivos |
| `npx expo-doctor` | Revisión de dependencias y configuración |

## Estructura

```
src/
├── app/                    # Rutas (Expo Router). Una pantalla por archivo.
│   ├── _layout.tsx         # Providers, gate de sesión y navegación
│   ├── index.tsx           # Inicio / dashboard con datos reales
│   ├── ventas/             # Pestaña con Stack propio
│   │   ├── index.tsx       # Historial y filtros
│   │   ├── nueva.tsx       # Alta de venta
│   │   └── [id].tsx        # Detalle y cobros
│   ├── gastos/             # Accesible desde Inicio (no ocupa pestaña)
│   │   ├── index.tsx       # Historial y eliminación
│   │   └── nuevo.tsx
│   ├── abonos/nuevo.tsx    # Cobro de deudas
│   ├── clientes/           # Pestaña con Stack propio
│   │   ├── index.tsx       # Lista con búsqueda y saldos
│   │   ├── nuevo.tsx
│   │   └── [id]/           # Ficha + historial + edición
│   ├── estadisticas.tsx
│   └── configuracion.tsx
├── components/
│   ├── ui/                 # Text, Card, Button, Screen, MetricCard, etc.
│   ├── appearance-sync.tsx # Aplica la apariencia guardada
│   ├── app-gate.tsx        # Carga / configuración requerida
│   ├── app-tabs.tsx        # NativeTabs (5 secciones)
│   └── statistics/         # Gráfica de barras de ventas por día
├── config/firebase.ts      # Inicialización condicional de Firebase
├── constants/              # Tema, paleta y valores de negocio
├── context/                # SettingsProvider (configuración compartida)
├── hooks/                  # Sesión, tema, configuración, fechas y estadísticas
├── lib/                    # Dinero (centavos) y fechas
├── services/               # Acceso a Firestore por dominio
└── types/models.ts         # Esquemas de datos
firebase/
├── firestore.rules         # Seguridad por UID y validaciones
└── firestore.indexes.json  # Índices compuestos
```

## Decisiones técnicas

- **SDK de Firebase JS** en lugar de React Native Firebase para mantener compatibilidad con Expo Go.
- **Autenticación anónima persistente** con `AsyncStorage`; sin pantalla de login.
- **Importes en centavos enteros** para evitar errores de precisión decimal.
- **Datos por usuario** en `users/{uid}/...`, protegidos por `request.auth.uid`.
- **Barra inferior nativa** (`expo-router/native-tabs`): SF Symbols en iOS y Material Symbols en Android.
- **`NativeTabs`** solo funciona en Expo SDK 58+; cada pestaña con historial usa un `Stack` anidado.
- **Operaciones financieras atómicas** con `runTransaction` e IDs generados en la UI para idempotencia.

Guías de prueba: [`docs/ETAPA_2.md`](docs/ETAPA_2.md), [`docs/ETAPA_3.md`](docs/ETAPA_3.md), [`docs/ETAPA_4.md`](docs/ETAPA_4.md) y [`docs/ETAPA_5.md`](docs/ETAPA_5.md).

## Git

La rama `main` no se usa para desarrollo. Cada etapa se trabaja en su propia rama y se commitea
solo tras revisar los cambios. No se han subido credenciales ni secretos al repositorio.
