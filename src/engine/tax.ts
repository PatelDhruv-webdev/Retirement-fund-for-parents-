import Decimal from 'decimal.js';
import {
  NEW_REGIME_SLABS,
  NEW_REGIME_STANDARD_DEDUCTION,
  NEW_REGIME_87A_REBATE_MAX,
  NEW_REGIME_87A_INCOME_LIMIT,
  CESS_RATE,
} from './constants';
import type { TaxSummary } from '../types/insights';

// Compute new-regime income tax for FY 2026-27.
// grossSlabIncome: annual pension + rent + interest (before standard deduction).
// hasPensionIncome: true if any income is salary/pension (enables std deduction).
export function computeNewRegimeTax(
  grossSlabIncome: Decimal,
  hasPensionIncome: boolean,
): TaxSummary {
  const stdDed = hasPensionIncome
    ? new Decimal(NEW_REGIME_STANDARD_DEDUCTION)
    : new Decimal(0);

  const taxableIncome = Decimal.max(grossSlabIncome.minus(stdDed), 0);

  const taxBeforeRebate = computeSlabTax(taxableIncome);

  // Sec 87A: if taxable income ≤ ₹12,00,000, rebate = min(tax, ₹60,000)
  const rebate87A = taxableIncome.lte(NEW_REGIME_87A_INCOME_LIMIT)
    ? Decimal.min(taxBeforeRebate, NEW_REGIME_87A_REBATE_MAX)
    : new Decimal(0);

  const taxAfterRebate = Decimal.max(taxBeforeRebate.minus(rebate87A), 0);
  const cess = taxAfterRebate.times(CESS_RATE);
  const totalTax = taxAfterRebate.plus(cess);

  const effectiveRate = grossSlabIncome.gt(0)
    ? totalTax.dividedBy(grossSlabIncome)
    : new Decimal(0);

  return {
    grossSlabIncome,
    standardDeduction: stdDed,
    taxableIncome,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTax,
    effectiveRate,
  };
}

// Pure slab-rate calculation. Does NOT apply standard deduction or rebate.
export function computeSlabTax(taxableIncome: Decimal): Decimal {
  if (taxableIncome.lte(0)) return new Decimal(0);

  let tax = new Decimal(0);
  let prev = new Decimal(0);

  for (const slab of NEW_REGIME_SLABS) {
    if (taxableIncome.lte(prev)) break;
    const upper = slab.upTo === Infinity ? taxableIncome : new Decimal(slab.upTo);
    const slice = Decimal.min(taxableIncome, upper).minus(prev);
    tax = tax.plus(slice.times(slab.rate));
    prev = upper;
  }

  return tax;
}

// Add 4% Health & Education cess to a given tax amount.
export function addCess(tax: Decimal): Decimal {
  return tax.times(1 + CESS_RATE);
}
