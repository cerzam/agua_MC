import { useEffect } from 'react';
import { Appearance } from 'react-native';

import { useBusinessSettings } from '@/hooks/use-business-settings';

/** Aplica la apariencia guardada en Firestore al tema de toda la app. */
export function AppearanceSync() {
  const { settings } = useBusinessSettings();

  useEffect(() => {
    const appearance = settings?.appearance;
    Appearance.setColorScheme?.(!appearance || appearance === 'system' ? 'auto' : appearance);
  }, [settings?.appearance]);

  return null;
}
