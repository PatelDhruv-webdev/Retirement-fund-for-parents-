import Decimal from 'decimal.js';
import type { Profile } from '../types/profile';
import type { Insights, RetirementTransitionInsights, FixItItem } from '../types/insights';
import { computeNetWorth } from './netWorth';
import { computeMonthlyIncome, computeAnnualSlabIncome, hasPensionIncome, computeMonthlyEMIs } from './income';
import { computeNewRegimeTax } from './tax';
import { computeAllBenefits } from './retirementBenefits';
import { computeLongevity } from './longevity';
import { computePortfolioCGSummary } from './capitalGainsSummary';
import { computeAllocationAdvice } from './advisory';
import {
  CORPUS_INCOME_RATE_PCT,
  DEFAULT_PORTFOLIO_RETURN_PCT,
  DEFAULT_INFLATION_PCT,
} from './constants';

// Top-level compute function. Pure: no I/O, no side effects.
// asOf must be passed in from the UI — never use Date.now() here.
export function compute(profile: Profile, asOf: Date): Insights {
  const { totalNetWorth, investableWealth, buckets } = computeNetWorth(profile);

  const monthlyIncome = computeMonthlyIncome(profile.income);
  const monthlyEMIs = computeMonthlyEMIs(profile);
  const monthlyExpenses = new Decimal(profile.monthlyExpenses);
  const surplus = monthlyIncome.minus(monthlyExpenses).minus(monthlyEMIs);

  const annualSlabIncome = computeAnnualSlabIncome(profile);
  const hasPension = hasPensionIncome(profile);
  const annualTax = computeNewRegimeTax(annualSlabIncome, hasPension);

  // Retirement transition (only for about_to_retire)
  let retirementTransition: RetirementTransitionInsights | undefined;
  if (profile.person.retirementStage === 'about_to_retire' && profile.retirementBenefits.length > 0) {
    retirementTransition = computeRetirementTransition(profile, investableWealth, asOf);
  }

  // Portfolio capital gains summary
  const capitalGainsSummary = computePortfolioCGSummary(profile.mutualFunds, asOf);

  // Corpus for advisory and longevity
  const corpusForAdvice = retirementTransition
    ? retirementTransition.totalCorpus
    : investableWealth;

  // Allocation advice (risk-based)
  const allocationAdvice = computeAllocationAdvice(profile, corpusForAdvice);

  // Longevity
  const longevityDad = profile.person.ageDad !== undefined
    ? computeLongevity({
        corpus: corpusForAdvice,
        monthlyExpenses,
        monthlyIncome,
        annualReturnPct: DEFAULT_PORTFOLIO_RETURN_PCT,
        annualInflationPct: DEFAULT_INFLATION_PCT,
        currentAge: profile.person.ageDad,
      })
    : undefined;

  const longevityMom = profile.person.ageMom !== undefined
    ? computeLongevity({
        corpus: corpusForAdvice,
        monthlyExpenses,
        monthlyIncome,
        annualReturnPct: DEFAULT_PORTFOLIO_RETURN_PCT,
        annualInflationPct: DEFAULT_INFLATION_PCT,
        currentAge: profile.person.ageMom,
      })
    : undefined;

  const guiltFreeSpend = retirementTransition
    ? Decimal.max(retirementTransition.projectedMonthlySurplus, 0)
    : Decimal.max(surplus, 0);

  const fixItList = buildFixItList(profile, surplus, investableWealth);

  return {
    totalNetWorth,
    investableWealth,
    buckets,
    cashFlow: {
      monthlyIncome,
      monthlyExpenses,
      monthlyEMIs,
      surplus,
    },
    annualTax,
    retirementTransition,
    capitalGainsSummary,
    allocationAdvice,
    longevity: {
      dad: longevityDad && profile.person.ageDad !== undefined
        ? { currentAge: profile.person.ageDad, ageAtDepletion: longevityDad.ageAtDepletion }
        : undefined,
      mom: longevityMom && profile.person.ageMom !== undefined
        ? { currentAge: profile.person.ageMom, ageAtDepletion: longevityMom.ageAtDepletion }
        : undefined,
      assumedReturnRatePct: DEFAULT_PORTFOLIO_RETURN_PCT,
      assumedInflationRatePct: DEFAULT_INFLATION_PCT,
    },
    guiltFreeSpend,
    fixItList,
  };
}

function computeRetirementTransition(
  profile: Profile,
  existingInvestableAssets: Decimal,
  _asOf: Date,
): RetirementTransitionInsights {
  const { benefitBreakdown, grossLumpSum, taxFreeAmount, taxableAmount, totalAnnuityCorpus } =
    computeAllBenefits(profile.retirementBenefits);

  const baseAnnualIncome = computeAnnualSlabIncome(profile);
  const hasPension = hasPensionIncome(profile);
  const taxWithBenefits = computeNewRegimeTax(
    baseAnnualIncome.plus(taxableAmount),
    hasPension,
  );
  const taxWithoutBenefits = computeNewRegimeTax(baseAnnualIncome, hasPension);
  const taxOnReceiptYear = taxWithBenefits.totalTax.minus(taxWithoutBenefits.totalTax);

  const netInvestableCorpusFromBenefits = taxFreeAmount.plus(
    Decimal.max(taxableAmount.minus(taxOnReceiptYear), 0),
  );

  const totalCorpus = netInvestableCorpusFromBenefits.plus(existingInvestableAssets);

  const projectedMonthlyCorpusIncome = totalCorpus
    .times(CORPUS_INCOME_RATE_PCT).dividedBy(100).dividedBy(12);

  const projectedMonthlyPension = computeMonthlyIncome(profile.income)
    .plus(totalAnnuityCorpus.times(CORPUS_INCOME_RATE_PCT).dividedBy(100).dividedBy(12));

  const projectedMonthlyIncomeFloor = projectedMonthlyCorpusIncome.plus(projectedMonthlyPension);
  const projectedMonthlySurplus = projectedMonthlyIncomeFloor.minus(profile.monthlyExpenses);

  return {
    grossLumpSum,
    taxFreeAmount,
    taxableAmount,
    taxOnReceiptYear,
    netInvestableCorpusFromBenefits,
    existingInvestableAssets,
    totalCorpus,
    projectedMonthlyCorpusIncome,
    projectedMonthlyPension,
    projectedMonthlyIncomeFloor,
    projectedMonthlySurplus,
    benefitBreakdown,
  };
}

function buildFixItList(
  profile: Profile,
  surplus: Decimal,
  investableWealth: Decimal,
): FixItItem[] {
  const items: FixItItem[] = [];
  const expenses = new Decimal(profile.monthlyExpenses);

  const safetyFund = new Decimal(
    (profile.cash.savingsBalance ?? 0) + (profile.cash.idleCash ?? 0),
  );
  if (expenses.gt(0) && safetyFund.lt(expenses.times(6))) {
    items.push({
      severity: 'warn',
      message: `Emergency fund is low — less than 6 months of expenses. Keep at least ₹${expenses.times(6).toDecimalPlaces(0).toNumber().toLocaleString('en-IN')} in savings.`,
    });
  }

  if (surplus.lt(0)) {
    items.push({
      severity: 'warn',
      message: `Monthly income is less than expenses by ₹${surplus.abs().toDecimalPlaces(0).toNumber().toLocaleString('en-IN')}. Investments will be drawn down each month.`,
    });
  }

  if (!profile.health.insured) {
    items.push({
      severity: 'warn',
      message: 'No health insurance found. A ₹10–15 lakh senior-citizen health policy is strongly recommended.',
    });
  }

  if (profile.health.insured && (profile.health.sumInsured ?? 0) < 500_000) {
    items.push({
      severity: 'warn',
      message: `Health cover of ₹${((profile.health.sumInsured ?? 0) / 100_000).toFixed(1)}L is low. Consider upgrading to at least ₹10L.`,
    });
  }

  if (investableWealth.isZero()) {
    items.push({
      severity: 'info',
      message: 'No investable assets entered yet. Add savings, FDs, or mutual funds for a complete picture.',
    });
  }

  return items;
}

// Re-export for use in UI components
export { computeMFCapitalGains } from './capitalGains';
export { computeLongevity } from './longevity';
export { computeNewRegimeTax } from './tax';
