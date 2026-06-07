import Decimal from 'decimal.js';
import type { Profile } from '../types/profile';
import type { Buckets } from '../types/insights';

// Classify assets into the 4 buckets and compute net worth.
// Self-occupied property is excluded from investable wealth (legacy/lifestyle bucket).
export function computeNetWorth(profile: Profile): {
  totalNetWorth: Decimal;
  investableWealth: Decimal;
  buckets: Buckets;
} {
  // Safety: cash
  const safetyBucket = new Decimal(
    (profile.cash.savingsBalance ?? 0) + (profile.cash.idleCash ?? 0),
  );

  // Income bucket: fixed-income instruments + debt mutual funds
  const fixedIncomeTotal = profile.fixedIncome.reduce(
    (s, fi) => s.plus(fi.amount),
    new Decimal(0),
  );
  const debtMFTotal = profile.mutualFunds
    .filter(mf => mf.category === 'debt')
    .reduce((s, mf) => s.plus(mf.currentValue), new Decimal(0));
  const incomeBucket = fixedIncomeTotal.plus(debtMFTotal);

  // Growth bucket: equity + hybrid + gold ETF/FoF mutual funds
  const growthMFTotal = profile.mutualFunds
    .filter(mf => mf.category !== 'debt')
    .reduce((s, mf) => s.plus(mf.currentValue), new Decimal(0));

  // Legacy/lifestyle: gold + self-occupied property
  const goldValue = new Decimal(profile.gold.estimatedValue ?? 0);
  const selfOccupiedValue = profile.property
    .filter(p => p.use === 'self_occupied')
    .reduce((s, p) => s.plus(p.estimatedValue ?? 0), new Decimal(0));
  const legacyBucket = goldValue.plus(selfOccupiedValue);

  // Rented property contributes to legacy bucket (not income; income = rent flow)
  const rentedPropertyValue = profile.property
    .filter(p => p.use === 'rented')
    .reduce((s, p) => s.plus(p.estimatedValue ?? 0), new Decimal(0));

  const growthBucket = growthMFTotal;

  // Total gross assets
  const grossAssets = safetyBucket
    .plus(incomeBucket)
    .plus(growthBucket)
    .plus(legacyBucket)
    .plus(rentedPropertyValue);

  // Liabilities
  const totalLiabilities = profile.loans.reduce(
    (s, l) => s.plus(l.outstanding),
    new Decimal(0),
  );

  const totalNetWorth = grossAssets.minus(totalLiabilities);
  const investableWealth = safetyBucket.plus(incomeBucket).plus(growthBucket);

  return {
    totalNetWorth,
    investableWealth,
    buckets: {
      safety: safetyBucket,
      income: incomeBucket,
      growth: growthBucket,
      legacyLifestyle: legacyBucket.plus(rentedPropertyValue),
    },
  };
}
