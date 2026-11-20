import type { Timestamp } from 'firebase/firestore';

/* Todos los importes se guardan en centavos (números enteros). */

export type CurrencyCode = 'MXN';
export type DateFormat = 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'MM/dd/yyyy';
export type Appearance = 'system' | 'light' | 'dark';

export interface BusinessSettings {
  businessName: string;
  pricePerBottleCents: number;
  currency: CurrencyCode;
  dateFormat: DateFormat;
  appearance: Appearance;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type BusinessSettingsInput = Omit<BusinessSettings, 'createdAt' | 'updatedAt'>;

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  balanceCents: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CustomerInput = Pick<Customer, 'name' | 'phone' | 'notes'> & {
  balanceCents?: number;
};

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Sale {
  id: string;
  customerId: string | null;
  customerName: string | null;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  paidCents: number;
  paymentStatus: PaymentStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type SaleInput = Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>;

export type PaymentType = 'sale_payment' | 'debt_payment';

export interface Payment {
  id: string;
  /** null en los cobros de ventas pagadas sin cliente. */
  customerId: string | null;
  saleId: string | null;
  amountCents: number;
  type: PaymentType;
  createdAt: Timestamp;
}

export type PaymentInput = Omit<Payment, 'id' | 'createdAt'>;

export interface Expense {
  id: string;
  concept: string;
  amountCents: number;
  category: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

export type Movement =
  | { kind: 'sale'; item: Sale }
  | { kind: 'payment'; item: Payment }
  | { kind: 'expense'; item: Expense };
