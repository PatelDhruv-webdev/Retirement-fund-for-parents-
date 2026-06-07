import Decimal from 'decimal.js';

// Configure Decimal.js for financial use — 20 significant figures, ROUND_HALF_UP
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function toDecimal(value: number | string | undefined | null, fallback = 0): Decimal {
  if (value === undefined || value === null || value === '') return new Decimal(fallback);
  try {
    return new Decimal(value);
  } catch {
    return new Decimal(fallback);
  }
}

// Round to nearest rupee for display purposes.
export function toRupees(d: Decimal): Decimal {
  return d.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
}
