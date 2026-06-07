import Decimal from 'decimal.js';
import {
  EQUITY_STCG_RATE,
  EQUITY_LTCG_RATE,
  EQUITY_LTCG_ANNUAL_EXEMPT,
  GOLD_ETF_LTCG_MIN_MONTHS,
  GOLD_FOF_LTCG_MIN_MONTHS,
  GOLD_LTCG_RATE,
  CESS_RATE,
} from './constants';
import type { MutualFund } from '../types/profile';

export type CGResult = {
  grossGain: Decimal;
  stcgGain: Decimal;
  ltcgGain: Decimal;
  ltcgExemptApplied: Decimal;
  stcgTax: Decimal;
  ltcgTax: Decimal;
  totalTaxBeforeCess: Decimal;
  cess: Decimal;
  totalTax: Decimal;
  slabRateGain: Decimal; // for debt funds — caller adds this to slab income
  holdingMonths: number;
  isLTCG: boolean;
  note?: string;
};

// Compute capital gains tax when redeeming a mutual fund holding.
// redemptionAmount: the amount being redeemed (default = full currentValue).
// ltcgExemptAlreadyUsed: cumulative LTCG exempt already consumed in the same FY (₹1.25L limit is per year).
// asOf: the calculation date (must be passed in — no Date.now() in engine).
export function computeMFCapitalGains(
  fund: MutualFund,
  redemptionAmount: Decimal,
  ltcgExemptAlreadyUsed: Decimal,
  asOf: Date,
): CGResult {
  const currentValue = new Decimal(fund.currentValue);
  const invested = fund.investedTotal !== undefined
    ? new Decimal(fund.investedTotal)
    : new Decimal(0);

  // Redemption proportion (e.g. partial redemption)
  const proportion = currentValue.gt(0)
    ? redemptionAmount.dividedBy(currentValue)
    : new Decimal(1);

  const costBasis = invested.times(proportion);
  const grossGain = Decimal.max(redemptionAmount.minus(costBasis), 0);

  if (grossGain.isZero()) {
    return zeroResult(grossGain);
  }

  // Unknown cost basis: can't compute gains accurately. Return a note.
  if (fund.investedTotal === undefined) {
    return {
      ...zeroResult(new Decimal(0)),
      note: 'Cost basis unknown — enter the total amount you invested for accurate tax calculation',
    };
  }

  // Debt funds: always taxed at slab rate (no CG rate), any holding period
  if (fund.category === 'debt') {
    return {
      ...zeroResult(grossGain),
      slabRateGain: grossGain,
      note: 'Debt fund gains are taxed at your income-slab rate (no special CG rate after Apr 2023)',
    };
  }

  // Gold ETF / FoF
  if (fund.category === 'gold_etf' || fund.category === 'gold_fof') {
    return computeGoldCG(fund, grossGain, ltcgExemptAlreadyUsed, asOf);
  }

  // Equity / hybrid (≥65% equity)
  return computeEquityCG(fund, grossGain, ltcgExemptAlreadyUsed, asOf);
}

function computeEquityCG(
  fund: MutualFund,
  grossGain: Decimal,
  ltcgExemptAlreadyUsed: Decimal,
  asOf: Date,
): CGResult {
  const { ltcgFraction, stcgFraction, holdingMonths } = computeEquitySipSplit(fund, asOf);

  const stcgGain = grossGain.times(stcgFraction);
  const ltcgGain = grossGain.times(ltcgFraction);

  // LTCG exemption: ₹1.25L/year, shared across all equity redemptions
  const ltcgExemptRemaining = Decimal.max(
    new Decimal(EQUITY_LTCG_ANNUAL_EXEMPT).minus(ltcgExemptAlreadyUsed),
    0,
  );
  const ltcgExemptApplied = Decimal.min(ltcgGain, ltcgExemptRemaining);
  const taxableLTCG = Decimal.max(ltcgGain.minus(ltcgExemptApplied), 0);

  const stcgTax = stcgGain.times(EQUITY_STCG_RATE);
  const ltcgTax = taxableLTCG.times(EQUITY_LTCG_RATE);
  const totalTaxBeforeCess = stcgTax.plus(ltcgTax);
  const cess = totalTaxBeforeCess.times(CESS_RATE);
  const totalTax = totalTaxBeforeCess.plus(cess);

  const note = fund.mode === 'sip'
    ? 'SIP: LTCG/STCG split estimated via FIFO approximation (exact result needs full instalment history)'
    : undefined;

  return {
    grossGain,
    stcgGain,
    ltcgGain,
    ltcgExemptApplied,
    stcgTax,
    ltcgTax,
    totalTaxBeforeCess,
    cess,
    totalTax,
    slabRateGain: new Decimal(0),
    holdingMonths,
    isLTCG: ltcgFraction > 0,
    note,
  };
}

function computeGoldCG(
  fund: MutualFund,
  grossGain: Decimal,
  _ltcgExemptAlreadyUsed: Decimal,
  asOf: Date,
): CGResult {
  const ltcgMinMonths = fund.category === 'gold_fof'
    ? GOLD_FOF_LTCG_MIN_MONTHS
    : GOLD_ETF_LTCG_MIN_MONTHS;

  const holdingMonths = fund.startDate
    ? monthsBetween(new Date(fund.startDate), asOf)
    : 0;
  const isLTCG = holdingMonths >= ltcgMinMonths;

  if (isLTCG) {
    const ltcgTax = grossGain.times(GOLD_LTCG_RATE);
    const cess = ltcgTax.times(CESS_RATE);
    return {
      grossGain,
      stcgGain: new Decimal(0),
      ltcgGain: grossGain,
      ltcgExemptApplied: new Decimal(0), // no ₹1.25L exemption for gold
      stcgTax: new Decimal(0),
      ltcgTax,
      totalTaxBeforeCess: ltcgTax,
      cess,
      totalTax: ltcgTax.plus(cess),
      slabRateGain: new Decimal(0),
      holdingMonths,
      isLTCG: true,
    };
  }

  // STCG: taxed at slab rate
  return {
    ...zeroResult(grossGain),
    slabRateGain: grossGain,
    holdingMonths,
    isLTCG: false,
    note: `Gold ${fund.category === 'gold_fof' ? 'FoF' : 'ETF'} STCG (held ${holdingMonths} months < ${ltcgMinMonths}) — taxed at slab rate`,
  };
}

// For a SIP, split the gross gain into LTCG and STCG fractions using a FIFO approximation.
// Units bought in the last 12 months are STCG; earlier ones are LTCG.
function computeEquitySipSplit(
  fund: MutualFund,
  asOf: Date,
): { ltcgFraction: number; stcgFraction: number; holdingMonths: number } {
  if (fund.mode === 'lumpsum' || !fund.startDate) {
    const holdingMonths = fund.startDate
      ? monthsBetween(new Date(fund.startDate), asOf)
      : 0;
    const isLTCG = holdingMonths >= 12;
    return { ltcgFraction: isLTCG ? 1 : 0, stcgFraction: isLTCG ? 0 : 1, holdingMonths };
  }

  // SIP FIFO approximation
  const totalMonths = Math.max(monthsBetween(new Date(fund.startDate), asOf), 1);
  if (totalMonths < 12) {
    return { ltcgFraction: 0, stcgFraction: 1, holdingMonths: totalMonths };
  }
  const stcgMonths = 12;
  const ltcgMonths = totalMonths - stcgMonths;
  return {
    ltcgFraction: ltcgMonths / totalMonths,
    stcgFraction: stcgMonths / totalMonths,
    holdingMonths: totalMonths,
  };
}

function monthsBetween(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  return Math.max(years * 12 + months, 0);
}

function zeroResult(grossGain: Decimal): CGResult {
  const zero = new Decimal(0);
  return {
    grossGain,
    stcgGain: zero,
    ltcgGain: zero,
    ltcgExemptApplied: zero,
    stcgTax: zero,
    ltcgTax: zero,
    totalTaxBeforeCess: zero,
    cess: zero,
    totalTax: zero,
    slabRateGain: zero,
    holdingMonths: 0,
    isLTCG: false,
  };
}
