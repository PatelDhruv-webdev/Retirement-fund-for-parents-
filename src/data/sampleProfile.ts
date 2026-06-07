// Realistic "about to retire" seed profile for development and testing.
// Based on a typical Indian central-government employee retiring in 2026.
// All amounts are in rupees (INR).

import type { Profile } from '../types/profile';

export const sampleProfile: Profile = {
  person: {
    ageDad: 60,
    ageMom: 57,
    city: 'Pune',
    dependents: 0,
    retirementStage: 'about_to_retire',
    expectedRetirementYear: 2026,
  },

  // ── Retirement benefits (one-time, all expected) ────────────────────────────
  retirementBenefits: [
    {
      id: 'rb-gratuity',
      kind: 'gratuity',
      label: 'Gratuity',
      amount: 20_00_000,          // ₹20L (at ceiling for non-govt)
      employmentType: 'non_government',
      status: 'expected',
      yearsOfService: 32,
    },
    {
      id: 'rb-epf',
      kind: 'epf',
      label: 'EPF Corpus',
      amount: 45_00_000,          // ₹45L accumulated over 32 years
      employmentType: 'non_government',
      status: 'expected',
      yearsOfService: 32,
    },
    {
      id: 'rb-leave',
      kind: 'leave_encashment',
      label: 'Leave Encashment',
      amount: 8_00_000,           // ₹8L, fully exempt (under ₹25L)
      employmentType: 'non_government',
      status: 'expected',
    },
    {
      id: 'rb-nps',
      kind: 'nps_lumpsum',
      label: 'NPS Corpus',
      amount: 30_00_000,          // ₹30L; 60% = ₹18L tax-free, 40% = ₹12L → annuity
      employmentType: 'non_government',
      status: 'expected',
    },
  ],

  // ── Ongoing monthly income (post-retirement) ────────────────────────────────
  income: [
    {
      id: 'inc-pension',
      kind: 'pension_private',
      label: 'Monthly Pension',
      monthlyAmount: 35_000,      // ₹35,000/month
      taxable: true,
    },
    // NPS annuity will be auto-computed from NPS benefit; adding a placeholder here
    // to show the expected annuity income (~6% on ₹12L corpus ≈ ₹6,000/month)
    {
      id: 'inc-nps-annuity',
      kind: 'nps_annuity',
      label: 'NPS Annuity (monthly)',
      monthlyAmount: 6_000,       // approx; actual depends on annuity provider
      taxable: true,
    },
  ],

  // ── Mutual funds ─────────────────────────────────────────────────────────────
  mutualFunds: [
    {
      id: 'mf-equity',
      label: 'HDFC Flexi Cap Fund',
      category: 'equity',
      mode: 'sip',
      monthlyAmount: 10_000,
      investedTotal: 12_00_000,   // ₹12L invested over 10 years
      currentValue: 28_00_000,    // ₹28L current value
      startDate: '2016-04-01',
    },
    {
      id: 'mf-debt',
      label: 'SBI Short Term Debt Fund',
      category: 'debt',
      mode: 'lumpsum',
      investedTotal: 5_00_000,
      currentValue: 6_20_000,
      startDate: '2021-01-01',
    },
    {
      id: 'mf-hybrid',
      label: 'ICICI Pru Balanced Advantage',
      category: 'hybrid',
      mode: 'sip',
      monthlyAmount: 5_000,
      investedTotal: 3_00_000,
      currentValue: 4_50_000,
      startDate: '2022-06-01',
    },
    // Direct stocks
    {
      id: 'stk-reliance',
      label: 'Reliance Industries',
      category: 'stock',
      mode: 'lumpsum',
      investedTotal: 2_00_000,
      currentValue: 3_80_000,
      startDate: '2019-03-01',
      dividendMonthly: 800,
    },
    {
      id: 'stk-tcs',
      label: 'TCS',
      category: 'stock',
      mode: 'lumpsum',
      investedTotal: 1_50_000,
      currentValue: 2_40_000,
      startDate: '2021-07-01',
    },
  ],

  // ── Direct stock holdings ─────────────────────────────────────────────────────
  // (added to mutualFunds array with category: 'stock')
  // These are appended below in mutualFunds.

  // ── No LIC policies in Phase 1 (Phase 2 adds IRR computation) ───────────────
  policies: [],

  // ── Fixed income ─────────────────────────────────────────────────────────────
  fixedIncome: [
    {
      id: 'fi-scss',
      kind: 'scss',
      label: 'SCSS — Post Office',
      amount: 15_00_000,          // ₹15L invested
      ratePct: 8.2,
      maturityDate: '2029-10-01',
      payout: 'quarterly',
    },
    {
      id: 'fi-fd',
      kind: 'fd',
      label: 'SBI Fixed Deposit',
      amount: 10_00_000,
      ratePct: 7.1,
      maturityDate: '2027-03-31',
      payout: 'monthly',
    },
    {
      id: 'fi-ppf',
      kind: 'ppf',
      label: 'PPF (matured)',
      amount: 8_00_000,
      ratePct: 7.1,
      payout: 'cumulative',
    },
  ],

  // ── Cash & savings ───────────────────────────────────────────────────────────
  cash: {
    savingsBalance: 3_00_000,   // ₹3L in savings account
    idleCash: 50_000,           // ₹50K at home / cash
  },

  // ── Gold ─────────────────────────────────────────────────────────────────────
  gold: {
    grams: 150,
    estimatedValue: 12_00_000,  // ₹12L (₹8,000/gram approx)
    form: 'jewellery',
  },

  // ── Property ─────────────────────────────────────────────────────────────────
  property: [
    {
      id: 'prop-home',
      use: 'self_occupied',
      estimatedValue: 1_20_00_000, // ₹1.2 crore home in Pune
    },
  ],

  // ── Loans ────────────────────────────────────────────────────────────────────
  loans: [], // home loan fully paid

  // ── Monthly expenses ─────────────────────────────────────────────────────────
  monthlyExpenses: 55_000, // ₹55,000/month

  // ── Health insurance ─────────────────────────────────────────────────────────
  health: {
    insured: true,
    sumInsured: 10_00_000,
    annualPremium: 28_000,
  },

  riskAppetite: 'moderate',
};
