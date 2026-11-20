import {
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import type { Customer, CustomerInput } from '@/types/models';

import { newId, userCollection, userDoc } from './db';

export function mapCustomer(id: string, data: Record<string, unknown>): Customer {
  return { id, ...data } as unknown as Customer;
}

export async function listCustomers(uid: string): Promise<Customer[]> {
  const snapshot = await getDocs(query(userCollection(uid, 'customers'), orderBy('name', 'asc')));
  return snapshot.docs.map((document) => mapCustomer(document.id, document.data()));
}

export async function createCustomer(
  uid: string,
  input: CustomerInput,
  documentId: string = newId('customers'),
): Promise<Customer> {
  const reference = userDoc(uid, 'customers', documentId);
  const existing = await getDoc(reference);

  if (!existing.exists()) {
    await setDoc(reference, {
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
      balanceCents: input.balanceCents ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const saved = await getDoc(reference);
  return mapCustomer(reference.id, saved.data() ?? {});
}
