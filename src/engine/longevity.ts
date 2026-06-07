import Decimal from 'decimal.js';

export type LongevityParams = {
  corpus: Decimal;            // investable corpus today (₹)
  monthlyExpenses: Decimal;   // total monthly spending
  monthlyIncome: Decimal;     // guaranteed monthly income (pension + SCSS interest, etc.)
  annualReturnPct: number;    // portfolio return % p.a. (e.g. 7.5)
  annualInflationPct: number; // inflation % p.a. (e.g. 6.0)
  currentAge: number;
};

export type LongevityOutput = {
  ageAtDepletion: number | 'outlasts_120';
  monthsToDepletion: number | 'never';
};

const MAX_AGE = 120;

// Project how long the corpus lasts given monthly withdrawal = expenses - income.
// Uses month-by-month simulation with real return (return - inflation).
export function computeLongevity(params: LongevityParams): LongevityOutput {
  const {
    corpus,
    monthlyExpenses,
    monthlyIncome,
    annualReturnPct,
    annualInflationPct,
    currentAge,
  } = params;

  const monthlyWithdrawal = Decimal.max(monthlyExpenses.minus(monthlyIncome), 0);

  // If no withdrawal needed (income covers expenses), corpus only grows.
  if (monthlyWithdrawal.isZero()) {
    return { ageAtDepletion: 'outlasts_120', monthsToDepletion: 'never' };
  }

  const monthlyReturn = new Decimal(annualReturnPct).dividedBy(1200); // r/12
  const monthlyInflation = new Decimal(annualInflationPct).dividedBy(1200);

  // Real monthly return: (1+r)/(1+i) - 1
  const monthlyRealReturn = monthlyReturn.plus(1)
    .dividedBy(monthlyInflation.plus(1))
    .minus(1);

  let balance = corpus;
  let withdrawal = monthlyWithdrawal;
  const maxMonths = (MAX_AGE - currentAge) * 12;

  for (let m = 1; m <= maxMonths; m++) {
    balance = balance.times(monthlyRealReturn.plus(1)).minus(withdrawal);
    withdrawal = withdrawal.times(monthlyInflation.plus(1)); // inflation-adjust each month

    if (balance.lte(0)) {
      const ageAtDepletion = Math.floor(currentAge + m / 12);
      return { ageAtDepletion, monthsToDepletion: m };
    }
  }

  return { ageAtDepletion: 'outlasts_120', monthsToDepletion: 'never' };
}
