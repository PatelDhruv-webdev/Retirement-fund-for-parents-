import Decimal from 'decimal.js';
import type { Profile, RiskAppetite } from '../types/profile';
import type { AllocationAdvice, AllocationLine, EnoughResult } from '../types/insights';
import {
  SCSS_RATE_PCT,
  POMIS_RATE_PCT,
  SCSS_MAX_PER_PERSON,
} from './constants';
import { computeMonthlyIncome } from './income';

// ── "Is this enough?" benchmarks ─────────────────────────────────────────────

// Benchmark 1 (conservative): corpus interest alone covers the monthly gap.
// At SCSS rate 8.2%, required corpus = gap × 12 / 0.082
// Benchmark 2 (SWR 4%): 25× annual gap — corpus + growth lasts 30+ years.

function computeEnough(
  corpus: Decimal,
  monthlyGap: Decimal,
): EnoughResult {
  if (monthlyGap.lte(0)) {
    const zero = new Decimal(0);
    return {
      isEnough: true,
      requiredCorpusConservative: zero,
      requiredCorpus4PctSWR: zero,
      surplusConservative: corpus,
      surplus4PctSWR: corpus,
    };
  }

  const annualGap = monthlyGap.times(12);
  const requiredConservative = annualGap.dividedBy(SCSS_RATE_PCT / 100);
  const required4Pct         = annualGap.dividedBy(0.04); // 25× rule

  return {
    isEnough: corpus.gte(requiredConservative),
    requiredCorpusConservative: requiredConservative,
    requiredCorpus4PctSWR: required4Pct,
    surplusConservative: corpus.minus(requiredConservative),
    surplus4PctSWR: corpus.minus(required4Pct),
  };
}

// ── Risk-based allocation ─────────────────────────────────────────────────────

type RatioSet = {
  safety: number;      // liquid/savings
  scss: number;        // SCSS — quarterly payout, max ₹30L/person
  pomis: number;       // POMIS — monthly payout, max ₹9L/person
  fd: number;          // Bank FD
  balanced: number;    // Balanced/hybrid MF (moderate growth + income)
  equity: number;      // Pure equity MF (long-term growth, 10+ years)
};

const RATIOS: Record<RiskAppetite, RatioSet> = {
  conservative: { safety: 0.10, scss: 0.35, pomis: 0.12, fd: 0.18, balanced: 0.18, equity: 0.07 },
  moderate:     { safety: 0.08, scss: 0.25, pomis: 0.08, fd: 0.14, balanced: 0.22, equity: 0.23 },
  aggressive:   { safety: 0.06, scss: 0.18, pomis: 0.05, fd: 0.10, balanced: 0.18, equity: 0.43 },
};

// Expected annual returns by instrument (conservative estimates, FY 2026-27)
const RETURNS: Record<string, number> = {
  safety:   0.035, // savings account
  scss:     SCSS_RATE_PCT  / 100,
  pomis:    POMIS_RATE_PCT / 100,
  fd:       0.070,
  balanced: 0.095,
  equity:   0.120,
};

export function computeAllocationAdvice(profile: Profile, corpus: Decimal): AllocationAdvice {
  const riskAppetite: RiskAppetite = profile.riskAppetite ?? 'conservative';
  const monthlyIncome = computeMonthlyIncome(profile.income);
  const monthlyExpenses = new Decimal(profile.monthlyExpenses);
  const monthlyGap = Decimal.max(monthlyExpenses.minus(monthlyIncome), 0);

  const enough = computeEnough(corpus, monthlyGap);
  const ratios = RATIOS[riskAppetite];

  // SCSS max: ₹30L × number of people (1 or 2)
  const numPeople = (profile.person.ageDad ? 1 : 0) + (profile.person.ageMom ? 1 : 0) || 1;
  const scssMax = new Decimal(SCSS_MAX_PER_PERSON * numPeople);

  function alloc(ratio: number): Decimal {
    return corpus.times(ratio).toDecimalPlaces(0);
  }

  const safetyAmt   = alloc(ratios.safety);
  const scssRaw     = alloc(ratios.scss);
  const scssAmt     = Decimal.min(scssRaw, scssMax);
  const pomisAmt    = alloc(ratios.pomis);
  const fdAmt       = alloc(ratios.fd).plus(Decimal.max(scssRaw.minus(scssMax), 0)); // overflow from SCSS cap → FD
  const balancedAmt = alloc(ratios.balanced);
  const equityAmt   = alloc(ratios.equity);

  const allocations: AllocationLine[] = [
    {
      bucket: 'Safety — Emergency Buffer',
      instrument: 'Savings account + Liquid Mutual Fund',
      amount: safetyAmt,
      rationale: 'Keep 12 months of expenses instantly accessible. This is your peace-of-mind fund — never invest this.',
      expectedMonthlyIncome: safetyAmt.times(RETURNS.safety).dividedBy(12),
      riskNote: 'Zero risk — bank deposit guarantee up to ₹5L',
    },
    {
      bucket: 'Income — Senior Citizen Savings Scheme (SCSS)',
      instrument: `SCSS @ ${SCSS_RATE_PCT}% p.a.`,
      amount: scssAmt,
      rationale: `Highest safe yield for senior citizens — ₹${(SCSS_MAX_PER_PERSON / 100_000).toFixed(0)}L max per person. Quarterly interest, 5-year tenure (extendable by 3 years).`,
      expectedMonthlyIncome: scssAmt.times(RETURNS.scss).dividedBy(12),
      riskNote: 'Government-backed — highest safety',
    },
    {
      bucket: 'Income — Post Office Monthly Income (POMIS)',
      instrument: `POMIS @ ${POMIS_RATE_PCT}% p.a.`,
      amount: pomisAmt,
      rationale: 'Monthly income directly to your bank account. Max ₹9L per person (₹15L joint). 5-year tenure.',
      expectedMonthlyIncome: pomisAmt.times(RETURNS.pomis).dividedBy(12),
      riskNote: 'Government-backed — highest safety',
    },
    {
      bucket: 'Income — Bank Fixed Deposits',
      instrument: 'Bank FD @ ~7% p.a.',
      amount: fdAmt,
      rationale: 'Flexible tenure (1–5 years), laddered for liquidity. Senior-citizen FDs earn 0.25–0.50% extra at most banks.',
      expectedMonthlyIncome: fdAmt.times(RETURNS.fd).dividedBy(12),
      riskNote: 'DICGC cover up to ₹5L per bank',
    },
    {
      bucket: 'Growth — Balanced / Hybrid Mutual Fund',
      instrument: 'Aggressive Hybrid MF (60–80% equity)',
      amount: balancedAmt,
      rationale: 'Beats inflation over 7–10 years while cushioning market falls. Use systematic withdrawal plan (SWP) for monthly income.',
      expectedMonthlyIncome: balancedAmt.times(RETURNS.balanced).dividedBy(12),
      riskNote: 'Moderate risk — can fall 20–30% in bad years; recovers over time',
    },
    ...(equityAmt.gt(0) ? [{
      bucket: 'Growth — Pure Equity Mutual Fund',
      instrument: 'Large-cap / Index Fund',
      amount: equityAmt,
      rationale: 'Long-term growth (10+ year horizon). Only for money you will not need for 10 years. Aim for ₹1.25L annual redemption within the LTCG exemption.',
      expectedMonthlyIncome: equityAmt.times(RETURNS.equity).dividedBy(12),
      riskNote: 'Higher risk — can fall 40–50% in bad years; best for legacy / children',
    }] : []),
  ].filter(a => a.amount.gt(0));

  const totalProjectedMonthlyIncome = allocations.reduce(
    (s, a) => s.plus(a.expectedMonthlyIncome), new Decimal(0),
  );

  const totalProjectedAnnualReturn = allocations.reduce(
    (s, a) => s.plus(a.expectedMonthlyIncome.times(12)), new Decimal(0),
  );

  const expectedReturnPct = corpus.gt(0)
    ? totalProjectedAnnualReturn.dividedBy(corpus).times(100).toDecimalPlaces(1).toNumber()
    : 0;

  const actionItems = buildActionItems(profile, corpus, riskAppetite, enough, scssAmt, scssMax, numPeople);

  return {
    riskAppetite,
    corpus,
    enough,
    allocations,
    totalProjectedMonthlyIncome,
    totalProjectedAnnualReturn,
    expectedReturnPct,
    actionItems,
  };
}

function buildActionItems(
  profile: Profile,
  corpus: Decimal,
  _risk: RiskAppetite,
  enough: EnoughResult,
  scssAmt: Decimal,
  scssMax: Decimal,
  numPeople: number,
): string[] {
  const items: string[] = [];

  // Health insurance check
  if (!profile.health.insured) {
    items.push('Get a senior-citizen health insurance policy of at least ₹10 lakh immediately — medical expenses are the biggest retirement risk.');
  } else if ((profile.health.sumInsured ?? 0) < 500_000) {
    items.push('Upgrade health insurance to at least ₹10 lakh. Current cover is too low for hospital costs in 2026.');
  }

  // SCSS — make sure they open accounts
  if (scssAmt.gt(0)) {
    const scssUsed = Decimal.min(scssAmt, scssMax);
    items.push(
      `Open SCSS account${numPeople > 1 ? 's' : ''} (one per person) at nearest post office or bank. Invest ₹${(scssUsed.toNumber() / 100_000).toFixed(0)} lakh at 8.2% — highest safe yield for senior citizens.`,
    );
  }

  // POMIS
  items.push('Open a POMIS account at the post office for regular monthly income directly to your bank.');

  // Nomination
  items.push('Ensure all bank accounts, FDs, PPF, SCSS, POMIS, and mutual funds have a nominee registered. Do this first week after retirement.');

  // Will
  items.push('Consider making a registered Will to avoid family disputes. A simple Will can be drafted with a lawyer for under ₹5,000.');

  // Enough money
  if (!enough.isEnough) {
    const gap = enough.surplusConservative.abs();
    items.push(
      `Corpus is short by ~₹${(gap.toNumber() / 100_000).toFixed(0)} lakh to fully cover expenses from interest alone. Consider reducing monthly spending by ₹${(gap.times(SCSS_RATE_PCT / 100).dividedBy(1200).toDecimalPlaces(0).toNumber()).toLocaleString('en-IN')} or keeping some equity for long-term growth.`,
    );
  }

  // Form 15H for FD TDS
  items.push('File Form 15H every April with all banks and post offices to avoid TDS deduction on FD/SCSS interest (valid if total income is below taxable limit).');

  // Emergency contacts
  if (corpus.gt(5_000_000)) {
    items.push('Consider a fee-only SEBI-registered investment adviser (RIA) for an annual portfolio review. This costs ₹5,000–₹15,000 but is independent and unbiased (no commissions).');
  }

  return items;
}
