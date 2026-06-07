import type Decimal from 'decimal.js';
import type { RiskAppetite } from './profile';

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
  projectedMonthlyCorpusIncome: Decimal;
  projectedMonthlyPension: Decimal;
  projectedMonthlyIncomeFloor: Decimal;
  projectedMonthlySurplus: Decimal;
  benefitBreakdown: BenefitInsight[];
};

// ── Capital Gains Summary ────────────────────────────────────────────────────

export type CGLine = {
  id: string;
  label: string;
  category: string;
  currentValue: Decimal;
  investedTotal: Decimal;
  unrealisedGain: Decimal;
  holdingMonths: number;
  estimatedTax: Decimal;     // if sold today (LTCG/STCG at applicable rate)
  taxBasis: string;          // human-readable explanation
  slabRateGain: Decimal;     // debt/gold-STCG portion added to slab income
  dividendAnnual: Decimal;   // annual dividend income (taxable at slab)
};

export type PortfolioCGSummary = {
  lines: CGLine[];
  totalCurrentValue: Decimal;
  totalInvested: Decimal;
  totalUnrealisedGain: Decimal;
  totalEstimatedTax: Decimal;       // flat-rate CG tax (LTCG + STCG)
  totalSlabRateGain: Decimal;       // gains taxed at slab (debt + gold STCG)
  ltcgGainTotal: Decimal;
  stcgGainTotal: Decimal;
  ltcgExemptApplied: Decimal;       // how much of the ₹1.25L annual exempt was used
  totalDividendAnnual: Decimal;
  asOf: string;                      // ISO date used for the calculation
};

// ── Advisory / "Is this enough?" ────────────────────────────────────────────

export type EnoughResult = {
  isEnough: boolean;
  // Conservative: corpus interest alone covers monthly gap (no principal drawn)
  requiredCorpusConservative: Decimal;   // monthly_gap × 12 / SCSS_rate
  // 4% SWR (25× annual expenses): corpus outlasts 30+ years with growth
  requiredCorpus4PctSWR: Decimal;        // monthly_gap × 300
  surplusConservative: Decimal;          // positive = more than needed, negative = gap
  surplus4PctSWR: Decimal;
};

export type AllocationLine = {
  bucket: string;
  instrument: string;
  amount: Decimal;
  rationale: string;
  expectedMonthlyIncome: Decimal;
  riskNote: string;
};

export type AllocationAdvice = {
  riskAppetite: RiskAppetite;
  corpus: Decimal;
  enough: EnoughResult;
  allocations: AllocationLine[];
  totalProjectedMonthlyIncome: Decimal;   // from the recommended allocation
  totalProjectedAnnualReturn: Decimal;
  expectedReturnPct: number;              // blended return % for this allocation
  actionItems: string[];                  // ordered list of concrete next steps
};

// ── Longevity ────────────────────────────────────────────────────────────────

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

// ── Top-level Insights ───────────────────────────────────────────────────────

export type Insights = {
  totalNetWorth: Decimal;
  investableWealth: Decimal;
  buckets: Buckets;
  cashFlow: CashFlow;
  annualTax: TaxSummary;
  retirementTransition?: RetirementTransitionInsights;
  capitalGainsSummary: PortfolioCGSummary;
  allocationAdvice: AllocationAdvice;
  longevity: LongevityInsights;
  guiltFreeSpend: Decimal;
  fixItList: FixItItem[];
};
