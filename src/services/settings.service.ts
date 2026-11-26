import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import {
  DEFAULT_BUSINESS_SETTINGS,
  SUPPORTED_DATE_FORMATS,
} from '@/constants/business';
import type { Appearance, BusinessSettings, BusinessSettingsInput } from '@/types/models';

import { userDoc } from './db';

const APPEARANCES: Appearance[] = ['system', 'light', 'dark'];

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
  return snapshot.exists() ? (snapshot.data() as BusinessSettings) : null;
}

/**
 * Guarda la configuración completa del negocio.
 * Conserva `createdAt` para cumplir las reglas de Firestore y renueva `updatedAt`.
 */
export async function updateBusinessSettings(
  uid: string,
  input: BusinessSettingsInput,
): Promise<BusinessSettings> {
  const name = input.businessName?.trim() ?? '';
  if (!name || name.length > 100) {
    throw new Error('El nombre del negocio debe tener entre 1 y 100 caracteres.');
  }
  if (!Number.isInteger(input.pricePerBottleCents) || input.pricePerBottleCents <= 0) {
    throw new Error('El precio debe ser mayor que cero.');
  }
  if (!SUPPORTED_DATE_FORMATS.includes(input.dateFormat)) {
    throw new Error('El formato de fecha no es válido.');
  }
  if (!APPEARANCES.includes(input.appearance)) {
    throw new Error('La apariencia no es válida.');
  }

  await ensureBusinessSettings(uid);
  const current = await getBusinessSettings(uid);
  if (!current) {
    throw new Error('No se pudo leer la configuración actual.');
  }

  const next: BusinessSettings = {
    ...input,
    businessName: name,
    createdAt: current.createdAt,
    updatedAt: current.updatedAt,
  };
  await setDoc(settingsRef(uid), { ...next, updatedAt: serverTimestamp() });

  return (await getBusinessSettings(uid)) ?? next;
}
