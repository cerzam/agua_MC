import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { DEFAULT_BUSINESS_SETTINGS } from '@/constants/business';
import type { BusinessSettings } from '@/types/models';

import { userDoc } from './db';

function settingsRef(uid: string) {
  return userDoc(uid, 'settings', 'business');
}

/** Crea la configuración inicial una sola vez, sin sobrescribir la existente. */
export async function ensureBusinessSettings(uid: string): Promise<void> {
  const reference = settingsRef(uid);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    await setDoc(reference, {
      ...DEFAULT_BUSINESS_SETTINGS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getBusinessSettings(uid: string): Promise<BusinessSettings | null> {
  const snapshot = await getDoc(settingsRef(uid));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as BusinessSettings;
}

/** Actualiza el precio general; las ventas conservan su precio histórico. */
export async function updateBottlePrice(uid: string, pricePerBottleCents: number): Promise<void> {
  if (!Number.isInteger(pricePerBottleCents) || pricePerBottleCents <= 0) {
    throw new Error('El precio debe ser un número entero de centavos mayor que cero.');
  }
  await setDoc(
    settingsRef(uid),
    { pricePerBottleCents, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
