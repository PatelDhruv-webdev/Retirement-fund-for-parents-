import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { computeBenefitExemption, computeAllBenefits } from '../retirementBenefits';
import type { RetirementBenefit } from '../../types/profile';

function benefit(overrides: Partial<RetirementBenefit>): RetirementBenefit {
  return {
    id: 'b1',
    kind: 'gratuity',
    amount: 0,
    employmentType: 'non_government',
    status: 'expected',
    ...overrides,
  };
}

describe('Gratuity — §11 seed tests', () => {
  it('non-govt ₹18L → fully exempt (under ₹20L ceiling)', () => {
    const r = computeBenefitExemption(benefit({ kind: 'gratuity', amount: 18_00_000 }));
    expect(r.exemptAmount.toNumber()).toBe(18_00_000);
    expect(r.taxableAmount.toNumber()).toBe(0);
  });

  it('non-govt ₹25L → ₹20L exempt, ₹5L taxable', () => {
    const r = computeBenefitExemption(benefit({ kind: 'gratuity', amount: 25_00_000 }));
    expect(r.exemptAmount.toNumber()).toBe(20_00_000);
    expect(r.taxableAmount.toNumber()).toBe(5_00_000);
  });

  it('government employee → fully exempt, no ceiling', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'gratuity', amount: 50_00_000, employmentType: 'government' }),
    );
    expect(r.exemptAmount.toNumber()).toBe(50_00_000);
    expect(r.taxableAmount.toNumber()).toBe(0);
  });
});

describe('Leave Encashment — §11 seed tests', () => {
  it('non-govt ₹30L → ₹25L exempt, ₹5L taxable', () => {
    const r = computeBenefitExemption(benefit({ kind: 'leave_encashment', amount: 30_00_000 }));
    expect(r.exemptAmount.toNumber()).toBe(25_00_000);
    expect(r.taxableAmount.toNumber()).toBe(5_00_000);
  });

  it('government ₹30L → fully exempt', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'leave_encashment', amount: 30_00_000, employmentType: 'government' }),
    );
    expect(r.exemptAmount.toNumber()).toBe(30_00_000);
    expect(r.taxableAmount.toNumber()).toBe(0);
  });
});

describe('Commuted Pension — §11 seed tests', () => {
  it('non-govt WITH gratuity → 1/3 exempt', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'commuted_pension', amount: 12_00_000, receivesGratuity: true }),
    );
    // 1/3 of ₹12L = ₹4L exempt
    expect(r.exemptAmount.toNumber()).toBeCloseTo(4_00_000, -1);
    expect(r.taxableAmount.toNumber()).toBeCloseTo(8_00_000, -1);
  });

  it('non-govt WITHOUT gratuity → 1/2 exempt', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'commuted_pension', amount: 12_00_000, receivesGratuity: false }),
    );
    expect(r.exemptAmount.toNumber()).toBe(6_00_000);
    expect(r.taxableAmount.toNumber()).toBe(6_00_000);
  });

  it('government → fully exempt', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'commuted_pension', amount: 20_00_000, employmentType: 'government' }),
    );
    expect(r.exemptAmount.toNumber()).toBe(20_00_000);
    expect(r.taxableAmount.toNumber()).toBe(0);
  });
});

describe('EPF — §11 seed tests', () => {
  it('6 years of service → fully exempt', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'epf', amount: 15_00_000, yearsOfService: 6 }),
    );
    expect(r.exemptAmount.toNumber()).toBe(15_00_000);
    expect(r.taxableAmount.toNumber()).toBe(0);
  });

  it('3 years of service → fully taxable', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'epf', amount: 5_00_000, yearsOfService: 3 }),
    );
    expect(r.exemptAmount.toNumber()).toBe(0);
    expect(r.taxableAmount.toNumber()).toBe(5_00_000);
  });

  it('exactly 5 years → exempt', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'epf', amount: 10_00_000, yearsOfService: 5 }),
    );
    expect(r.exemptAmount.toNumber()).toBe(10_00_000);
  });
});

describe('NPS — §11 seed tests', () => {
  it('NPS corpus ₹50L → ₹30L tax-free, ₹20L to annuity', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'nps_lumpsum', amount: 50_00_000 }),
    );
    // 60% = ₹30L tax-free lump sum
    expect(r.exemptAmount.toNumber()).toBe(30_00_000);
    expect(r.taxableAmount.toNumber()).toBe(0); // lump sum taxable = 0
    // 40% = ₹20L → annuity
    expect(r.annuityCorpus?.toNumber()).toBe(20_00_000);
  });
});

describe('VRS', () => {
  it('VRS ₹3L → fully exempt', () => {
    const r = computeBenefitExemption(benefit({ kind: 'vrs', amount: 3_00_000 }));
    expect(r.exemptAmount.toNumber()).toBe(3_00_000);
    expect(r.taxableAmount.toNumber()).toBe(0);
  });

  it('VRS ₹8L → ₹5L exempt, ₹3L taxable', () => {
    const r = computeBenefitExemption(benefit({ kind: 'vrs', amount: 8_00_000 }));
    expect(r.exemptAmount.toNumber()).toBe(5_00_000);
    expect(r.taxableAmount.toNumber()).toBe(3_00_000);
  });
});

describe('computeAllBenefits', () => {
  it('only processes expected benefits, skips received_and_deployed', () => {
    const benefits: RetirementBenefit[] = [
      benefit({ id: '1', kind: 'gratuity', amount: 18_00_000, status: 'expected' }),
      benefit({ id: '2', kind: 'epf', amount: 10_00_000, status: 'received_and_deployed', yearsOfService: 6 }),
    ];
    const { grossLumpSum, taxFreeAmount, taxableAmount } = computeAllBenefits(benefits);
    // Only gratuity (expected) is processed
    expect(grossLumpSum.toNumber()).toBe(18_00_000);
    expect(taxFreeAmount.toNumber()).toBe(18_00_000);
    expect(taxableAmount.toNumber()).toBe(0);
  });

  it('aggregates multiple benefits correctly', () => {
    const benefits: RetirementBenefit[] = [
      benefit({ id: '1', kind: 'gratuity', amount: 18_00_000, status: 'expected' }),
      benefit({ id: '2', kind: 'leave_encashment', amount: 30_00_000, status: 'expected' }),
      benefit({ id: '3', kind: 'epf', amount: 15_00_000, status: 'expected', yearsOfService: 6 }),
    ];
    const { grossLumpSum, taxFreeAmount, taxableAmount } = computeAllBenefits(benefits);
    // Gratuity: ₹18L exempt, ₹0 taxable
    // Leave encashment: ₹25L exempt, ₹5L taxable
    // EPF: ₹15L exempt, ₹0 taxable
    expect(grossLumpSum.toNumber()).toBe(63_00_000); // 18+30+15
    expect(taxFreeAmount.toNumber()).toBe(58_00_000); // 18+25+15
    expect(taxableAmount.toNumber()).toBe(5_00_000);  // 5L from leave encashment
  });

  it('NPS annuity corpus is tracked separately', () => {
    const benefits: RetirementBenefit[] = [
      benefit({ id: '1', kind: 'nps_lumpsum', amount: 50_00_000, status: 'expected' }),
    ];
    const { totalAnnuityCorpus } = computeAllBenefits(benefits);
    expect(totalAnnuityCorpus.toNumber()).toBe(new Decimal(50_00_000).times(0.4).toNumber());
  });

  it('returns empty result for no benefits', () => {
    const { grossLumpSum } = computeAllBenefits([]);
    expect(grossLumpSum.toNumber()).toBe(0);
  });
});

describe('Decimal precision', () => {
  it('1/3 split does not accumulate floating-point error', () => {
    const r = computeBenefitExemption(
      benefit({ kind: 'commuted_pension', amount: 9_00_000, receivesGratuity: true }),
    );
    // 1/3 of ₹9L = ₹3L exactly
    expect(r.exemptAmount.toDecimalPlaces(0).toNumber()).toBe(3_00_000);
    expect(r.taxableAmount.toDecimalPlaces(0).toNumber()).toBe(6_00_000);
  });
});
