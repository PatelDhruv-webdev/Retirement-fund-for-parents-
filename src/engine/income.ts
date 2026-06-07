import Decimal from 'decimal.js';
import type { Profile, FixedIncome, IncomeSource } from '../types/profile';

// Compute monthly income from all income sources.
export function computeMonthlyIncome(income: IncomeSource[]): Decimal {
  return income.reduce((sum, src) => sum.plus(src.monthlyAmount), new Decimal(0));
}

// Compute monthly income from fixed-income instruments that pay out regularly.
// Payout frequencies: monthly → full amount; quarterly → monthly equivalent; cumulative → 0.
export function computeMonthlyFixedIncome(fixedIncome: FixedIncome[]): Decimal {
  return fixedIncome.reduce((sum, fi) => {
    const annual = annualInterest(fi);
    const monthly = fi.payout === 'monthly'
      ? annual.dividedBy(12)
      : fi.payout === 'quarterly'
        ? annual.dividedBy(12)
        : new Decimal(0); // cumulative — no monthly payout
    return sum.plus(monthly);
  }, new Decimal(0));
}

// Annual interest from a fixed-income instrument.
export function annualInterest(fi: FixedIncome): Decimal {
  if (!fi.ratePct) return new Decimal(0);
  return new Decimal(fi.amount).times(fi.ratePct).dividedBy(100);
}

// Annual gross slab income: pension + rent + interest (before standard deduction).
// This is the "slab pool" — does NOT include capital gains (separate pool).
export function computeAnnualSlabIncome(profile: Profile): Decimal {
  // Ongoing income sources (taxable ones)
  const ongoingTaxable = profile.income
    .filter(src => src.taxable)
    .reduce((s, src) => s.plus(src.monthlyAmount * 12), new Decimal(0));

  // Interest from fixed-income instruments
  const fiInterest = profile.fixedIncome.reduce(
    (s, fi) => s.plus(annualInterest(fi)),
    new Decimal(0),
  );

  // Rental income from rented properties
  const rentalIncome = profile.property
    .filter(p => p.use === 'rented' && p.monthlyRent)
    .reduce((s, p) => s.plus((p.monthlyRent ?? 0) * 12), new Decimal(0));

  // Savings account interest (approx 3.5% p.a.) — often overlooked
  const savingsInterest = new Decimal((profile.cash.savingsBalance ?? 0) * 0.035);

  return ongoingTaxable.plus(fiInterest).plus(rentalIncome).plus(savingsInterest);
}

// Whether any income source is pension/salary (determines standard deduction eligibility).
export function hasPensionIncome(profile: Profile): boolean {
  return profile.income.some(
    src => src.kind === 'pension_govt' || src.kind === 'pension_private' || src.kind === 'nps_annuity',
  );
}

// Total monthly EMIs across all loans.
export function computeMonthlyEMIs(profile: Profile): Decimal {
  return profile.loans.reduce((s, l) => s.plus(l.monthlyEmi), new Decimal(0));
}
