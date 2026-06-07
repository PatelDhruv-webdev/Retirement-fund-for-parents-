import Decimal from 'decimal.js';
import type { MutualFund } from '../types/profile';
import type { PortfolioCGSummary, CGLine } from '../types/insights';
import { computeMFCapitalGains } from './capitalGains';
import { EQUITY_LTCG_ANNUAL_EXEMPT } from './constants';

// Compute the full unrealised capital-gains picture for the entire portfolio.
// Assumes full redemption of each holding (worst-case tax view).
// ₹1.25L LTCG annual exemption is shared across all equity holdings.
export function computePortfolioCGSummary(funds: MutualFund[], asOf: Date): PortfolioCGSummary {
  const lines: CGLine[] = [];
  let ltcgExemptUsed = new Decimal(0);
  const ltcgExemptPool = new Decimal(EQUITY_LTCG_ANNUAL_EXEMPT);

  let totalCurrentValue = new Decimal(0);
  let totalInvested     = new Decimal(0);
  let totalUnrealised   = new Decimal(0);
  let totalEstimatedTax = new Decimal(0);
  let totalSlabRate     = new Decimal(0);
  let ltcgGainTotal     = new Decimal(0);
  let stcgGainTotal     = new Decimal(0);
  let totalDividend     = new Decimal(0);

  for (const fund of funds) {
    const currentValue = new Decimal(fund.currentValue);
    const invested     = new Decimal(fund.investedTotal ?? 0);
    const unrealised   = Decimal.max(currentValue.minus(invested), 0);
    const dividendAnnual = new Decimal((fund.dividendMonthly ?? 0) * 12);

    totalCurrentValue = totalCurrentValue.plus(currentValue);
    totalInvested     = totalInvested.plus(invested);
    totalUnrealised   = totalUnrealised.plus(unrealised);
    totalDividend     = totalDividend.plus(dividendAnnual);

    // Skip zero-value holdings
    if (currentValue.isZero()) continue;

    // Pass the running ltcgExemptUsed so the ₹1.25L pool is shared across equity holdings
    const cg = computeMFCapitalGains(fund, currentValue, ltcgExemptUsed, asOf);

    // Update the shared exemption pool for equity/stock categories
    if (fund.category === 'equity' || fund.category === 'stock' || fund.category === 'hybrid') {
      ltcgExemptUsed = Decimal.min(ltcgExemptUsed.plus(cg.ltcgGain), ltcgExemptPool);
    }

    ltcgGainTotal     = ltcgGainTotal.plus(cg.ltcgGain);
    stcgGainTotal     = stcgGainTotal.plus(cg.stcgGain);
    totalEstimatedTax = totalEstimatedTax.plus(cg.totalTax);
    totalSlabRate     = totalSlabRate.plus(cg.slabRateGain);

    const taxBasis = buildTaxBasis(fund, cg, ltcgExemptUsed);

    lines.push({
      id: fund.id,
      label: fund.label || fund.category,
      category: fund.category,
      currentValue,
      investedTotal: invested,
      unrealisedGain: unrealised,
      holdingMonths: cg.holdingMonths,
      estimatedTax: cg.totalTax,
      taxBasis,
      slabRateGain: cg.slabRateGain,
      dividendAnnual,
    });
  }

  return {
    lines,
    totalCurrentValue,
    totalInvested,
    totalUnrealisedGain: totalUnrealised,
    totalEstimatedTax,
    totalSlabRateGain: totalSlabRate,
    ltcgGainTotal,
    stcgGainTotal,
    ltcgExemptApplied: Decimal.min(ltcgExemptUsed, ltcgExemptPool),
    totalDividendAnnual: totalDividend,
    asOf: asOf.toISOString().slice(0, 10),
  };
}

function buildTaxBasis(
  fund: MutualFund,
  cg: ReturnType<typeof computeMFCapitalGains>,
  _ltcgUsed: Decimal,
): string {
  if (fund.category === 'debt') {
    return 'Debt fund — taxed at your income-tax slab rate (not at flat CG rate)';
  }
  if (cg.grossGain.isZero() || fund.investedTotal === undefined) {
    return 'Cost basis unknown — enter invested amount for accurate calculation';
  }
  const parts: string[] = [];
  if (cg.stcgGain.gt(0)) {
    parts.push(`STCG ₹${fmt(cg.stcgGain)} @ 20%`);
  }
  if (cg.ltcgGain.gt(0)) {
    if (cg.ltcgExemptApplied.gt(0)) {
      parts.push(`LTCG ₹${fmt(cg.ltcgGain)} (₹${fmt(cg.ltcgExemptApplied)} exempt) @ 12.5%`);
    } else {
      parts.push(`LTCG ₹${fmt(cg.ltcgGain)} @ 12.5%`);
    }
  }
  if (cg.note) parts.push(cg.note);
  return parts.length ? parts.join(' · ') : 'No capital gains';
}

function fmt(d: Decimal): string {
  const n = d.toDecimalPlaces(0).toNumber();
  const lakh = n / 100_000;
  return lakh >= 1 ? `${lakh.toFixed(1)}L` : `${n.toLocaleString('en-IN')}`;
}
