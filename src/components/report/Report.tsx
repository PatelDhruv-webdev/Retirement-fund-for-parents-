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

      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-4 no-print sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="section-label">Retirement Clarity</p>
            {name
              ? <p className="font-bold text-stone-900 leading-tight truncate">{name}</p>
              : <p className="font-bold text-stone-900 leading-tight">Your Report</p>
            }
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={onShowGuide} className="text-sm px-3 min-h-[40px]">
              Tax Guide
            </Button>
            <Button variant="ghost" onClick={onEdit} className="text-sm px-3 min-h-[40px] no-print">
              Edit
            </Button>
            <Button variant="ghost" onClick={() => window.print()} className="text-sm px-3 min-h-[40px]">
              Print
            </Button>
            <Button variant="ghost" onClick={() => setConfirmNew(true)} className="text-sm px-3 min-h-[40px] no-print text-stone-400">
              New
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">

        {/* 1. Retirement Transition */}
        {insights.retirementTransition && (
          <section>
            <RetirementTransitionSection data={insights.retirementTransition} />
          </section>
        )}

        {/* 2. Advisory */}
        <section>
          <AdvisorySection advice={insights.allocationAdvice} />
        </section>

        {/* 3. Net Worth */}
        <section>
          <NetWorthSection insights={insights} />
        </section>

        {/* 4. Cash Flow & Tax */}
        <section>
          <CashFlowSection insights={insights} />
        </section>

        {/* 5. Capital Gains */}
        {insights.capitalGainsSummary.lines.length > 0 && (
          <section>
            <PortfolioCGSection data={insights.capitalGainsSummary} />
          </section>
        )}

        {/* 6. Longevity */}
        <section>
          <LongevitySection insights={insights} />
        </section>

        {/* 7. Guilt-free spending */}
        <section>
          <GuiltFreeSpendSection insights={insights} />
        </section>

        {/* 8. Withdrawal calculator */}
        {profile.mutualFunds.length > 0 && (
          <section className="no-print">
            <WithdrawalCalculator funds={profile.mutualFunds} asOf={asOf} />
          </section>
        )}

        {/* Tax Guide nudge */}
        <section className="no-print">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center space-y-3">
            <p className="font-bold text-stone-900">Want to understand all of this better?</p>
            <p className="text-stone-500 text-sm">
              The Tax &amp; Investment Guide explains income tax slabs, capital gains rules,
              smart strategies, and how to set up monthly income — in plain English.
            </p>
            <Button variant="secondary" onClick={onShowGuide} className="text-sm">
              Open Tax &amp; Investment Guide
            </Button>
          </div>
        </section>

        <footer className="border-t border-stone-200 pt-6 text-xs text-stone-400 space-y-2 pb-8">
          <p>
            <strong className="text-stone-600">Retirement Clarity</strong> — for {name || 'your parents'}.
            Calculated on {asOf.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
          <p>
            FY 2026-27, new regime. Portfolio return {insights.longevity.assumedReturnRatePct}%,
            inflation {insights.longevity.assumedInflationRatePct}%.
          </p>
          <p>
            Informational only. Not financial or tax advice.
            Consult a qualified CA / SEBI-registered adviser before important decisions.
          </p>
        </footer>
      </main>

      {/* New calculation modal */}
      {confirmNew && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div>
              <h2 className="font-bold text-stone-900 text-lg">Start a new calculation?</h2>
              <p className="text-stone-500 text-sm mt-1">
                This will clear all saved data. The current report will be lost.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setConfirmNew(false); onNewCalculation(); }} className="flex-1">
                Yes, start fresh
              </Button>
              <Button variant="secondary" onClick={() => setConfirmNew(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
