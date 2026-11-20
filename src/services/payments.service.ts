import {
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  type QueryConstraint,
} from 'firebase/firestore';

import type { Payment, Sale } from '@/types/models';

import { newId, requireFirestore, userCollection, userDoc } from './db';

export function mapPayment(id: string, data: Record<string, unknown>): Payment {
  return { id, ...data } as unknown as Payment;
}

export type PaymentFilters = {
  from?: Date;
  to?: Date;
  customerId?: string;
  saleId?: string;
  maxResults?: number;
};

export async function listPayments(uid: string, filters: PaymentFilters = {}): Promise<Payment[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.customerId) {
    constraints.push(where('customerId', '==', filters.customerId));
  }
  if (filters.saleId) {
    constraints.push(where('saleId', '==', filters.saleId));
  }
  if (filters.from) {
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.from)));
    constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.to ?? new Date())));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters.maxResults) {
    constraints.push(limit(filters.maxResults));
  }

  const snapshot = await getDocs(query(userCollection(uid, 'payments'), ...constraints));
  return snapshot.docs.map((document) => mapPayment(document.id, document.data()));
}

export type CreateDebtPaymentInput = {
  id?: string;
  customerId: string;
  saleId: string | null;
  amountCents: number;
};

/**
 * Abono atómico: registro inmutable del pago + reducción del saldo del cliente
 * + actualización de lo pagado en la venta relacionada (si la hay).
 */
export async function createDebtPayment(
  uid: string,
  input: CreateDebtPaymentInput,
): Promise<string> {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('El importe del abono debe ser mayor que cero.');
  }

  const paymentId = input.id ?? newId('payments');
  const paymentReference = userDoc(uid, 'payments', paymentId);
  const customerReference = userDoc(uid, 'customers', input.customerId);
  const saleReference = input.saleId ? userDoc(uid, 'sales', input.saleId) : null;

  await runTransaction(requireFirestore(), async (transaction) => {
    const existingPayment = await transaction.get(paymentReference);
    const customerSnapshot = await transaction.get(customerReference);
    const saleSnapshot = saleReference ? await transaction.get(saleReference) : null;

    if (existingPayment.exists()) {
      return;
    }
    if (!customerSnapshot.exists()) {
      throw new Error('El cliente seleccionado ya no existe.');
    }

    const balance = Number(customerSnapshot.data()?.balanceCents ?? 0);
    if (input.amountCents > balance) {
      throw new Error('El abono no puede ser mayor al saldo pendiente del cliente.');
    }

    transaction.set(paymentReference, {
      customerId: input.customerId,
      saleId: input.saleId,
      amountCents: input.amountCents,
      type: 'debt_payment',
      createdAt: serverTimestamp(),
    });

    transaction.update(customerReference, {
      balanceCents: balance - input.amountCents,
      updatedAt: serverTimestamp(),
    });

    if (saleReference && saleSnapshot?.exists()) {
      const sale = saleSnapshot.data() as Sale;
      const paidCents = Number(sale.paidCents ?? 0) + input.amountCents;
      const totalCents = Number(sale.totalCents ?? 0);
      transaction.update(saleReference, {
        paidCents,
        paymentStatus: paidCents >= totalCents ? 'paid' : 'partial',
        updatedAt: serverTimestamp(),
      });
    }
  });

  return paymentId;
}
