import { useState } from 'react';

type Props = {
  hasSavedData: boolean;
  onContinue: () => void;
  onStartFresh: () => void;
};

export function Welcome({ hasSavedData, onContinue, onStartFresh }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">

      {/* Brand strip */}
      <div className="bg-brand-800 px-6 py-10 text-white">
        <div className="max-w-sm mx-auto">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-2">
            Retirement Clarity
          </p>
          <h1 className="text-3xl font-bold text-white leading-snug mb-3">
            Understand your<br />parents' retirement.
          </h1>
          <p className="text-brand-100 text-base leading-relaxed">
            Enter their financial details once. Get a complete tax, income,
            and longevity picture — in plain language.
          </p>
          <p className="text-brand-300 text-sm mt-2">सेवानिवृत्ति की पूरी तस्वीर</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-6 py-8 flex-1">
        <div className="max-w-sm mx-auto space-y-6">

          <div className="space-y-4">
            {[
              {
                title: 'Complete financial picture',
                desc: 'Pension, mutual funds, FDs, gold, property — all in one place.',
              },
              {
                title: 'Taxes, explained',
                desc: 'Capital gains, income tax, TDS — calculated and explained simply.',
              },
              {
                title: 'What to do next',
                desc: 'Allocation plan, "is this enough?" check, and actionable steps.',
              },
            ].map(b => (
              <div key={b.title} className="flex gap-4 items-start">
                <div className="mt-1 w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-900 leading-tight">{b.title}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-6 space-y-3">
            {hasSavedData ? (
              <>
                <button
                  type="button"
                  onClick={onContinue}
                  className="btn btn-primary w-full"
                >
                  Continue saved session
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="btn btn-ghost w-full text-stone-500"
                >
                  Start fresh
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartFresh}
                className="btn btn-primary w-full"
              >
                Get started
              </button>
            )}
          </div>

          <p className="text-center text-xs text-stone-400 pb-4">
            All data stays on your device — nothing is sent to any server.
            <br />FY 2026-27 · New income tax regime
          </p>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div>
              <h2 className="font-bold text-stone-900 text-lg">Clear saved data?</h2>
              <p className="text-stone-500 text-sm mt-1">
                Your saved details will be removed from this device. You'll start the form from scratch.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setConfirmClear(false); onStartFresh(); }}
                className="btn btn-primary flex-1"
              >
                Yes, clear it
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
