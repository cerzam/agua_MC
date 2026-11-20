/** Convierte centavos enteros a una cadena monetaria localizada. */
export function formatCurrency(cents: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Convierte la entrada del usuario a centavos enteros. Devuelve null si no es válida. */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.replace(/[^\d.,-]/g, '').replace(',', '.');
  if (!cleaned) {
    return null;
  }
  const value = Number(cleaned);
  if (!Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 100);
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}
