import { useState } from 'react';
import type { Insights } from '../../types/insights';
import type { Profile } from '../../types/profile';
import { Button } from '../ui/Button';
import { RetirementTransitionSection } from './sections/RetirementTransitionSection';
import { NetWorthSection } from './sections/NetWorthSection';
import { CashFlowSection } from './sections/CashFlowSection';
import { PortfolioCGSection } from './sections/PortfolioCGSection';
import { LongevitySection } from './sections/LongevitySection';
import { AdvisorySection } from './sections/AdvisorySection';
import { GuiltFreeSpendSection } from './sections/GuiltFreeSpendSection';
import { WithdrawalCalculator } from './sections/WithdrawalCalculator';

type Props = {
  insights: Insights;
  profile: Profile;
  asOf: Date;
  onEdit: () => void;
  onShowGuide: () => void;
  onNewCalculation: () => void;
};

export function Report({ insights, profile, asOf, onEdit, onShowGuide, onNewCalculation }: Props) {
  const [confirmNew, setConfirmNew] = useState(false);

  const name = [
    profile.person.ageDad ? `Dad (${profile.person.ageDad})` : null,
    profile.person.ageMom ? `Mom (${profile.person.ageMom})` : null,
  ].filter(Boolean).join(' & ');

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-white border-b border-stone-100 px-4 py-4 no-print">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-brand-800">Retirement Clarity</h1>
            {name && <p className="text-sm text-stone-500">{name}</p>}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="secondary" onClick={onShowGuide} className="text-sm">
              📚 Tax Guide
            </Button>
            <Button variant="secondary" onClick={() => window.print()} className="text-sm">
              🖨️ Print
            </Button>
            <Button variant="ghost" onClick={onEdit} className="text-sm no-print">
              ✏️ Edit
            </Button>
            <Button variant="ghost" onClick={() => setConfirmNew(true)} className="text-sm no-print">
              🔄 New
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">

        {/* 1. Retirement Transition — hero for about-to-retire */}
        {insights.retirementTransition && (
          <section>
            <RetirementTransitionSection data={insights.retirementTransition} />
          </section>
        )}

        {/* 2. Advisory — "is this enough?" + allocation plan */}
        <section>
          <AdvisorySection advice={insights.allocationAdvice} />
        </section>

        {/* 3. Net Worth buckets */}
        <section>
          <NetWorthSection insights={insights} />
        </section>

        {/* 4. Cash Flow & Tax */}
        <section>
          <CashFlowSection insights={insights} />
        </section>

        {/* 5. Capital gains — full portfolio */}
        {insights.capitalGainsSummary.lines.length > 0 && (
          <section>
            <PortfolioCGSection data={insights.capitalGainsSummary} />
          </section>
        )}

        {/* 6. Longevity */}
        <section>
          <LongevitySection insights={insights} />
        </section>

        {/* 7. Guilt-free spending + fix-it list */}
        <section>
          <GuiltFreeSpendSection insights={insights} />
        </section>

        {/* 8. Interactive withdrawal calculator */}
        {profile.mutualFunds.length > 0 && (
          <section className="no-print">
            <WithdrawalCalculator funds={profile.mutualFunds} asOf={asOf} />
          </section>
        )}

        {/* Tax Guide nudge */}
        <section className="no-print">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center space-y-3">
            <p className="text-blue-800 font-semibold">Want to understand all of this better?</p>
            <p className="text-blue-700 text-sm">
              The Tax &amp; Investment Guide explains income tax slabs, capital gains rules,
              smart strategies, and how to set up monthly income — in plain English.
            </p>
            <Button variant="secondary" onClick={onShowGuide} className="text-sm">
              📚 Open Tax &amp; Investment Guide →
            </Button>
          </div>
        </section>

        <footer className="border-t border-stone-200 pt-6 text-xs text-stone-400 space-y-2">
          <p>
            <strong>Retirement Clarity</strong> — for {name || 'your parents'}.
            Calculated on {asOf.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
          <p>
            FY 2026-27, new regime. Assumptions — portfolio return {insights.longevity.assumedReturnRatePct}%,
            inflation {insights.longevity.assumedInflationRatePct}%.
          </p>
          <p>
            <strong>Disclaimer:</strong> Informational only. Not financial or tax advice.
            Consult a qualified CA / SEBI-registered adviser before important decisions.
          </p>
        </footer>
      </main>

      {/* New calculation confirmation modal */}
      {confirmNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="font-bold text-stone-800 text-lg">Start a new calculation?</h2>
            <p className="text-stone-600 text-sm">
              This will clear all saved data and take you back to the beginning of the form.
              The current report will be lost.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => { setConfirmNew(false); onNewCalculation(); }}
                className="flex-1"
              >
                Yes, start fresh
              </Button>
              <Button variant="ghost" onClick={() => setConfirmNew(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
