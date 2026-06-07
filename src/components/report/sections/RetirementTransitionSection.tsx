import type { RetirementTransitionInsights } from '../../../types/insights';
import { fmtSmart, fmtShort, fmt } from '../../../utils/format';
import { Card } from '../../ui/Card';

type Props = { data: RetirementTransitionInsights };

export function RetirementTransitionSection({ data }: Props) {
  const surplus = data.projectedMonthlySurplus;
  const surplusPositive = surplus.gte(0);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card accent="teal" className="bg-gradient-to-br from-brand-700 to-brand-900 text-white border-0">
        <h2 className="text-xl font-bold mb-1">Your Retirement Picture</h2>
        <p className="text-brand-200 text-sm mb-6">रिटायरमेंट पर एक नजर</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-brand-200 text-sm">Big chunk coming</p>
            <p className="text-2xl font-bold">{fmtShort(data.grossLumpSum)}</p>
            <p className="text-brand-300 text-xs mt-1">Total lump sums</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-brand-200 text-sm">Tax-free</p>
            <p className="text-2xl font-bold text-green-300">{fmtShort(data.taxFreeAmount)}</p>
            <p className="text-brand-300 text-xs mt-1">
              {data.grossLumpSum.gt(0)
                ? `${data.taxFreeAmount.dividedBy(data.grossLumpSum).times(100).toFixed(0)}% of total`
                : '—'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-brand-200 text-sm">Net investable corpus</p>
            <p className="text-2xl font-bold">{fmtShort(data.totalCorpus)}</p>
            <p className="text-brand-300 text-xs mt-1">After tax + existing assets</p>
          </div>
        </div>

        <div className={`rounded-xl p-5 ${surplusPositive ? 'bg-green-800/40' : 'bg-amber-800/40'}`}>
          <p className="text-sm opacity-80 mb-1">Monthly income after retirement</p>
          <p className="text-3xl font-bold">
            {fmt(data.projectedMonthlyIncomeFloor)} / month
          </p>
          <p className="text-sm mt-2 opacity-80">
            {surplusPositive
              ? `Covers expenses with ${fmtShort(surplus)} to spare each month`
              : `Monthly gap of ${fmtShort(surplus.abs())} — draw from corpus`}
          </p>
        </div>
      </Card>

      {/* Lump sum breakdown */}
      <Card>
        <h3 className="font-semibold text-stone-800 mb-4">
          Where the lump sum comes from
        </h3>
        <div className="space-y-3">
          {data.benefitBreakdown.map((b, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 pb-3 border-b border-stone-100 last:border-0">
              <div>
                <p className="font-medium text-stone-800">{b.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{b.exemptionBasis}</p>
                {b.annuityCorpus && b.annuityCorpus.gt(0) && (
                  <p className="text-xs text-brand-700 mt-0.5">
                    + {fmtShort(b.annuityCorpus)} → monthly annuity of ~{fmt(b.estimatedMonthlyAnnuity ?? 0)}/month
                  </p>
                )}
              </div>
              <div className="text-right sm:text-right shrink-0">
                <p className="font-semibold text-stone-800">{fmtSmart(b.grossAmount)}</p>
                <p className="text-xs text-green-700">
                  {fmtShort(b.exemptAmount)} tax-free
                </p>
                {b.taxableAmount.gt(0) && (
                  <p className="text-xs text-amber-700">
                    {fmtShort(b.taxableAmount)} taxable
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tax note */}
      {data.taxOnReceiptYear.gt(0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Tax in the year of retirement:</strong> The taxable portion (
          {fmtSmart(data.taxableAmount)}) adds to slab income. Estimated tax due:{' '}
          {fmtSmart(data.taxOnReceiptYear)}. Consult a CA to plan for this.
        </div>
      )}

      {/* Income breakdown */}
      <Card>
        <h3 className="font-semibold text-stone-800 mb-4">
          How ₹{fmtShort(data.projectedMonthlyIncomeFloor)}/month will come in
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-stone-700">Pension &amp; annuity income</p>
              <p className="text-xs text-stone-400">From pension + NPS annuity</p>
            </div>
            <p className="font-semibold">{fmt(data.projectedMonthlyPension)}/mo</p>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <div>
              <p className="text-stone-700">Interest from corpus</p>
              <p className="text-xs text-stone-400">
                {fmtShort(data.totalCorpus)} at 8.2% (SCSS rate) — conservative estimate
              </p>
            </div>
            <p className="font-semibold">{fmt(data.projectedMonthlyCorpusIncome)}/mo</p>
          </div>
          <div className="flex justify-between items-center font-bold text-stone-800">
            <p>Total monthly income</p>
            <p className="text-lg">{fmt(data.projectedMonthlyIncomeFloor)}/mo</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
