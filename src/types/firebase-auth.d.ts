import type { Persistence } from 'firebase/auth';

/**
 * Firebase v13 publica `getReactNativePersistence` en el entrypoint de React Native,
 * pero sus tipos públicos no lo exponen al resolver `firebase/auth` con TypeScript.
 * Esta ampliación sólo agrega el tipo; en tiempo de ejecución Metro resuelve el
 * entrypoint `react-native` de @firebase/auth, que sí exporta la función.
 */
declare module 'firebase/auth' {
  export interface ReactNativeStorageLike {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(storage: ReactNativeStorageLike): Persistence;
}
