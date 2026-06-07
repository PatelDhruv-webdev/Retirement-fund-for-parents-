import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { computeMFCapitalGains } from '../capitalGains';
import type { MutualFund } from '../../types/profile';

const TODAY = new Date('2026-06-07');

function makeFund(overrides: Partial<MutualFund>): MutualFund {
  return {
    id: 'test',
    label: 'Test Fund',
    category: 'equity',
    mode: 'lumpsum',
    currentValue: 400_000,
    investedTotal: 100_000,
    startDate: '2020-01-01',
    ...overrides,
  };
}

describe('Equity LTCG — §11 seed test', () => {
  it('gain ₹3L held 18 months → tax = 12.5% × (3L − 1.25L) = ₹21,875 + 4% cess', () => {
    const fund = makeFund({
      currentValue: 300_000,
      investedTotal: 0, // full redemption = full gain
      startDate: '2024-12-07', // 18 months before TODAY
    });
    const result = computeMFCapitalGains(
      fund,
      new Decimal(300_000), // redeem everything
      new Decimal(0),       // no prior LTCG exempt used this FY
      TODAY,
    );
    expect(result.ltcgGain.toNumber()).toBe(300_000);
    expect(result.ltcgExemptApplied.toNumber()).toBe(125_000);
    // Taxable LTCG = 175,000 → tax = 175,000 × 12.5% = 21,875
    expect(result.ltcgTax.toNumber()).toBe(21_875);
    // Cess = 21,875 × 4% = 875
    expect(result.cess.toNumber()).toBe(875);
    expect(result.totalTax.toNumber()).toBe(22_750);
  });

  it('LTCG exempt is shared — if ₹50K already used, only ₹75K remaining', () => {
    const fund = makeFund({
      currentValue: 300_000,
      investedTotal: 0,
      startDate: '2024-12-07',
    });
    const result = computeMFCapitalGains(
      fund,
      new Decimal(300_000),
      new Decimal(50_000), // ₹50K already used
      TODAY,
    );
    // Only ₹75K exempt remaining (125K - 50K)
    expect(result.ltcgExemptApplied.toNumber()).toBe(75_000);
    // Taxable = 225,000 → tax = 225,000 × 12.5% = 28,125
    expect(result.ltcgTax.toNumber()).toBe(28_125);
  });
});

describe('Equity STCG — §11 seed test', () => {
  it('gain ₹80K held 6 months → 20% = ₹16,000 + 4% cess', () => {
    const fund = makeFund({
      currentValue: 80_000,
      investedTotal: 0,
      startDate: '2025-12-07', // 6 months before TODAY
    });
    const result = computeMFCapitalGains(
      fund,
      new Decimal(80_000),
      new Decimal(0),
      TODAY,
    );
    expect(result.stcgGain.toNumber()).toBe(80_000);
    expect(result.stcgTax.toNumber()).toBe(16_000);
    // Cess = 16,000 × 4% = 640
    expect(result.cess.toNumber()).toBe(640);
    expect(result.totalTax.toNumber()).toBe(16_640);
    expect(result.ltcgTax.toNumber()).toBe(0);
  });
});

describe('Debt fund — §11 seed test', () => {
  it('any gain in a debt fund → slabRateGain, no CG rate', () => {
    const fund = makeFund({
      category: 'debt',
      currentValue: 500_000,
      investedTotal: 400_000,
      startDate: '2022-01-01',
    });
    const result = computeMFCapitalGains(
      fund,
      new Decimal(500_000),
      new Decimal(0),
      TODAY,
    );
    expect(result.totalTax.toNumber()).toBe(0); // no CG tax at flat rate
    expect(result.slabRateGain.toNumber()).toBe(100_000); // added to slab income by caller
    expect(result.ltcgTax.toNumber()).toBe(0);
    expect(result.stcgTax.toNumber()).toBe(0);
  });
});

describe('Partial redemption', () => {
  it('redeeming 50% of a fund taxes 50% of the gain', () => {
    const fund = makeFund({
      currentValue: 200_000,
      investedTotal: 100_000,
      startDate: '2020-01-01', // well past 12 months
    });
    const result = computeMFCapitalGains(
      fund,
      new Decimal(100_000), // redeem half
      new Decimal(0),
      TODAY,
    );
    // Cost basis of 50% = 50,000; gain = 50,000
    expect(result.grossGain.toNumber()).toBe(50_000);
    // All LTCG, under ₹1.25L exemption → 0 tax
    expect(result.ltcgTax.toNumber()).toBe(0);
    expect(result.ltcgExemptApplied.toNumber()).toBe(50_000);
  });
});
