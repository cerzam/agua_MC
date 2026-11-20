import type { BusinessSettingsInput, CurrencyCode, DateFormat } from '@/types/models';

/** Valores iniciales sugeridos. El precio se edita desde Configuración (Etapa 5). */
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettingsInput = {
  businessName: 'Agua MC',
  pricePerBottleCents: 2500,
  currency: 'MXN',
  dateFormat: 'dd/MM/yyyy',
  appearance: 'system',
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['MXN'];

export const SUPPORTED_DATE_FORMATS: DateFormat[] = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];

export const EXPENSE_CATEGORIES = [
  'Gasolina',
  'Mantenimiento',
  'Compras',
  'Servicios',
  'Otros',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
