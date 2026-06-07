import { useState } from 'react';

type Props = {
  hasSavedData: boolean;
  onContinue: () => void;
  onStartFresh: () => void;
};

export function Welcome({ hasSavedData, onContinue, onStartFresh }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  function handleStartFreshClick() {
    if (hasSavedData) {
      setConfirmClear(true);
    } else {
      onStartFresh();
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">

        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="text-5xl">🏠</div>
          <h1 className="text-3xl font-bold text-brand-800">Retirement Clarity</h1>
          <p className="text-stone-500 text-base leading-relaxed">
            Understand your parents' retirement finances — taxes, investments, and how long their money will last.
          </p>
          <p className="text-stone-400 text-sm">
            सेवानिवृत्ति की पूरी तस्वीर — एक जगह पर
          </p>
        </div>

        {/* What this does */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3 text-sm text-stone-600">
          <p className="font-semibold text-stone-700">What you'll get:</p>
          <ul className="space-y-2">
            {[
              ['💰', 'Net worth across all assets — MFs, FDs, gold, property'],
              ['📊', 'Capital gains tax estimate if investments were sold today'],
              ['🏦', 'Monthly cash flow — pension + interest vs expenses'],
              ['⏳', 'Longevity — how long the corpus lasts at current spending'],
              ['🎯', 'Allocation advice based on risk appetite'],
              ['📚', 'Tax education — plain English, no jargon'],
            ].map(([icon, text]) => (
              <li key={text as string} className="flex gap-2 items-start">
                <span className="shrink-0">{icon}</span>
                <span>{text as string}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-stone-400 border-t border-stone-100 pt-3">
            Everything stays on your device — no account, no server, no data sent anywhere.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          {hasSavedData ? (
            <>
              <button
                type="button"
                onClick={onContinue}
                className="btn btn-primary w-full text-base py-3"
              >
                Continue saved session →
              </button>
              <button
                type="button"
                onClick={handleStartFreshClick}
                className="btn btn-secondary w-full text-sm"
              >
                Start fresh — clear previous data
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartFresh}
              className="btn btn-primary w-full text-base py-3"
            >
              Get started →
            </button>
          )}
        </div>

        <p className="text-center text-xs text-stone-400">
          FY 2026-27 · New income tax regime · Indian retirement rules
        </p>
      </div>

      {/* Confirmation modal */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="font-bold text-stone-800 text-lg">Clear saved data?</h2>
            <p className="text-stone-600 text-sm">
              Your previously entered information will be permanently deleted from this device.
              You'll start the form from scratch.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setConfirmClear(false); onStartFresh(); }}
                className="btn btn-primary flex-1"
              >
                Yes, start fresh
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="btn btn-ghost flex-1"
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
