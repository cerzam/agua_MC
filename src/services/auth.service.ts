import { onAuthStateChanged, signInAnonymously, type Auth, type User } from 'firebase/auth';

import { auth, firebaseConfigError } from '@/config/firebase';

export function requireAuth(): Auth {
  if (!auth) {
    throw new Error(firebaseConfigError ?? 'Firebase Authentication no está disponible.');
  }
  return auth;
}

/** Crea una sesión anónima sólo cuando no existe ninguna sesión activa. */
export async function ensureAnonymousSession(): Promise<User> {
  const instance = requireAuth();
  if (instance.currentUser) {
    return instance.currentUser;
  }
  const credential = await signInAnonymously(instance);
  return credential.user;
}

export function observeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(requireAuth(), callback);
}
