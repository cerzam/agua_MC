import * as SplashScreen from 'expo-splash-screen';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { firebaseConfigError } from '@/config/firebase';
import { ensureAnonymousSession, observeAuth } from '@/services/auth.service';

type AuthState = {
  status: 'loading' | 'ready' | 'error';
  uid: string | null;
  isAnonymous: boolean;
  error: string | null;
};

const INITIAL_STATE: AuthState = firebaseConfigError
  ? { status: 'error', uid: null, isAnonymous: false, error: firebaseConfigError }
  : { status: 'loading', uid: null, isAnonymous: false, error: null };

const AuthContext = createContext<AuthState>(INITIAL_STATE);

/** Sesión anónima automática: sin formularios y sin redirecciones. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const signInStarted = useRef(false);

  useEffect(() => {
    if (firebaseConfigError) {
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = observeAuth((user) => {
        if (!active) {
          return;
        }

        if (user) {
          setState({
            status: 'ready',
            uid: user.uid,
            isAnonymous: user.isAnonymous,
            error: null,
          });
          return;
        }

        if (!signInStarted.current) {
          signInStarted.current = true;
          ensureAnonymousSession().catch((error: unknown) => {
            if (active) {
              setState({
                status: 'error',
                uid: null,
                isAnonymous: false,
                error: error instanceof Error ? error.message : 'No se pudo iniciar sesión.',
              });
            }
          });
        }
      });
    } catch (error) {
      // Diferido para no actualizar estado de forma síncrona dentro del efecto.
      queueMicrotask(() => {
        setState({
          status: 'error',
          uid: null,
          isAnonymous: false,
          error: error instanceof Error ? error.message : 'Error de autenticación.',
        });
      });
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'loading') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [state.status]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
