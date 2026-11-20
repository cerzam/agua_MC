import {
  getDoc,
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

import type { PaymentStatus, Sale } from '@/types/models';

import { requireFirestore, userCollection, userDoc } from './db';

export type CreateSaleInput = {
  /** ID generado por la UI para que pulsaciones repetidas no creen duplicados. */
  id: string;
  customerId: string | null;
  customerName: string | null;
  quantity: number;
  unitPriceCents: number;
  paymentStatus: Extract<PaymentStatus, 'paid' | 'unpaid'>;
};

export function mapSale(id: string, data: Record<string, unknown>): Sale {
  return { id, ...data } as unknown as Sale;
}

export async function getSale(uid: string, saleId: string): Promise<Sale | null> {
  const snapshot = await getDoc(userDoc(uid, 'sales', saleId));
  return snapshot.exists() ? mapSale(snapshot.id, snapshot.data()) : null;
}

export type SaleFilters = {
  from?: Date;
  to?: Date;
  customerId?: string;
  maxResults?: number;
};

export async function listSales(uid: string, filters: SaleFilters = {}): Promise<Sale[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.customerId) {
    constraints.push(where('customerId', '==', filters.customerId));
  }
  if (filters.from) {
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.from)));
    constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.to ?? new Date())));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters.maxResults) {
    constraints.push(limit(filters.maxResults));
  }

  const snapshot = await getDocs(query(userCollection(uid, 'sales'), ...constraints));
  return snapshot.docs.map((document) => mapSale(document.id, document.data()));
}

/**
 * Operación financiera atómica:
 * - Venta pagada  → venta + movimiento de cobro.
 * - Venta fiada   → venta + incremento del saldo del cliente (requiere cliente).
 */
export async function createSale(uid: string, input: CreateSaleInput): Promise<string> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('La cantidad debe ser un número entero positivo.');
  }
  if (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents <= 0) {
    throw new Error('El precio debe ser mayor que cero.');
  }
  if (input.paymentStatus === 'unpaid' && !input.customerId) {
    throw new Error('Una venta fiada necesita un cliente.');
  }

  const totalCents = input.quantity * input.unitPriceCents;
  const paidCents = input.paymentStatus === 'paid' ? totalCents : 0;
  const saleReference = userDoc(uid, 'sales', input.id);
  const paymentReference = userDoc(uid, 'payments', `${input.id}-sale`);
  const customerReference = input.customerId
    ? userDoc(uid, 'customers', input.customerId)
    : null;

  await runTransaction(requireFirestore(), async (transaction) => {
    // Todas las lecturas van antes de cualquier escritura (requisito de Firestore).
    const existingSale = await transaction.get(saleReference);
    const customerSnapshot =
      input.paymentStatus === 'unpaid' && customerReference
        ? await transaction.get(customerReference)
        : null;

    if (existingSale.exists()) {
      return; // Idempotencia: la misma pulsación no registra dos ventas.
    }

    if (input.paymentStatus === 'unpaid') {
      if (!customerSnapshot?.exists()) {
        throw new Error('El cliente seleccionado ya no existe.');
      }
    }

    transaction.set(saleReference, {
      customerId: input.customerId,
      customerName: input.customerName,
      quantity: input.quantity,
      unitPriceCents: input.unitPriceCents,
      totalCents,
      paidCents,
      paymentStatus: input.paymentStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (input.paymentStatus === 'paid') {
      transaction.set(paymentReference, {
        customerId: input.customerId,
        saleId: input.id,
        amountCents: paidCents,
        type: 'sale_payment',
        createdAt: serverTimestamp(),
      });
    } else if (customerReference && customerSnapshot) {
      const balance = Number(customerSnapshot.data()?.balanceCents ?? 0);
      transaction.update(customerReference, {
        balanceCents: balance + totalCents,
        updatedAt: serverTimestamp(),
      });
    }
  });

  return input.id;
}
