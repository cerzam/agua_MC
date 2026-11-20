# Configuración de Firebase — Agua MC

Esta guía conecta la app con **tu propio proyecto de Firebase**. Sin estos pasos la app muestra
un estado de «Configuración requerida» en lugar de datos inventados.

> Las claves `EXPO_PUBLIC_FIREBASE_*` son identificadores públicos del proyecto web de Firebase.
> **No** son claves privadas de servicio y nunca debes subir un archivo `.env` al repositorio.

---

## 1. Crear el proyecto

1. Entra a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto.
2. No es necesario habilitar Google Analytics.

## 2. Registrar la app web

1. Dentro del proyecto, haz clic en **Agregar app → Web** (`</>`).
2. Ponle un nombre, por ejemplo `Agua MC Web`.
3. Copia el objeto `firebaseConfig` que muestra la consola.

Ese objeto contendrá valores parecidos a:

```
apiKey: "AIza..."
authDomain: "tu-proyecto.firebaseapp.com"
projectId: "tu-proyecto"
storageBucket: "tu-proyecto.firebasestorage.app"
messagingSenderId: "123456789..."
appId: "1:123456789:web:abc123"
```

## 3. Crear el archivo `.env`

En la raíz del proyecto:

```bash
cp .env.example .env
```

Completa cada variable con el valor correspondiente:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Después reinicia el servidor con caché limpia:

```bash
npx expo start -c
```

> Expo solo incrusta las variables que empiezan con `EXPO_PUBLIC_` y lo hace al iniciar.
> Reiniciar con `-c` evita que Metro reutilice valores anteriores.

## 4. Activar autenticación anónima

1. En la consola: **Build → Authentication**.
2. Pestaña **Sign-in method**.
3. Habilita **Anonymous** y guarda.

La app crea la sesión automáticamente al abrirse; no hay pantalla de login.
La persistencia se guarda en `AsyncStorage`, así que la misma sesión se conserva al cerrar la app.

## 5. Crear Cloud Firestore

1. **Build → Firestore Database → Create database**.
2. Modo: **Production** (las reglas se configuran en el siguiente paso).
3. Elige la ubicación más cercana a ti.

## 6. Publicar las reglas de seguridad

Las reglas están en [`firebase/firestore.rules`](../firebase/firestore.rules). Restringen cada
documento al UID del usuario autenticado y validan importes y formatos.

**Opción A — consola (más rápida):**

1. **Firestore Database → Rules**.
2. Pega todo el contenido de `firebase/firestore.rules`.
3. **Publish**.

**Opción B — Firebase CLI:**

El archivo `firebase.json` de la raíz ya apunta a los archivos correctos.

```bash
npm install -g firebase-tools
firebase login
firebase use --add       # selecciona tu proyecto (sólo la primera vez)
firebase deploy --only firestore:rules,firestore:indexes
```

> Las reglas usan `request.auth.uid`, por lo que **ningún usuario puede leer los datos de otro**.
> No se usa en ningún lugar `allow read, write: if true`.

## 7. Verificar

1. Inicia la app: `npx expo start`.
2. Ábrela en Expo Go o simulador.
3. Debe aparecer el nombre «Agua MC» y, en **Configuración**, los valores iniciales leídos desde
   Firestore: nombre `Agua MC`, precio `$25.00 MXN`, moneda `MXN`.
4. En la consola de Firebase, dentro de **Authentication → Users**, verás un usuario anónimo.
5. En **Firestore**, aparecerá `users/{uid}/settings/business`.

## 8. Estructura de datos

```
users/{uid}
└── settings/business      → nombre, precio, moneda, formato de fecha, apariencia
    customers/{customerId} → nombre, teléfono, notas, balanceCents
    sales/{saleId}         → cantidad, precio histórico, total, estado de pago
    payments/{paymentId}   → abonos y cobros (inmutables)
    expenses/{expenseId}   → gastos del negocio
```

Todos los importes se almacenan como **enteros en centavos** (`2500` = `$25.00`).

## 9. Sesión anónima y futuro vínculo de cuenta

La arquitectura usa `initializeAuth` con persistencia de React Native, por lo que es posible
transformar la cuenta anónima en una cuenta permanente sin perder los datos:

```ts
// Referencia futura (no implementada todavía)
import { linkWithCredential, EmailAuthProvider } from 'firebase/auth';
await linkWithCredential(auth.currentUser!, EmailAuthProvider.credential(email, password));
```

Hasta que eso se implemente, **no hay campos de correo ni contraseña** en la interfaz.

## 10. Solución de problemas

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| «Configuración requerida» al abrir | Falta `.env` o algún valor está vacío | Completa `.env` y ejecuta `npx expo start -c` |
| `auth/operation-not-allowed` | Anonymous no está activado | Actívalo en Authentication → Sign-in method |
| `permission-denied` al leer | Reglas no publicadas o UID distinto | Publica `firestore.rules` y revisa el usuario anónimo |
| `failed-precondition` en consultas | Falta un índice compuesto | Publica `firestore.indexes.json` o usa el enlace del error |
| Cambié `.env` pero sigue igual | Metro cacheó las variables | `npx expo start -c` |
