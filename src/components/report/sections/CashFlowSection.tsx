import type { Insights } from '../../../types/insights';
import { fmt } from '../../../utils/format';
import { Card } from '../../ui/Card';
import { Expandable } from '../../ui/Expandable';

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
          Income is less than expenses by {fmt(surplus.abs())} per month.
          This gap will be covered by drawing down the corpus — which is fine
          if the corpus is large enough (see Longevity below).
        </div>
      )}

      {/* Income tax card with education */}
      <Card>
        <h3 className="font-semibold text-stone-700 mb-3">
          Income Tax — New Regime (FY 2026-27) <span className="text-stone-400 font-normal text-sm">(आयकर)</span>
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Annual income (pension + interest + rent)</span>
            <span>{fmt(annualTax.grossSlabIncome)}</span>
          </div>
          {annualTax.standardDeduction.gt(0) && (
            <div className="flex justify-between text-green-700">
              <span>Standard deduction (मानक कटौती)</span>
              <span>− {fmt(annualTax.standardDeduction)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span className="text-stone-600">Taxable income</span>
            <span>{fmt(annualTax.taxableIncome)}</span>
          </div>
          {annualTax.taxBeforeRebate.gt(0) && (
            <div className="flex justify-between text-stone-500">
              <span>Tax from slabs</span>
              <span>{fmt(annualTax.taxBeforeRebate)}</span>
            </div>
          )}
          {annualTax.rebate87A.gt(0) && (
            <div className="flex justify-between text-green-700">
              <span>Section 87A rebate</span>
              <span>− {fmt(annualTax.rebate87A)}</span>
            </div>
          )}
          {annualTax.cess.gt(0) && (
            <div className="flex justify-between text-stone-400 text-xs">
              <span>Health &amp; Education cess (4%)</span>
              <span>{fmt(annualTax.cess)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t border-stone-100">
            <span>Tax payable this year</span>
            <span className={annualTax.totalTax.isZero() ? 'text-green-700' : 'text-stone-800'}>
              {annualTax.totalTax.isZero() ? 'NIL ✓' : fmt(annualTax.totalTax)}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Expandable title="📚 New tax regime — how slab tax works (नई कर व्यवस्था)" variant="tax">
            <div className="space-y-2 text-xs">
              <p className="font-medium">FY 2026-27 tax slabs (new regime):</p>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-blue-600">
                    <th className="pb-1">Income range</th>
                    <th className="pb-1 text-right">Tax rate</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {[
                    ['Up to ₹4 lakh', '0% — no tax'],
                    ['₹4L – ₹8L', '5%'],
                    ['₹8L – ₹12L', '10%'],
                    ['₹12L – ₹16L', '15%'],
                    ['₹16L – ₹20L', '20%'],
                    ['₹20L – ₹24L', '25%'],
                    ['Above ₹24L', '30%'],
                  ].map(([range, rate]) => (
                    <tr key={range} className="border-b border-blue-100 last:border-0">
                      <td className="py-1 text-stone-700">{range}</td>
                      <td className="py-1 text-right font-medium text-stone-800">{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2">
                <strong>+ 4% cess</strong> on the tax amount (Health &amp; Education cess).
              </p>
              <p className="mt-1">
                <strong>Standard deduction:</strong> ₹75,000 off pension/salary income before tax is calculated.
              </p>
            </div>
          </Expandable>

          {annualTax.rebate87A.gt(0) && (
            <Expandable title="📚 What is Section 87A rebate? (धारा 87A छूट)" variant="tax">
              <p className="text-xs">
                If your total taxable income (after standard deduction) is ₹12 lakh or less,
                the government gives a rebate of up to ₹60,000 on your tax.
                This effectively makes income up to ₹12 lakh <strong>completely tax-free</strong> under the new regime.
                This is why many pensioners with moderate incomes pay zero income tax.
              </p>
            </Expandable>
          )}

          <Expandable title="💡 Form 15H — avoid TDS on FD interest">
            <p className="text-xs">
              If your total income is below the taxable limit (₹12 lakh with std deduction),
              submit <strong>Form 15H</strong> to every bank and post office where you have FDs, SCSS, or POMIS.
              This tells them not to deduct TDS (Tax Deducted at Source) from your interest.
              Submit it every April at the start of the financial year.
              If TDS is already deducted, you can claim it back in your income tax return.
            </p>
          </Expandable>
        </div>

        <p className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">
          Does not include capital gains tax (computed separately — see Portfolio section above).
        </p>
      </Card>
    </div>
  );
}
