import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore, firebaseConfigError } from '@/config/firebase';
import { DEFAULT_BUSINESS_SETTINGS } from '@/constants/business';
import type { BusinessSettings } from '@/types/models';

function requireFirestore() {
  if (!firestore) {
    throw new Error(firebaseConfigError ?? 'Firestore no está disponible.');
  }
  return firestore;
}

function settingsRef(uid: string) {
  return doc(requireFirestore(), 'users', uid, 'settings', 'business');
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
