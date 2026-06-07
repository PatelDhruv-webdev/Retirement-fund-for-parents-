// FY 2026-27 (AY 2027-28) — Income Tax Act 2025, Budget 2026 confirmed no slab changes.
// ⚠️ Re-verify each year against the latest Finance Act before trusting output.

export const FY = '2026-27';

// ── New regime (default under Income Tax Act 2025) ──────────────────────────
// Same slabs for everyone; no senior-citizen bump in the new regime.

export const NEW_REGIME_STANDARD_DEDUCTION = 75_000; // on pension/salary

// Slabs are defined as [upperBound, rate]. upperBound=Infinity for the last slab.
// Tax on each slab = (min(income, upper) - lower) * rate
export const NEW_REGIME_SLABS: ReadonlyArray<{ upTo: number; rate: number }> = [
  { upTo: 400_000,   rate: 0.00 },
  { upTo: 800_000,   rate: 0.05 },
  { upTo: 1_200_000, rate: 0.10 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.20 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity,  rate: 0.30 },
];

export const NEW_REGIME_87A_REBATE_MAX    = 60_000;    // max rebate amount
export const NEW_REGIME_87A_INCOME_LIMIT  = 1_200_000; // rebate only if income ≤ this

// ── Common to both regimes ────────────────────────────────────────────────────
export const CESS_RATE = 0.04; // Health & Education cess

// ── Retirement benefit exemption limits (Sec 10) — FY 2026-27 ───────────────
// These are available under BOTH old and new regime.

export const GRATUITY_EXEMPT_LIMIT_NON_GOVT   = 2_000_000; // ₹20 lakh
export const LEAVE_ENCASHMENT_EXEMPT_LIMIT_NON_GOVT = 2_500_000; // ₹25 lakh
export const VRS_EXEMPT_LIMIT                 = 500_000;   // ₹5 lakh
export const NPS_TAXFREE_FRACTION             = 0.60;      // 60% lump sum tax-free
export const NPS_ANNUITY_FRACTION             = 0.40;      // 40% must buy annuity

// EPF / GPF: tax-free if continuous service ≥ 5 years
export const EPF_MIN_SERVICE_YEARS_EXEMPT     = 5;

// Commuted pension fractions (non-government)
export const COMMUTED_PENSION_EXEMPT_WITH_GRATUITY    = 1 / 3;
export const COMMUTED_PENSION_EXEMPT_WITHOUT_GRATUITY = 1 / 2;

// ── Capital gains — FY 2026-27 ───────────────────────────────────────────────
export const EQUITY_STCG_RATE                 = 0.20;   // Sec 111A, held < 12 months
export const EQUITY_LTCG_RATE                 = 0.125;  // Sec 112A, held ≥ 12 months
export const EQUITY_LTCG_ANNUAL_EXEMPT        = 125_000; // ₹1.25 lakh/year, no indexation

// Gold
export const GOLD_ETF_LTCG_MIN_MONTHS         = 12;
export const GOLD_FOF_LTCG_MIN_MONTHS         = 24;
export const GOLD_LTCG_RATE                   = 0.125;

// Debt funds (units bought on/after 1 Apr 2023): always slab rate, any holding period
export const DEBT_FUND_SLAB_RATE_CUTOFF_DATE  = '2023-04-01';

// ── Small-savings rates (Apr–Jun 2026 quarter — revised quarterly) ────────────
export const SCSS_RATE_PCT                    = 8.2;  // quarterly payout, 5-yr, max ₹30L/person
export const POMIS_RATE_PCT                   = 7.4;  // monthly payout, max ₹9L single/₹15L joint
export const PPF_RATE_PCT                     = 7.1;  // EEE, tax-free
export const NSC_RATE_PCT                     = 7.7;
export const KVP_RATE_PCT                     = 7.5;

// SCSS max investment per person
export const SCSS_MAX_PER_PERSON              = 3_000_000; // ₹30 lakh

// ── Longevity assumptions (conservative, can override in UI) ─────────────────
export const DEFAULT_PORTFOLIO_RETURN_PCT     = 7.5; // blended conservative return
export const DEFAULT_INFLATION_PCT            = 6.0; // standard Indian planning assumption

// Conservative income-floor rate for corpus projection (SCSS rate)
export const CORPUS_INCOME_RATE_PCT           = SCSS_RATE_PCT;
