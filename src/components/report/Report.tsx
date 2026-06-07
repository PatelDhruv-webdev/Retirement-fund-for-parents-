import type { Insights } from '../../types/insights';
import type { Profile } from '../../types/profile';
import { Button } from '../ui/Button';
import { RetirementTransitionSection } from './sections/RetirementTransitionSection';
import { NetWorthSection } from './sections/NetWorthSection';
import { CashFlowSection } from './sections/CashFlowSection';
import { LongevitySection } from './sections/LongevitySection';
import { GuiltFreeSpendSection } from './sections/GuiltFreeSpendSection';
import { WithdrawalCalculator } from './sections/WithdrawalCalculator';

type Props = {
  insights: Insights;
  profile: Profile;
  asOf: Date;
  onEdit: () => void;
};

export function Report({ insights, profile, asOf, onEdit }: Props) {
  const name = [
    profile.person.ageDad ? `Dad (${profile.person.ageDad})` : null,
    profile.person.ageMom ? `Mom (${profile.person.ageMom})` : null,
  ].filter(Boolean).join(' & ');

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-4 py-4 no-print">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-brand-800">Retirement Clarity</h1>
            {name && <p className="text-sm text-stone-500">{name}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => window.print()} className="text-sm">
              🖨️ Print
            </Button>
            <Button variant="ghost" onClick={onEdit} className="text-sm no-print">
              ✏️ Edit
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">

        {/* Hero: Retirement Transition (only for about_to_retire) */}
        {insights.retirementTransition && (
          <section>
            <RetirementTransitionSection data={insights.retirementTransition} />
          </section>
        )}

        {/* Net Worth */}
        <section>
          <NetWorthSection insights={insights} />
        </section>

        {/* Cash Flow & Tax */}
        <section>
          <CashFlowSection insights={insights} />
        </section>

        {/* Longevity */}
        <section>
          <LongevitySection insights={insights} />
        </section>

        {/* Guilt-free spending & fix-it */}
        <section>
          <GuiltFreeSpendSection insights={insights} />
        </section>

        {/* Withdrawal calculator (only if there are MFs) */}
        {profile.mutualFunds.length > 0 && (
          <section className="no-print">
            <WithdrawalCalculator funds={profile.mutualFunds} asOf={asOf} />
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-stone-200 pt-6 text-xs text-stone-400 space-y-2">
          <p>
            <strong>Retirement Clarity</strong> — for {name || 'your parents'}.
            Calculated on {asOf.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
          <p>
            Tax calculations: FY 2026-27, new regime. Assumptions — portfolio return {insights.longevity.assumedReturnRatePct}%,
            inflation {insights.longevity.assumedInflationRatePct}%.
          </p>
          <p>
            <strong>Disclaimer:</strong> Informational only. Not financial or tax advice.
            Consult a qualified CA before important financial decisions.
          </p>
        </footer>
      </main>
    </div>
  );
}
