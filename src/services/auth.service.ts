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
  console.log('[Agua MC] ensureAnonymousSession: iniciando sesión anónima…', {
    projectId: instance.app.options.projectId,
    hasCurrentUser: Boolean(instance.currentUser),
  });

  try {
    const credential = await signInAnonymously(instance);
    console.log('[Agua MC] ensureAnonymousSession: sesión creada', credential.user.uid);
    return credential.user;
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : undefined;
    console.error('[Agua MC] ensureAnonymousSession: ERROR', {
      code,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export function observeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(requireAuth(), callback);
}
