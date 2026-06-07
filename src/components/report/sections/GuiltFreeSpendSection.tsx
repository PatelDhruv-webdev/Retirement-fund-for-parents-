import type { Insights } from '../../../types/insights';
import { fmt } from '../../../utils/format';
import { Card } from '../../ui/Card';

type Props = { insights: Insights };

export function GuiltFreeSpendSection({ insights }: Props) {
  const { guiltFreeSpend, fixItList } = insights;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          You Can Spend This Freely
        </h2>
        <p className="text-stone-500 text-sm">
          This is your guilt-free number — spend it without worry. (बिना चिंता के खर्च करें)
        </p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-center py-8">
        <p className="text-stone-600 text-lg mb-2">Every month, you can comfortably spend</p>
        <p className="text-5xl font-extrabold text-green-700 mb-2">
          {fmt(guiltFreeSpend)}
        </p>
        <p className="text-stone-500 text-sm">on yourself, without endangering your future</p>
      </Card>

      {fixItList.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">A few things to address:</h3>
          {fixItList.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 text-sm ${
                item.severity === 'warn'
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
            >
              <span className="mr-2">{item.severity === 'warn' ? '⚠️' : 'ℹ️'}</span>
              {item.message}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-stone-400 border-t border-stone-100 pt-4">
        <strong>Disclaimer:</strong> This tool provides information only and is not financial or
        tax advice. Consult a qualified Chartered Accountant before making decisions about
        surrendering LIC policies, choosing a tax regime, or significant investments.
      </div>
    </div>
  );
}
