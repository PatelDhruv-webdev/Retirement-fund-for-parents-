import type { Insights } from '../../../types/insights';
import { fmt } from '../../../utils/format';
import { Card } from '../../ui/Card';

type Props = { insights: Insights };

export function CashFlowSection({ insights }: Props) {
  const { cashFlow, annualTax } = insights;
  const { monthlyIncome, monthlyExpenses, monthlyEMIs, surplus } = cashFlow;
  const surplusPositive = surplus.gte(0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">Monthly Cash Flow</h2>
        <p className="text-stone-500 text-sm">Money in vs money out, every month.</p>
      </div>

      <Card accent={surplusPositive ? 'green' : 'amber'}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-stone-600">Monthly income</span>
            <span className="font-semibold text-green-700">+ {fmt(monthlyIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-600">Monthly expenses</span>
            <span className="font-semibold text-stone-700">− {fmt(monthlyExpenses)}</span>
          </div>
          {monthlyEMIs.gt(0) && (
            <div className="flex justify-between items-center">
              <span className="text-stone-600">EMI repayments</span>
              <span className="font-semibold text-stone-700">− {fmt(monthlyEMIs)}</span>
            </div>
          )}
          <div className={`flex justify-between items-center pt-3 border-t border-stone-200 font-bold text-lg ${surplusPositive ? 'text-green-700' : 'text-amber-700'}`}>
            <span>{surplusPositive ? 'Monthly surplus' : 'Monthly shortfall'}</span>
            <span>{surplusPositive ? '+' : '−'} {fmt(surplus.abs())}</span>
          </div>
        </div>
      </Card>

      {!surplusPositive && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Income is less than expenses by {fmt(surplus.abs())} each month.
          This gap will be covered by drawing down the corpus — which is fine
          if the corpus is large enough (see Longevity below).
        </div>
      )}

      <Card>
        <h3 className="font-semibold text-stone-700 mb-3">
          Income Tax — New Regime (FY 2026-27)
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Annual income</span>
            <span>{fmt(annualTax.grossSlabIncome)}</span>
          </div>
          {annualTax.standardDeduction.gt(0) && (
            <div className="flex justify-between">
              <span className="text-stone-500">Standard deduction</span>
              <span>− {fmt(annualTax.standardDeduction)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-500">Taxable income</span>
            <span>{fmt(annualTax.taxableIncome)}</span>
          </div>
          {annualTax.rebate87A.gt(0) && (
            <div className="flex justify-between text-green-700">
              <span>Sec 87A rebate</span>
              <span>− {fmt(annualTax.rebate87A)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-2 border-t border-stone-100">
            <span>Tax payable</span>
            <span className={annualTax.totalTax.isZero() ? 'text-green-700' : 'text-stone-800'}>
              {annualTax.totalTax.isZero() ? 'NIL ✓' : fmt(annualTax.totalTax)}
            </span>
          </div>
        </div>
        <p className="text-xs text-stone-400 mt-3">
          Does not include capital gains tax (computed separately when you sell investments).
          Consider filing Form 15H to avoid TDS on FD interest.
        </p>
      </Card>
    </div>
  );
}
