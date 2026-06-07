import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { computeNewRegimeTax, computeSlabTax } from '../tax';

describe('computeSlabTax — new regime FY 2026-27', () => {
  it('zero for income at or below basic exemption (₹4L)', () => {
    expect(computeSlabTax(new Decimal(400_000)).toNumber()).toBe(0);
    expect(computeSlabTax(new Decimal(0)).toNumber()).toBe(0);
  });

  it('5% slab on income between ₹4L–₹8L', () => {
    // ₹6L → (6L - 4L) × 5% = ₹10,000
    expect(computeSlabTax(new Decimal(600_000)).toNumber()).toBe(10_000);
  });

  it('multiple slabs — ₹10L', () => {
    // 4L–8L: 4L × 5% = 20,000
    // 8L–10L: 2L × 10% = 20,000
    // total = ₹40,000
    expect(computeSlabTax(new Decimal(1_000_000)).toNumber()).toBe(40_000);
  });

  it('full slab ladder — ₹30L (above 30% slab)', () => {
    // 0–4L: 0
    // 4L–8L: 4L × 5% = 20,000
    // 8L–12L: 4L × 10% = 40,000
    // 12L–16L: 4L × 15% = 60,000
    // 16L–20L: 4L × 20% = 80,000
    // 20L–24L: 4L × 25% = 100,000
    // 24L–30L: 6L × 30% = 180,000
    // total = 480,000
    expect(computeSlabTax(new Decimal(3_000_000)).toNumber()).toBe(480_000);
  });
});

describe('computeNewRegimeTax — with standard deduction and 87A rebate', () => {
  it('zero tax for ₹6L pension (std ded ₹75K → taxable ₹5.25L ≤ ₹12L → full rebate)', () => {
    const result = computeNewRegimeTax(new Decimal(600_000), true);
    expect(result.standardDeduction.toNumber()).toBe(75_000);
    expect(result.taxableIncome.toNumber()).toBe(525_000);
    // Slab: (525,000 - 400,000) × 5% = 6,250
    expect(result.taxBeforeRebate.toNumber()).toBe(6_250);
    expect(result.rebate87A.toNumber()).toBe(6_250);
    expect(result.totalTax.toNumber()).toBe(0);
    expect(result.effectiveRate.toNumber()).toBe(0);
  });

  it('zero tax for ₹6L pension + ₹2L interest (total ₹8L → taxable ₹7.25L ≤ ₹12L)', () => {
    // §11 regime-compare seed test: new regime case
    const result = computeNewRegimeTax(new Decimal(800_000), true);
    expect(result.taxableIncome.toNumber()).toBe(725_000);
    // (725,000 - 400,000) × 5% = 16,250
    expect(result.taxBeforeRebate.toNumber()).toBe(16_250);
    expect(result.rebate87A.toNumber()).toBe(16_250);
    expect(result.totalTax.toNumber()).toBe(0);
  });

  it('87A rebate capped at ₹60,000 for income just at ₹12L threshold', () => {
    // Taxable income just at ₹12L → max rebate ₹60,000
    // After std deduction ₹75K, gross must be ₹12,75,000 for taxable to be exactly ₹12L
    const gross = new Decimal(1_275_000);
    const result = computeNewRegimeTax(gross, true);
    expect(result.taxableIncome.toNumber()).toBe(1_200_000);
    // Slab on ₹12L: 4L×0 + 4L×5% + 4L×10% = 0 + 20,000 + 40,000 = 60,000
    expect(result.taxBeforeRebate.toNumber()).toBe(60_000);
    expect(result.rebate87A.toNumber()).toBe(60_000);
    expect(result.totalTax.toNumber()).toBe(0);
  });

  it('above ₹12L threshold — no 87A rebate, tax applies', () => {
    // Gross ₹15L (no pension), taxable = ₹15L, income > ₹12L → no rebate
    const result = computeNewRegimeTax(new Decimal(1_500_000), false);
    expect(result.standardDeduction.toNumber()).toBe(0);
    expect(result.taxableIncome.toNumber()).toBe(1_500_000);
    // Slab on ₹15L: 4L×5%=20k + 4L×10%=40k + 3L×15%=45k = 105,000
    expect(result.taxBeforeRebate.toNumber()).toBe(105_000);
    expect(result.rebate87A.toNumber()).toBe(0);
    // Cess: 105,000 × 4% = 4,200
    expect(result.totalTax.toNumber()).toBe(109_200);
  });
});
