# Agua MC

Aplicación móvil para administrar la venta de garrafones: ventas, cobros, deudas, abonos,
gastos y estadísticas. Construida con Expo, React Native, TypeScript, Expo Router y Firebase.

> Estado actual: **ETAPA 1 — arquitectura, autenticación, navegación y sistema visual**.
> Los módulos de negocio se conectan por etapas. Las pantallas sin lógica muestran su estado
> honestamente y no contienen datos ficticios ni botones que no hacen nada.

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
│   ├── index.tsx           # Inicio / dashboard
│   ├── ventas.tsx
│   ├── clientes.tsx
│   ├── estadisticas.tsx
│   ├── configuracion.tsx
│   └── gastos.tsx          # Accesible desde Inicio (no ocupa una pestaña)
├── components/
│   ├── ui/                 # Text, Card, Button, Screen, MetricCard, etc.
│   ├── app-gate.tsx        # Carga / configuración requerida
│   └── app-tabs.tsx        # NativeTabs (5 secciones)
├── config/firebase.ts      # Inicialización condicional de Firebase
├── constants/              # Tema, paleta y valores de negocio
├── hooks/                  # Sesión, tema y configuración
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
- **`NativeTabs`** solo funciona en Expo SDK 58+.

## Git

La rama `main` no se usa para desarrollo. Cada etapa se trabaja en su propia rama y se commitea
solo tras revisar los cambios. No se han subido credenciales ni secretos al repositorio.
