import {
  deleteDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type QueryConstraint,
} from 'firebase/firestore';

import type { Expense, ExpenseInput } from '@/types/models';

import { newId, userCollection, userDoc } from './db';

export function mapExpense(id: string, data: Record<string, unknown>): Expense {
  return { id, ...data } as unknown as Expense;
}

export type ExpenseFilters = {
  from?: Date;
  to?: Date;
  maxResults?: number;
};

export async function listExpenses(uid: string, filters: ExpenseFilters = {}): Promise<Expense[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.from) {
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.from)));
    constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.to ?? new Date())));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters.maxResults) {
    constraints.push(limit(filters.maxResults));
  }

  const snapshot = await getDocs(query(userCollection(uid, 'expenses'), ...constraints));
  return snapshot.docs.map((document) => mapExpense(document.id, document.data()));
}

export async function createExpense(
  uid: string,
  input: ExpenseInput,
  documentId: string = newId('expenses'),
): Promise<string> {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('El importe del gasto debe ser mayor que cero.');
  }

  const reference = userDoc(uid, 'expenses', documentId);
  const existing = await getDoc(reference);

  if (!existing.exists()) {
    await setDoc(reference, {
      concept: input.concept.trim(),
      amountCents: input.amountCents,
      category: input.category,
      description: input.description.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return documentId;
}

export async function deleteExpense(uid: string, expenseId: string): Promise<void> {
  await deleteDoc(userDoc(uid, 'expenses', expenseId));
}
