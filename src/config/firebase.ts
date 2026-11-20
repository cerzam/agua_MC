import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Las claves de Firebase son identificadores públicos del proyecto, no secretos.
 * La protección de datos se implementa con reglas de Firestore por usuario.
 * Se leen de forma estática para que Expo las incruste en el bundle.
 */
const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

export const isFirebaseConfigured = Boolean(apiKey && authDomain && projectId && appId);

export const firebaseConfigError = isFirebaseConfigured
  ? null
  : 'Faltan variables EXPO_PUBLIC_FIREBASE_* en el archivo .env. Consulta docs/FIREBASE_SETUP.md.';

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  firebaseApp = initializeApp({
    apiKey: apiKey as string,
    authDomain: authDomain as string,
    projectId: projectId as string,
    storageBucket: storageBucket || undefined,
    messagingSenderId: messagingSenderId as string,
    appId: appId as string,
  });

  firestore = getFirestore(firebaseApp);

  try {
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Fast Refresh puede reevaluar el módulo; en ese caso reutilizamos la instancia existente.
    auth = getAuth(firebaseApp);
  }
}

export { auth, firebaseApp, firestore };
