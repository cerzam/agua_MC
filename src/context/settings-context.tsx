import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/use-auth';
import {
  ensureBusinessSettings,
  getBusinessSettings,
  updateBusinessSettings,
} from '@/services/settings.service';
import type { BusinessSettings, BusinessSettingsInput } from '@/types/models';

type SettingsState = {
  settings: BusinessSettings | null;
  loading: boolean;
  error: string | null;
  saveSettings: (input: BusinessSettingsInput) => Promise<boolean>;
};

const INITIAL_STATE: SettingsState = {
  settings: null,
  loading: true,
  error: null,
  saveSettings: async () => false,
};

const SettingsContext = createContext<SettingsState>(INITIAL_STATE);

/** Carga la configuración una sola vez y la comparte con toda la app. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { status, uid } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (status !== 'ready' || !uid) {
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        await ensureBusinessSettings(uid);
        const result = await getBusinessSettings(uid);
        if (active) {
          setSettings(result);
          setError(null);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo leer la configuración.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [status, uid]);

  const saveSettings = useCallback(
    async (input: BusinessSettingsInput) => {
      if (!uid) {
        return false;
      }
      try {
        const updated = await updateBusinessSettings(uid, input);
        setSettings(updated);
        setError(null);
        return true;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo guardar la configuración.');
        return false;
      }
    },
    [uid],
  );

  return (
    <SettingsContext.Provider value={{ settings, loading, error, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  return useContext(SettingsContext);
}
