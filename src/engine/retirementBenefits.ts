import Decimal from 'decimal.js';
import {
  GRATUITY_EXEMPT_LIMIT_NON_GOVT,
  LEAVE_ENCASHMENT_EXEMPT_LIMIT_NON_GOVT,
  VRS_EXEMPT_LIMIT,
  NPS_TAXFREE_FRACTION,
  NPS_ANNUITY_FRACTION,
  EPF_MIN_SERVICE_YEARS_EXEMPT,
  COMMUTED_PENSION_EXEMPT_WITH_GRATUITY,
  COMMUTED_PENSION_EXEMPT_WITHOUT_GRATUITY,
  SCSS_RATE_PCT,
} from './constants';
import type { RetirementBenefit } from '../types/profile';
import type { BenefitInsight } from '../types/insights';

// Compute the exempt/taxable split for a single retirement benefit.
// Rules are from Sec 10 of the Income Tax Act (FY 2026-27).
// Simplifications for Phase 1 (noted where applicable):
//   - Gratuity formula (15/26 × last basic × years) requires last-basic, which
//     we don't collect. We use min(actual, ₹20L) — conservative for the user.
//   - Leave encashment formula similarly simplified to min(actual, ₹25L).
export function computeBenefitExemption(benefit: RetirementBenefit): BenefitInsight {
  const gross = new Decimal(benefit.amount);

  switch (benefit.kind) {
    case 'gratuity':
      return computeGratuity(gross, benefit);

    case 'leave_encashment':
      return computeLeaveEncashment(gross, benefit);

    case 'commuted_pension':
      return computeCommutedPension(gross, benefit);

    case 'epf':
    case 'gpf':
      return computeEPF(gross, benefit);

    case 'nps_lumpsum':
      return computeNPS(gross, benefit);

    case 'vrs':
      return computeVRS(gross, benefit);

    case 'superannuation':
      // Superannuation fund: taxable if > ₹1.5L/year contribution by employer; simplify to fully taxable
      return {
        kind: benefit.kind,
        label: benefit.label ?? 'Superannuation',
        grossAmount: gross,
        exemptAmount: new Decimal(0),
        taxableAmount: gross,
        exemptionBasis: 'Taxable — verify with your CA (superannuation rules are employer-scheme dependent)',
      };

    case 'other':
    default:
      return {
        kind: benefit.kind,
        label: benefit.label ?? 'Other benefit',
        grossAmount: gross,
        exemptAmount: new Decimal(0),
        taxableAmount: gross,
        exemptionBasis: 'Assumed fully taxable — verify with your CA',
      };
  }
}

function computeGratuity(gross: Decimal, b: RetirementBenefit): BenefitInsight {
  if (b.employmentType === 'government') {
    return {
      kind: 'gratuity',
      label: b.label ?? 'Gratuity',
      grossAmount: gross,
      exemptAmount: gross,
      taxableAmount: new Decimal(0),
      exemptionBasis: 'Fully exempt — Government employee (no ceiling)',
    };
  }
  // Non-government: exempt = min(actual, ₹20L)
  // Phase 1 simplification: ignoring 15/26 × last-basic formula (need last-basic salary)
  const exempt = Decimal.min(gross, GRATUITY_EXEMPT_LIMIT_NON_GOVT);
  const taxable = Decimal.max(gross.minus(exempt), 0);
  return {
    kind: 'gratuity',
    label: b.label ?? 'Gratuity',
    grossAmount: gross,
    exemptAmount: exempt,
    taxableAmount: taxable,
    exemptionBasis: taxable.isZero()
      ? 'Fully exempt — under ₹20 lakh ceiling (Sec 10(10))'
      : `₹${fmtL(exempt)} exempt (₹20L ceiling); ₹${fmtL(taxable)} taxable`,
  };
}

function computeLeaveEncashment(gross: Decimal, b: RetirementBenefit): BenefitInsight {
  if (b.employmentType === 'government') {
    return {
      kind: 'leave_encashment',
      label: b.label ?? 'Leave Encashment',
      grossAmount: gross,
      exemptAmount: gross,
      taxableAmount: new Decimal(0),
      exemptionBasis: 'Fully exempt — Government employee (no ceiling)',
    };
  }
  const exempt = Decimal.min(gross, LEAVE_ENCASHMENT_EXEMPT_LIMIT_NON_GOVT);
  const taxable = Decimal.max(gross.minus(exempt), 0);
  return {
    kind: 'leave_encashment',
    label: b.label ?? 'Leave Encashment (छुट्टी का पैसा)',
    grossAmount: gross,
    exemptAmount: exempt,
    taxableAmount: taxable,
    exemptionBasis: taxable.isZero()
      ? 'Fully exempt — under ₹25 lakh ceiling (Sec 10(10AA))'
      : `₹${fmtL(exempt)} exempt (₹25L ceiling); ₹${fmtL(taxable)} taxable`,
  };
}

function computeCommutedPension(gross: Decimal, b: RetirementBenefit): BenefitInsight {
  if (b.employmentType === 'government') {
    return {
      kind: 'commuted_pension',
      label: b.label ?? 'Commuted Pension',
      grossAmount: gross,
      exemptAmount: gross,
      taxableAmount: new Decimal(0),
      exemptionBasis: 'Fully exempt — Government employee (Sec 10(10A))',
    };
  }
  // Non-govt: 1/3 exempt if they also receive gratuity, else 1/2 exempt
  const fraction = b.receivesGratuity
    ? COMMUTED_PENSION_EXEMPT_WITH_GRATUITY
    : COMMUTED_PENSION_EXEMPT_WITHOUT_GRATUITY;
  const exempt = gross.times(fraction);
  const taxable = gross.minus(exempt);
  const pct = Math.round(fraction * 100);
  return {
    kind: 'commuted_pension',
    label: b.label ?? 'Commuted Pension',
    grossAmount: gross,
    exemptAmount: exempt,
    taxableAmount: taxable,
    exemptionBasis: `${pct}% exempt (${b.receivesGratuity ? 'receives gratuity → 1/3' : 'no gratuity → 1/2'} exempt, Sec 10(10A))`,
  };
}

function computeEPF(gross: Decimal, b: RetirementBenefit): BenefitInsight {
  const kind = b.kind === 'gpf' ? 'GPF' : 'EPF';
  const hasEnoughService = b.yearsOfService !== undefined
    ? b.yearsOfService >= EPF_MIN_SERVICE_YEARS_EXEMPT
    : null;

  if (hasEnoughService === true || b.employmentType === 'government') {
    return {
      kind: b.kind,
      label: b.label ?? `${kind} (भविष्य निधि)`,
      grossAmount: gross,
      exemptAmount: gross,
      taxableAmount: new Decimal(0),
      exemptionBasis: `Fully exempt — ${b.employmentType === 'government' ? 'Government GPF' : `${b.yearsOfService ?? '≥5'} years of continuous service`}`,
    };
  }
  if (hasEnoughService === false) {
    return {
      kind: b.kind,
      label: b.label ?? `${kind}`,
      grossAmount: gross,
      exemptAmount: new Decimal(0),
      taxableAmount: gross,
      exemptionBasis: `Fully taxable — less than 5 years of continuous service (${b.yearsOfService} years)`,
    };
  }
  // Unknown service years — assume exempt but flag it
  return {
    kind: b.kind,
    label: b.label ?? `${kind}`,
    grossAmount: gross,
    exemptAmount: gross,
    taxableAmount: new Decimal(0),
    exemptionBasis: 'Assumed exempt (service years not provided — verify 5-year rule)',
  };
}

function computeNPS(gross: Decimal, b: RetirementBenefit): BenefitInsight {
  // 60% is tax-free lump sum. 40% must buy an annuity (taxable as monthly pension).
  const taxFree = gross.times(NPS_TAXFREE_FRACTION);
  const annuityCorpus = gross.times(NPS_ANNUITY_FRACTION);
  // Approximate monthly annuity at 6% (conservative annuity rate)
  const estimatedMonthlyAnnuity = annuityCorpus.times(0.06).dividedBy(12);

  return {
    kind: 'nps_lumpsum',
    label: b.label ?? 'NPS Corpus (राष्ट्रीय पेंशन प्रणाली)',
    grossAmount: gross,
    exemptAmount: taxFree,
    taxableAmount: new Decimal(0), // the 60% lump sum is fully tax-free; 40% is annuity, not a lump sum
    exemptionBasis: `60% (₹${fmtL(taxFree)}) is tax-free lump sum. 40% (₹${fmtL(annuityCorpus)}) must buy an annuity → becomes monthly pension.`,
    annuityCorpus,
    estimatedMonthlyAnnuity,
  };
}

function computeVRS(gross: Decimal, b: RetirementBenefit): BenefitInsight {
  const exempt = Decimal.min(gross, VRS_EXEMPT_LIMIT);
  const taxable = Decimal.max(gross.minus(exempt), 0);
  return {
    kind: 'vrs',
    label: b.label ?? 'VRS Compensation',
    grossAmount: gross,
    exemptAmount: exempt,
    taxableAmount: taxable,
    exemptionBasis: taxable.isZero()
      ? 'Fully exempt — under ₹5 lakh VRS ceiling (Sec 10(10C))'
      : `₹${fmtL(exempt)} exempt (₹5L ceiling); ₹${fmtL(taxable)} taxable`,
  };
}

// Compute total exempt, total taxable, and net investable corpus from all expected benefits.
export function computeAllBenefits(benefits: RetirementBenefit[]): {
  benefitBreakdown: BenefitInsight[];
  grossLumpSum: Decimal;
  taxFreeAmount: Decimal;
  taxableAmount: Decimal;
  totalAnnuityCorpus: Decimal;
} {
  const expected = benefits.filter(b => b.status === 'expected');
  const breakdown = expected.map(computeBenefitExemption);

  const grossLumpSum = breakdown.reduce((s, b) => s.plus(b.grossAmount), new Decimal(0));
  const taxFreeAmount = breakdown.reduce((s, b) => s.plus(b.exemptAmount), new Decimal(0));
  const taxableAmount = breakdown.reduce((s, b) => s.plus(b.taxableAmount), new Decimal(0));
  const totalAnnuityCorpus = breakdown.reduce(
    (s, b) => s.plus(b.annuityCorpus ?? 0),
    new Decimal(0),
  );

  return { benefitBreakdown: breakdown, grossLumpSum, taxFreeAmount, taxableAmount, totalAnnuityCorpus };
}

// Utility: format a Decimal as "X.XX lakh" for use in exemption basis strings.
function fmtL(d: Decimal): string {
  const lakhs = d.dividedBy(100_000).toDecimalPlaces(2).toNumber();
  return `${lakhs}L`;
}

// Rate used for NPS annuity income projection (conservative)
export const NPS_ANNUITY_ASSUMED_RATE = SCSS_RATE_PCT / 100;
