import type { AllocationAdvice } from '../../../types/insights';
import { fmt, fmtSmart, fmtShort } from '../../../utils/format';
import { Card } from '../../ui/Card';
import { Expandable } from '../../ui/Expandable';

type Props = { advice: AllocationAdvice };

const RISK_LABEL: Record<string, string> = {
  conservative: '🛡️ Conservative (सुरक्षित)',
  moderate:     '⚖️ Moderate (संतुलित)',
  aggressive:   '🚀 Aggressive (विकासोन्मुख)',
};

export function AdvisorySection({ advice }: Props) {
  const { enough, allocations, totalProjectedMonthlyIncome, expectedReturnPct, actionItems } = advice;
  const isEnough = enough.isEnough;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Investment Advisory — What Should You Do?
        </h2>
        <p className="text-stone-500 text-sm">
          Based on <strong>{RISK_LABEL[advice.riskAppetite]}</strong> approach
          for a corpus of <strong>{fmtShort(advice.corpus)}</strong>.
        </p>
      </div>

      {/* "Is this enough?" hero */}
      <Card
        accent={isEnough ? 'green' : 'amber'}
        className={isEnough
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl">{isEnough ? '✅' : '⚠️'}</span>
          <div>
            <p className="font-bold text-lg text-stone-800 mb-1">
              {isEnough
                ? 'Yes — you have enough money'
                : 'Corpus may be tight — plan carefully'}
            </p>
            <p className="text-sm text-stone-600 mb-3">
              {isEnough
                ? `The corpus can generate enough interest to cover all expenses without touching the principal.`
                : `The corpus interest alone may not cover expenses. Drawing down principal is needed — which is fine with a good plan.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-stone-400 text-xs mb-0.5">Conservative target</p>
                <p className="font-semibold text-stone-800">{fmtSmart(enough.requiredCorpusConservative)}</p>
                <p className="text-xs text-stone-400">Interest covers expenses (no drawdown)</p>
                <p className={`text-xs font-medium mt-1 ${enough.surplusConservative.gte(0) ? 'text-green-700' : 'text-amber-700'}`}>
                  {enough.surplusConservative.gte(0)
                    ? `✓ Have ${fmtShort(enough.surplusConservative)} extra`
                    : `Need ${fmtShort(enough.surplusConservative.abs())} more`}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-stone-400 text-xs mb-0.5">4% SWR target (25× rule)</p>
                <p className="font-semibold text-stone-800">{fmtSmart(enough.requiredCorpus4PctSWR)}</p>
                <p className="text-xs text-stone-400">Corpus lasts 30+ years with 4% annual withdrawal</p>
                <p className={`text-xs font-medium mt-1 ${enough.surplus4PctSWR.gte(0) ? 'text-green-700' : 'text-amber-700'}`}>
                  {enough.surplus4PctSWR.gte(0)
                    ? `✓ Have ${fmtShort(enough.surplus4PctSWR)} extra`
                    : `Need ${fmtShort(enough.surplus4PctSWR.abs())} more`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Expandable title="📚 What is the 4% rule / SWR? Why two benchmarks?">
        <div className="space-y-2">
          <p>
            <strong>Conservative benchmark:</strong> Put all money in SCSS (8.2%/year). Monthly interest covers expenses.
            Principal stays intact forever. This is the safest approach — no risk of running out of money.
          </p>
          <p>
            <strong>4% Rule (SWR = Safe Withdrawal Rate):</strong> A well-studied rule that says if you withdraw
            4% of your corpus per year and the rest stays invested in a diversified portfolio,
            it will last <em>at least 30 years</em> even through bad markets.
            This requires less corpus because you're also drawing down principal with growth.
          </p>
          <p className="text-xs text-stone-400">
            For Indian conditions (higher inflation), a 3–3.5% withdrawal rate is considered safer long-term.
            The 4% rule was designed for US markets; Indian equity has historically matched or exceeded this.
          </p>
        </div>
      </Expandable>

      {/* Allocation table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">Recommended allocation</h3>
          <div className="text-right">
            <p className="text-xs text-stone-400">Projected monthly income</p>
            <p className="font-bold text-brand-700 text-lg">{fmt(totalProjectedMonthlyIncome)}/mo</p>
            <p className="text-xs text-stone-400">{expectedReturnPct}% blended return</p>
          </div>
        </div>

        <div className="space-y-4">
          {allocations.map((alloc, i) => (
            <div key={i} className="pb-4 border-b border-stone-100 last:border-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <p className="font-semibold text-stone-800 text-sm leading-tight">{alloc.bucket}</p>
                  <p className="text-xs text-brand-700 font-medium">{alloc.instrument}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-stone-800">{fmtShort(alloc.amount)}</p>
                  <p className="text-xs text-green-700">+{fmt(alloc.expectedMonthlyIncome)}/mo</p>
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-1">{alloc.rationale}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                alloc.riskNote.includes('Zero') || alloc.riskNote.includes('Government')
                  ? 'bg-green-100 text-green-700'
                  : alloc.riskNote.includes('Moderate')
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
              }`}>
                {alloc.riskNote}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Action items */}
      <div className="space-y-3">
        <h3 className="font-semibold text-stone-800">
          Your action plan — do these in order
        </h3>
        <div className="space-y-3">
          {actionItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-stone-100 rounded-xl p-4">
              <span className="bg-brand-700 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-stone-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <Expandable title="💡 SCSS — everything you need to know (वरिष्ठ नागरिक बचत योजना)">
        <div className="space-y-2 text-sm">
          <p><strong>Who can open:</strong> Anyone aged 60+, or 55+ who took VRS.</p>
          <p><strong>Maximum deposit:</strong> ₹30 lakh per person. For a couple, both can invest — total ₹60 lakh.</p>
          <p><strong>Interest rate:</strong> {`8.2%`} per annum (revised quarterly by government). Paid quarterly to your bank account.</p>
          <p><strong>Tenure:</strong> 5 years. Can be extended by 3 years once.</p>
          <p><strong>Tax:</strong> Interest is fully taxable at your slab rate. File Form 15H to avoid TDS if total income is below ₹12 lakh.</p>
          <p><strong>Where to open:</strong> Any post office or authorised bank (SBI, ICICI, HDFC, etc.).</p>
          <p className="text-xs text-stone-400">Current quarter: April–June 2026. Rate confirmed by Ministry of Finance.</p>
        </div>
      </Expandable>

      <Expandable title="💡 POMIS — everything you need to know (डाकघर मासिक आय योजना)">
        <div className="space-y-2 text-sm">
          <p><strong>Who can open:</strong> Any Indian resident. No age restriction.</p>
          <p><strong>Maximum deposit:</strong> ₹9 lakh per person, ₹15 lakh in a joint account.</p>
          <p><strong>Interest rate:</strong> {`7.4%`} per annum. Paid monthly to your bank account (auto-credit).</p>
          <p><strong>Tenure:</strong> 5 years. Premature closure allowed after 1 year (with small penalty).</p>
          <p><strong>Tax:</strong> Interest is fully taxable at slab rate. File Form 15H if applicable.</p>
          <p><strong>Where to open:</strong> Any post office in India. Takes 1–2 hours.</p>
        </div>
      </Expandable>

      <div className="text-xs text-stone-400 border-t border-stone-100 pt-4">
        <strong>Note:</strong> This is a general allocation plan based on the information you provided.
        For your exact situation (tax optimisation, estate planning, insurance gaps), consult a
        SEBI-registered fee-only financial planner or a Chartered Accountant.
      </div>
    </div>
  );
}
