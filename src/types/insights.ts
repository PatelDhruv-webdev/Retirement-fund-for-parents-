import type Decimal from 'decimal.js';

// Output of the engine — all monetary values are Decimal (rupees, never float).
// FY 2026-27, new regime only (Phase 1).

export type Buckets = {
  safety: Decimal;         // cash + liquid funds
  income: Decimal;         // SCSS + POMIS + FD + annuity + debt MFs
  growth: Decimal;         // equity + hybrid MFs
  legacyLifestyle: Decimal; // self-occupied property + gold
};

export type CashFlow = {
  monthlyIncome: Decimal;
  monthlyExpenses: Decimal;
  monthlyEMIs: Decimal;
  surplus: Decimal; // can be negative
};

export type TaxSummary = {
  grossSlabIncome: Decimal;
  standardDeduction: Decimal;
  taxableIncome: Decimal;
  taxBeforeRebate: Decimal;
  rebate87A: Decimal;
  taxAfterRebate: Decimal;
  cess: Decimal;
  totalTax: Decimal;
  effectiveRate: Decimal; // totalTax / grossSlabIncome, 0 if no income
};

export type BenefitInsight = {
  kind: string;
  label: string;
  grossAmount: Decimal;
  exemptAmount: Decimal;
  taxableAmount: Decimal;
  exemptionBasis: string;
  // Only for NPS: the annuity portion (not a lump sum)
  annuityCorpus?: Decimal;
  estimatedMonthlyAnnuity?: Decimal;
};

export type RetirementTransitionInsights = {
  grossLumpSum: Decimal;
  taxFreeAmount: Decimal;
  taxableAmount: Decimal;
  taxOnReceiptYear: Decimal;
  netInvestableCorpusFromBenefits: Decimal;
  existingInvestableAssets: Decimal;
  totalCorpus: Decimal;
  projectedMonthlyCorpusIncome: Decimal; // at SCSS rate 8.2%
  projectedMonthlyPension: Decimal;      // ongoing pension income
  projectedMonthlyIncomeFloor: Decimal;  // corpus income + pension
  projectedMonthlySurplus: Decimal;      // income floor - expenses
  benefitBreakdown: BenefitInsight[];
};

export type LongevityResult = {
  currentAge: number;
  ageAtDepletion: number | 'outlasts_120';
};

export type LongevityInsights = {
  dad?: LongevityResult;
  mom?: LongevityResult;
  assumedReturnRatePct: number;
  assumedInflationRatePct: number;
};

export type FixItSeverity = 'warn' | 'info';

export type FixItItem = {
  severity: FixItSeverity;
  message: string;
};

export type Insights = {
  totalNetWorth: Decimal;
  investableWealth: Decimal;
  buckets: Buckets;
  cashFlow: CashFlow;
  annualTax: TaxSummary;
  retirementTransition?: RetirementTransitionInsights;
  longevity: LongevityInsights;
  guiltFreeSpend: Decimal;
  fixItList: FixItItem[];
};
